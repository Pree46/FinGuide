# FinGuide - AI Financial Advisory Platform

<p align="center">
  <img src="frontend/src/assets/logo.png" alt="FinGuide Logo" width="200"/>
</p>

## Overview
FinGuide is an interactive AI-powered financial advisory platform that combines advanced language models with speech recognition to provide personalized financial guidance. Built with a modern tech stack, it offers both text and voice-based interactions in an intuitive chat interface.

## 🌟 Key Features

- 💬 Multiple chat sessions with persistent history
- 🎙️ Voice input with real-time transcription
- 🔊 Text-to-speech response generation
- 📝 Rich text formatting with markdown support
- 🤖 Context-aware responses using ChromaDB
- 🎨 Modern, responsive UI with gradient effects
- 💾 Session persistence and chat management
- 🔄 Real-time speech-to-text conversion

## 🛠️ Technology Stack

### Backend
- Flask server with CORS support
- OpenAI/Hugging Face API integration
- ChromaDB for conversation history
- Speech recognition with Google Speech API
- gTTS for text-to-speech conversion
- SentenceTransformer for embeddings

### Frontend
- React.js with modern component architecture
- Axios for API communication
- Iconify for UI icons
- Custom styled components
- Audio processing utilities
- Markdown rendering

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI/Hugging Face API token
- Chrome/Firefox (for best audio support)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Pree46/FinGuide.git
cd FinGuide
```

2. Backend setup:
```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend setup:
```bash
cd frontend
npm install
```

4. Environment configuration:
Create `.env` file in root directory:
```env
HF_TOKEN=your_hugging_face_token_here
```

## 🏃‍♂️ Running the Application

1. Start the backend:
```bash
python app.py
```

2. Start the frontend:
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## 📋 Features in Detail

### Chat Management
- Create, rename, and delete chat sessions
- Persistent chat history
- Context-aware responses
- Markdown formatting support

### Voice Integration
- Real-time voice recording
- Speech-to-text conversion
- Text-to-speech responses
- Audio playback controls

### UI Components
- Modern sidebar with chat management
- Responsive chat window
- Voice recording interface
- Audio playback controls
- Loading states and error handling

## 🔧 Project Structure
```
FinGuide/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.png  # FinGuide logo
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   └── AudioPlayer.jsx
│   │   └── styles/
│   │       └── chatLayout.js
│   └── package.json
└── .env
```

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.


## 🙏 Acknowledgments
- OpenAI/Hugging Face for AI models
- Google Speech Recognition API
- ChromaDB for vector storage
- React community for UI components