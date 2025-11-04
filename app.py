import os
import uuid
import tempfile
import shutil
import time
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, url_for, Response
from flask_cors import CORS
from openai import OpenAI
import speech_recognition as sr
from gtts import gTTS
import soundfile as sf
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# ---------------- Configuration ----------------
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise RuntimeError("HF_TOKEN not set. Add to .env or environment.")

MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=HF_TOKEN)

STATIC_AUDIO_DIR = os.path.join(tempfile.gettempdir(), "finguide_audio")
os.makedirs(STATIC_AUDIO_DIR, exist_ok=True)
# ------------------------------------------------

# ChromaDB initialization
chroma_client = chromadb.Client(Settings())
collection = chroma_client.get_or_create_collection(name="fin_guide_history")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ------------------------------------------------
def convert_to_wav(src_path: str, dst_path: str):
    try:
        data, samplerate = sf.read(src_path)
        sf.write(dst_path, data, samplerate, format="WAV")
    except Exception as e:
        if src_path.lower().endswith(".wav"):
            shutil.copy(src_path, dst_path)
        else:
            raise RuntimeError(f"Unable to convert audio format: {e}")

def retrieve_from_chroma(query_text: str, k: int = 3) -> str:
    """Retrieve top-k relevant entries from ChromaDB."""
    try:
        query_embedding = embedder.encode([query_text])[0]
        results = collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=k,
        )
        if results and results.get("documents") and results["documents"][0]:
            return "\n\n".join(results["documents"][0])
    except Exception as e:
        print(f"[Chroma Retrieval Error] {e}")
    return ""

@app.route("/audio/<filename>", methods=["GET"])
def serve_audio(filename):
    safe_path = os.path.join(STATIC_AUDIO_DIR, filename)
    if not os.path.exists(safe_path):
        return "File not found", 404
    return send_file(safe_path, mimetype="audio/mpeg")

# ------------------------------------------------
# -------------------------------------------------------------
# Chat session tracking (simple in-memory store)
chat_store = []

def create_chat_session(title=None):
    chat_id = str(uuid.uuid4())
    chat = {
        "id": chat_id,
        "title": title or f"Session {len(chat_store)+1}",
        "timestamp": time.time(),
        "messages": []
    }
    chat_store.append(chat)
    return chat

def find_chat(chat_id):
    return next((c for c in chat_store if c["id"] == chat_id), None)

import json
CHAT_FILE = "chats.json"

# ---------------- Chat Session Persistence ----------------
def load_chats():
    if os.path.exists(CHAT_FILE):
        with open(CHAT_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_chats():
    with open(CHAT_FILE, "w", encoding="utf-8") as f:
        json.dump(chat_store, f, indent=2)

chat_store = load_chats()

def create_chat_session(title=None):
    chat_id = str(uuid.uuid4())
    chat = {
        "id": chat_id,
        "title": title or f"Session {len(chat_store)+1}",
        "timestamp": time.time(),
        "messages": []
    }
    chat_store.append(chat)
    save_chats()  # ✅ persist
    return chat

def find_chat(chat_id):
    return next((c for c in chat_store if c["id"] == chat_id), None)

# ---------------- Modified Generate ----------------
@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        chat_id = data.get("chat_id")

        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # Retrieve context
        context = retrieve_from_chroma(prompt, k=3)

        # Generate response
        system_prompt = (
            "You are a professional financial advisor. "
            "Use the following past context if relevant:\n\n"
            f"{context}\n\n"
            "Provide structured, detailed answers with headings and examples."
        )
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            max_tokens=1200,
            temperature=0.75,
            top_p=0.9,
        )
        response_text = completion.choices[0].message.content.strip()

        # Store in Chroma
        combined_text = prompt + " " + response_text
        doc_embedding = embedder.encode([combined_text])[0]
        collection.add(
            ids=[str(uuid.uuid4())],
            documents=[combined_text],
            embeddings=[doc_embedding.tolist()],
            metadatas=[{
                "input": prompt,
                "response": response_text,
                "timestamp": time.time(),
                "source": "text"
            }]
        )

        # ✅ Create or update chat
        chat = find_chat(chat_id)
        if not chat:
            chat = create_chat_session(title=prompt[:40])  # title from first user prompt
        chat["messages"].append({
            "input": prompt,
            "response": response_text,
            "timestamp": time.time(),
        })
        chat["timestamp"] = time.time()
        save_chats()

        return jsonify({"response": response_text, "chat_id": chat["id"]})

    except Exception as e:
        print(f"[Generate Error] {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/chats", methods=["GET"])
def get_chats():
    """Return all chats with title + timestamp."""
    return jsonify(sorted(chat_store, key=lambda c: c["timestamp"], reverse=True))


@app.route("/history/<chat_id>", methods=["GET"])
def get_chat(chat_id):
    """Return messages for a given chat_id."""
    chat = find_chat(chat_id)
    if not chat:
        return jsonify({"messages": []})
    return jsonify({"messages": chat["messages"]})
# ---------------- Add Sidebar Management ----------------
@app.route("/chat/new", methods=["POST"])
def new_chat():
    data = request.get_json()
    title = data.get("title", None)
    chat = create_chat_session(title)
    return jsonify(chat), 201


@app.route("/chat/<chat_id>/rename", methods=["PUT"])
def rename_chat(chat_id):
    data = request.get_json()
    new_title = data.get("title", "")
    chat = find_chat(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    chat["title"] = new_title or chat["title"]
    chat["timestamp"] = time.time()
    save_chats()
    return jsonify(chat)


@app.route("/chat/<chat_id>/delete", methods=["DELETE"])
def delete_chat(chat_id):
    global chat_store
    chat_store = [c for c in chat_store if c["id"] != chat_id]
    save_chats()
    return jsonify({"success": True})


@app.route("/chat/<chat_id>/pin", methods=["PUT"])
def pin_chat(chat_id):
    chat = find_chat(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    chat["pinned"] = not chat.get("pinned", False)
    save_chats()
    return jsonify({"pinned": chat["pinned"]})

# ------------------------------------------------
def clean_text_for_tts(text):
    """Clean markdown and formatting for natural TTS reading"""
    # Remove markdown symbols but preserve structure
    text = text.replace('*', '')
    text = text.replace('#', '')
    text = text.replace('`', '')
    text = text.replace('_', ' ')
    # Add pauses for better speech flow
    text = text.replace('\n\n', '. ')
    text = text.replace('\n', '. ')
    # Clean up extra spaces and periods
    text = ' '.join(text.split())
    text = text.replace('..', '.')
    return text

@app.route("/speech", methods=["POST"])
def speech_to_finance():
    """ASR input: transcribe → query Chroma for context → respond (no Chroma write)."""
    temp_files = []
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files["audio"]
        if audio_file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        ext = os.path.splitext(audio_file.filename)[1] or ".tmp"
        src_tmp = os.path.join(tempfile.gettempdir(), f"upload-{uuid.uuid4().hex}{ext}")
        audio_file.save(src_tmp)
        temp_files.append(src_tmp)

        wav_tmp = os.path.join(tempfile.gettempdir(), f"upload-{uuid.uuid4().hex}.wav")
        convert_to_wav(src_tmp, wav_tmp)
        temp_files.append(wav_tmp)

        # --- Speech to Text ---
        recognizer = sr.Recognizer()
        recognizer.energy_threshold = 300
        recognizer.dynamic_energy_threshold = True
        recognizer.pause_threshold = 0.8

        with sr.AudioFile(wav_tmp) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio_data = recognizer.record(source)
            prompt_text = recognizer.recognize_google(audio_data)

        # --- Retrieve from ChromaDB ---
        context = retrieve_from_chroma(prompt_text, k=3)

        # --- Generate response using LLM ---
        system_prompt = (
            "You are a professional financial advisor. "
            "Use the following context if relevant:\n\n"
            f"{context}\n\n"
            "Provide clear, natural responses suitable for speaking. "
            "Use conversational language and proper sentence structure."
        )

        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt_text},
            ],
            max_tokens=1200,
            temperature=0.75,
            top_p=0.9,
        )
        response_text = completion.choices[0].message.content

        # Clean text for TTS
        tts_text = clean_text_for_tts(response_text)
        
        # Generate speech with improved settings
        tts = gTTS(
            text=tts_text,
            lang='en',
            slow=False,
            lang_check=False  # Faster processing
        )
        
        audio_filename = f"resp-{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(STATIC_AUDIO_DIR, audio_filename)
        tts.save(audio_path)
        audio_url = url_for("serve_audio", filename=audio_filename, _external=True)

        return jsonify({
            "transcribed_text": prompt_text,
            "response_text": response_text,
            "audio_response_url": audio_url,
            "success": True
        })

    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand audio. Please speak clearly."}), 400
    except sr.RequestError as e:
        return jsonify({"error": f"Speech recognition service error: {str(e)}"}), 500
    except Exception as e:
        print(f"[Speech Error] {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        for f in temp_files:
            try:
                if os.path.exists(f):
                    os.remove(f)
            except Exception:
                pass

@app.route("/history", methods=["GET"])
def get_history():
    """Return stored conversation history from ChromaDB."""
    try:
        # ✅ Correct include options — no "ids"
        results = collection.get(include=["metadatas", "documents"])
        
        history = []
        for i in range(len(results["metadatas"])):
            meta = results["metadatas"][i]
            doc = results["documents"][i]

            history.append({
                "input": meta.get("input", "N/A"),
                "response": meta.get("response", "N/A"),
                "timestamp": meta.get("timestamp", 0),
                "audio_url": meta.get("audio_url", None)
            })

        # Sort newest first
        history.sort(key=lambda x: x["timestamp"], reverse=True)
        return jsonify(history)

    except Exception as e:
        print(f"[History Error] {e}")
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
