# 3F1 - Three Faction Intelligence

## Project Overview
A professional AI debate platform where three configurable AI agents engage in structured 5-round debates on user-provided topics. The system supports multiple AI providers (OpenAI, Gemini, Perplexity, and custom APIs) and provides real-time debate streaming with transcript download capabilities.

## Architecture

### Frontend (React + TypeScript)
- **Landing Page**: Professional hero section with gradient branding and feature highlights
- **Debate Configuration**: Three agent cards for configuring provider, model, and API keys
- **Live Debate Feed**: Real-time streaming of debate messages with animations
- **Transcript Download**: Export debates in JSON or plain text format

### Backend (Node.js + Express)
- **Provider Adapters**: Separate modules for OpenAI, Gemini, Perplexity, and custom API integrations
- **Debate Orchestrator**: Manages 5-round debate flow with context management and agent coordination
- **SSE Endpoint**: Streams debate messages to frontend in real-time

### Key Features
- Multi-provider AI integration with secure API key handling (keys not persisted)
- 5-round structured debates with cross-referencing requirements
- Context trimming to manage token limits (max 20 messages)
- Real-time streaming with Server-Sent Events
- Professional black and orange color scheme
- Smooth animations using Framer Motion
- Download transcripts in JSON or TXT format

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Wouter (routing)
- **Backend**: Express.js, TypeScript
- **AI SDKs**: OpenAI SDK, Google Generative AI SDK
- **State Management**: React hooks with real-time updates
- **Validation**: Zod schemas for type-safe API contracts

## Project Structure
```
client/
  src/
    components/         # Reusable UI components
    pages/             # Route pages (Landing, Home/Debate)
    lib/               # Client utilities
server/
  lib/
    providers/         # AI provider adapters
    debateOrchestrator.ts  # Core debate logic
  routes.ts            # API endpoints
shared/
  schema.ts            # Shared TypeScript types and Zod schemas
```

## Development Notes
- No database - API keys are never persisted for security
- Agent system prompts include instructions to reference previous arguments
- Final round (round 5) requires agents to provide "Oppose" stance
- Context history is trimmed to last 20 messages to avoid token limits
- Error handling includes fallback mechanisms and user-friendly toast notifications

## Color Scheme
- Primary (Orange): Used for CTAs and highlights
- Secondary (Black/Dark): Used for professional contrast
- Accent: Light orange tints for backgrounds
- Clean, minimal design with ample spacing
