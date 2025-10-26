import os
import uuid
import tempfile
import shutil
import time
import threading
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, url_for, Response
from flask_cors import CORS
from openai import OpenAI
import speech_recognition as sr
from gtts import gTTS
import soundfile as sf

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


def convert_to_wav(src_path: str, dst_path: str):
    try:
        data, samplerate = sf.read(src_path)
        sf.write(dst_path, data, samplerate, format="WAV")
    except Exception as e:
        if src_path.lower().endswith(".wav"):
            shutil.copy(src_path, dst_path)
        else:
            raise RuntimeError(f"Unable to convert audio format: {e}")


@app.route("/audio/<filename>", methods=["GET"])
def serve_audio(filename):
    safe_path = os.path.join(STATIC_AUDIO_DIR, filename)
    if not os.path.exists(safe_path):
        return "File not found", 404
    return send_file(safe_path, mimetype="audio/mpeg")


@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional financial advisor. Provide structured, detailed "
                        "answers with headings, numbered steps, and examples. Avoid repeating "
                        "'As a financial advisor'."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=1200,
            temperature=0.75,
            top_p=0.9,
        )

        response_text = completion.choices[0].message.content
        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/speech", methods=["POST"])
def speech_to_finance():
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

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_tmp) as source:
            audio_data = recognizer.record(source)
            prompt_text = recognizer.recognize_google(audio_data)

        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional financial advisor. Provide detailed, step-by-step "
                        "guidance with examples. Avoid repeating 'As a financial advisor'."
                    ),
                },
                {"role": "user", "content": prompt_text},
            ],
            max_tokens=1200,
            temperature=0.75,
            top_p=0.9,
        )
        response_text = completion.choices[0].message.content

        audio_filename = f"resp-{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(STATIC_AUDIO_DIR, audio_filename)
        tts = gTTS(text=response_text, lang="en")
        tts.save(audio_path)
        audio_url = url_for("serve_audio", filename=audio_filename, _external=True)

        return jsonify(
            {
                "transcribed_text": prompt_text,
                "response_text": response_text,
                "audio_response_url": audio_url,
            }
        )

    except sr.UnknownValueError:
        return jsonify({"error": "Speech recognition could not understand audio"}), 400
    except sr.RequestError as re:
        return jsonify({"error": f"ASR request failed: {re}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for f in temp_files:
            if os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass


# ---------------- NEW REAL-TIME LISTEN ROUTE ----------------
@app.route("/listen", methods=["GET"])
def listen():
    """
    Real-time mic listening with speech recognition, LLM response, and speech output.
    Streams events to the frontend as SSE messages.
    """

    def audio_stream():
        recognizer = sr.Recognizer()
        mic = sr.Microphone()

        with mic as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
        yield "data: Ready to listen 🎤\n\n"

        def callback(recognizer, audio):
            try:
                text = recognizer.recognize_google(audio)
                if not text:
                    return

                yield f"data: Heard: {text}\n\n"

                completion = client.chat.completions.create(
                    model=MODEL_ID,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a financial advisor. Keep responses practical and concise.",
                        },
                        {"role": "user", "content": text},
                    ],
                    max_tokens=250,
                    temperature=0.7,
                )
                response = completion.choices[0].message.content

                audio_filename = f"resp-{uuid.uuid4().hex}.mp3"
                audio_path = os.path.join(STATIC_AUDIO_DIR, audio_filename)
                gTTS(text=response, lang="en").save(audio_path)
                os.system(f'start {audio_path}')  # Plays response on Windows

                yield f"data: AI: {response}\n\n"

            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"

        # Start background listening
        stop_listening = recognizer.listen_in_background(mic, callback)

        try:
            while True:
                yield "data: Listening...\n\n"
                time.sleep(2)
        finally:
            stop_listening(wait_for_stop=False)

    return Response(audio_stream(), mimetype="text/event-stream")


# -------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
