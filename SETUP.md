# JARVIS AI Assistant - Setup Guide

Your JARVIS AI Assistant is built and running! To fully activate all features, you need to configure the following API keys in your environment variables.

## Required Environment Variables

### 1. **Grow API Key** (Required for AI responses)
- **Key**: `GROW_API_KEY`
- **Purpose**: Powers the intelligent AI responses using Grow's API
- **How to get it**:
  1. Contact your Grow API provider to get your access token
  2. Copy the token/key
  3. Add it to your environment variables as `GROW_API_KEY`
- **Status**: Required for all AI chat functionality

### 2. **ElevenLabs API Key** (Required for voice synthesis)
- **Key**: `ELEVENLABS_API_KEY`
- **Purpose**: Converts JARVIS text responses into natural-sounding speech
- **How to get it**:
  1. Go to https://elevenlabs.io
  2. Sign up or log in
  3. Navigate to your API keys page
  4. Copy your API key
- **Note**: Uses JARVIS voice preset (Voice ID: BZe5a8p64FSrqTsqdlf5)

### 3. **SearchAPI API Key** (Required for real-time web search)
- **Key**: `SEARCHAPI_API_KEY`
- **Purpose**: Enables JARVIS to search the internet for current information
- **How to get it**:
  1. Go to https://www.searchapi.io
  2. Sign up for a free account
  3. Get your API key from the dashboard
  4. Add it to your environment variables

### 4. **Porcupine Access Key** (Required for wake word detection)
- **Key**: `PORCUPINE_ACCESS_KEY`
- **Purpose**: Enables "Hey Jarvis" voice activation without touching the interface
- **How to get it**:
  1. Go to https://console.picovoice.ai
  2. Create a free account
  3. Create a new access key under "AccessKey"
  4. Copy the key to your environment variables

### 5. **Supabase Configuration** (Required for chat history)
- **Keys**: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Purpose**: Stores conversation history and user preferences
- **How to get it**:
  1. Go to https://supabase.com
  2. Create a new project
  3. Go to Project Settings > API
  4. Copy the "URL" and "anon public" key
  5. Add both to your environment variables

## Adding Environment Variables

### In Vercel (Recommended)
1. Go to your project settings in v0 (top right)
2. Click "Vars" section
3. Add each environment variable key and value
4. Save - they'll be automatically deployed

### Locally (.env.local)
```env
GROW_API_KEY=your_grow_api_token_here
ELEVENLABS_API_KEY=sk_...
SEARCHAPI_API_KEY=...
PORCUPINE_ACCESS_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Features Overview

Once configured, JARVIS will have:

### Voice Control
- Click the glowing orb or say "Hey Jarvis" to activate
- Speak your command - JARVIS listens and understands
- Get voice responses with natural-sounding synthesis

### AI Responses
- Intelligent, context-aware replies using Grow API
- Maintains conversation history across sessions
- Learns from your preferences

### Real-time Search
- JARVIS can search the internet for current information
- Weather updates, news, stock prices, and more
- Integrated into natural conversation flow

### Beautiful Interface
- Futuristic sci-fi design with glowing elements
- Animated orb that responds to your commands
- Holographic panels and visual feedback
- Radar scanning effects during listening

## Testing the Application

### Without API Keys
- The interface will render fully
- Text input will fail with API errors
- Voice features will be disabled

### With API Keys
1. Type a message in the quick actions or input field
2. Click the orb to speak instead
3. JARVIS will respond with voice and text
4. Chat history is automatically saved

## Troubleshooting

**"Chat API error" in console**
- Check that `OPENAI_API_KEY` is set correctly
- Verify the key has available credits
- Try regenerating the API key

**No voice output**
- Verify `ELEVENLABS_API_KEY` is configured
- Check browser audio permissions
- Ensure speaker volume is enabled

**Cannot search**
- Confirm `SEARCHAPI_API_KEY` is valid
- Check that your SearchAPI account has available requests

**Chat history not saving**
- Verify Supabase URL and keys are correct
- Check that the Supabase project is active
- Database tables should auto-create on first use

## Architecture

### Frontend Components
- **JarvisOrb**: Main interactive element with glow effects
- **JarvisInterface**: Main application container
- **ChatWindow**: Conversation history display
- **HologramPanel**: AI response display
- **VoiceWave**: Audio visualization
- **ListeningEffect**: Radar animation during listening

### Backend Routes
- `/api/chat` - AI responses with optional search
- `/api/voice` - Text-to-speech synthesis
- `/api/search` - Web search queries
- `/api/wakeword` - Wake word detection health check

### Hooks
- `useVoice`: Microphone input, audio playback, speech recognition
- `useConversation`: Message handling, API calls, state management
- `useWakeWord`: Wake word detection (Porcupine)

### Libraries
- OpenAI: `gpt-4o-mini` model for intelligence
- ElevenLabs: Text-to-speech with natural voice
- SearchAPI: Real-time web search integration
- Porcupine: Voice wake word detection
- Framer Motion: Smooth animations
- Supabase: Database and chat history

## Support

For issues with:
- **API credentials**: Check the respective service documentation
- **Application code**: Review the error messages in browser console
- **Deployment**: Check Vercel logs and environment variable settings

Enjoy your JARVIS AI Assistant!
