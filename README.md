# 🚗 Availo - AI Parking Teammate

Your AI-powered parking coordination app that matches drivers leaving spots with those searching for parking in real-time.

## 📊 Status

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/rafaelmaranon/Availo?utm_source=oss&utm_medium=github&utm_campaign=rafaelmaranon%2FAvailo&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🎯 What Makes Availo Special

**AI Teammate Approach**: Unlike simple CRUD apps, Availo features an AI agent that reasons about time overlap, location matching, and provides friendly human responses. You can see the AI "thinking" in real-time through console logging.

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🎮 Demo Flow (60 seconds)

### Step 1: Seed Demo Data
- Click "🎯 Seed Demo Data" button
- Watch counter update to "(3 spots available)"
- Console shows: "✅ Seeded 3 demo parking spots"

### Step 2: Search for Parking
- Location: "Mission Street"
- Arrival Start: Select current date + time (e.g., 2:20 PM)
- Arrival End: Select 15 minutes later (e.g., 2:35 PM)
- Click "🔍 Find Spot"

### Step 3: Watch AI Agent Reasoning
The AI agent displays its step-by-step reasoning:
```
🤖 AI Agent thinking...
📍 Looking for spots near "Mission Street"
⏰ Time window: 2025-01-13T14:20 - 2025-01-13T14:35
📊 Checking 3 available spots...
   Mission & 16th Street: leaving at 2:25:XX PM - ✅ time match
   Dolores Park entrance: leaving at 2:35:XX PM - ✅ time match
   Valencia & 24th: leaving at 2:45:XX PM - ❌ time mismatch
⏱️ Found 2 spots with time overlap
   Mission & 16th Street: 100% location match
   Dolores Park entrance: 50% location match
🎯 Best match: Mission & 16th Street (100% similarity)
```

### Step 4: Get AI Teammate Response
```
🤖 AI Teammate Says:
"Perfect! I found a spot at Mission & 16th Street, available in 5 minutes. Blue Honda Civic, near the coffee shop"
```

With spot details and "📋 Copy Coordinates" button for GPS navigation.

## 🧠 AI Agent Features

### Smart Matching Algorithm
- **Time Overlap**: Filters spots available within arrival window
- **Location Similarity**: Text-based matching with percentage scores
- **Best Match Selection**: Combines time + location for optimal results
- **Human-Friendly Responses**: Natural language explanations

### Transparent Reasoning
- Console logging shows AI decision process
- Step-by-step explanation of matching logic
- Percentage-based location similarity scoring
- Clear success/failure reasoning

## 🛠 Technical Architecture

### Frontend
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Responsive design** with dark/light mode support

### AI Agent
- Custom matching algorithm with time/location logic
- Real-time reasoning display
- Extensible for future ML integration

### State Management
- React hooks for local state
- Prepared for Convex real-time backend integration

## 🎨 Key Components

- **App.tsx**: Main application with AI agent logic
- **Seed Data**: Realistic SF parking spots (Mission, Dolores Park, Valencia)
- **Search Interface**: Location + time window inputs
- **Agent Display**: Console-style reasoning + friendly responses
- **Spot Details**: Copy coordinates, timing, car descriptions

## 🚀 Future Enhancements (Iteration 2+)

1. **Maps Integration**: Mapbox GL JS with interactive pins
2. **Voice Input**: Speech-to-text with NLP parsing for car details
3. **Credit Marketplace**: Economic incentives for posting/claiming spots
4. **Real-time Backend**: Convex integration for live updates
5. **Push Notifications**: Alerts for claimed spots

## ☁️ Cloud Development with Daytona

Availo is ready for instant cloud development and collaboration through Daytona workspaces:

- **[📋 Daytona Setup Guide](docs/daytona-proof.md)** - Complete workspace configuration and proof of concept
- **Zero Setup**: Clone, configure environment variables, and start developing
- **HTTPS Preview**: Test GPS and voice features in secure cloud environment
- **Team Collaboration**: Invite teammates for real-time collaborative development

Perfect for testing location-based features and sharing live demos without local setup complexity.

## 🎭 Demo Script (1 minute)

```
"Meet Availo, your AI parking teammate. Watch this:

[Click Seed] - I'm creating 3 demo spots around SF
[Fill search] - Looking for Mission Street parking at 2:20-2:35 PM  
[Click Find] - Now watch our AI agent think...

See the reasoning? It checks all 3 spots, finds 2 with time overlap, 
scores location match at 100% and 50%, picks the best one.

'Perfect! Found a spot at Mission & 16th, available in 5 minutes. 
Blue Honda Civic near the coffee shop.'

That's the magic - not just matching data, but an AI teammate that 
reasons and explains its decisions like a helpful friend."
```

## 🏆 Why This Demonstrates AI Agent Excellence

1. **Transparent Reasoning**: Shows AI decision-making process
2. **Context Awareness**: Considers time, location, user preferences
3. **Human-Friendly**: Natural language responses, not just data
4. **Real-Time Processing**: Instant matching with live feedback
5. **Extensible**: Foundation for more complex AI behaviors

---

**Built with ❤️ as a compelling AI-first parking coordination demo**
