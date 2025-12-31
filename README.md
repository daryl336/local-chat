# Lumina

A sleek, modern chat interface for your local LLM. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Chat with your local LLM** - Connect to any OpenAI-compatible API
- **Streaming responses** - Real-time token streaming for a smooth experience
- **Agent configurations** - Create custom system prompts for different use cases
- **Chat history** - All conversations stored locally in IndexedDB
- **Dark theme** - Beautiful dark blue design
- **Responsive** - Works on desktop and mobile

## Prerequisites

- Node.js 18+
- A running local LLM backend (like [local-llm](https://github.com/your-repo/local-llm))

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd local-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the API URL**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` to point to your local LLM backend:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**

   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main chat page
│   └── globals.css        # Global styles & theme
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Sidebar, Header
│   ├── chat/              # Chat components
│   └── agents/            # Agent configuration
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api/              # API client
│   ├── storage/          # IndexedDB operations
│   └── utils/            # Utilities
├── stores/               # Zustand state stores
└── types/                # TypeScript definitions
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Storage**: Dexie (IndexedDB)
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm

## API Compatibility

Lumina connects to any OpenAI-compatible API. Required endpoints:

- `POST /v1/chat/completions` - Chat with streaming support
- `GET /models/status` - Model status check
- `GET /health` - Health check

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL

### Self-hosted

```bash
npm run build
npm start
```

## License

MIT
