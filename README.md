# FinGuide - AI Financial Advisor

An interactive AI-powered financial advisor that supports both text and voice interactions. Built with Flask, React, and Hugging Face's language models.

## Features

- 💬 Text-based financial advice
- 🎤 Voice input support
- 🔊 Text-to-speech responses
- 📝 Structured financial guidance
- 🎯 Real-time voice interaction

## Prerequisites

- Python 3.8+
- Node.js 14+
- Hugging Face API token
- Windows OS (for some audio features)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd FinGuide
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add your Hugging Face token
echo HF_TOKEN=your_token_here > .env
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the Flask backend:
```bash
# From the root directory
.\venv\Scripts\activate
python app.py
```

2. Start the React frontend:
```bash
# From the frontend directory
npm start
```

3. Open `http://localhost:3000` in your browser

## API Endpoints

- `POST /generate` - Text-based financial advice
- `POST /speech` - Voice input processing
- `GET /listen` - Real-time voice interaction
- `GET /audio/<filename>` - Audio file serving

## Environment Variables

- `HF_TOKEN` - Hugging Face API token (required)

## Project Structure

```
FinGuide/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FinancialAdvisor.jsx
    │   │   ├── VoiceRecorder.jsx
    │   │   └── AudioPlayer.jsx
    │   ├── styles/
    │   │   └── advisorStyles.js
    │   └── utils/
    │       └── audioUtils.js
    └── package.json
```

## Troubleshooting

- If you encounter audio device issues, ensure your microphone is properly connected and permissions are granted
- For PyAudio installation issues on Windows, use:
  ```bash
  pip install pipwin
  pipwin install pyaudio
  ```
