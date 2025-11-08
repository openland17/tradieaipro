# TradieAI Pro - Quote in 60 Seconds

A simple, fast quote generator for tradies. Type a job description, get an AI-generated quote, edit it, and share it with customers.

## Features

- **AI-Powered Quote Generation**: Describe the job, get a professional quote with line items
- **Editable Quotes**: Modify any field and see totals update instantly
- **Shareable Links**: Save quotes and share read-only links with customers
- **Print Support**: Browser print-to-PDF for professional quotes
- **Graceful Fallback**: Works without AI key using demo quotes
- **Clean UI**: Modern, simple design with lots of whitespace

## Setup

### Prerequisites

- Node.js 18+ and npm
- (Optional) OpenAI API key for AI quote generation

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Create a `.env` file in the `server` directory:
```bash
cd server
```

Create a `.env` file with:
```
OPENAI_API_KEY=your_key_here
PORT=3001
```

Note: The `OPENAI_API_KEY` is optional - the app works without it using demo quotes.

## Running Locally

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production Build

Build both frontend and backend:
```bash
npm run build
```

Start the server:
```bash
cd server
npm start
```

## Running Tests

Run the pricing logic tests:
```bash
npm test
```

Tests should complete in <2 seconds and verify:
- Subtotal/GST/total calculations
- Green waste fee detection
- Currency formatting
- Default pricing application

## Environment Variables

### Server (`server/.env`)

- `OPENAI_API_KEY` (optional): Your OpenAI API key for AI quote generation. If not provided, the app will use demo quotes.
- `PORT` (optional): Server port (default: 3001)

## Technical Decisions

### Architecture

- **Frontend**: React + Vite + TypeScript for fast development and builds
- **Backend**: Express + TypeScript for simple API server
- **Storage**: In-memory Map (simple for MVP, can be replaced with database)
- **Styling**: Plain CSS for minimal dependencies

### Pricing Logic

- Pure functions in `server/src/pricing.ts` for testability
- Green waste fee ($25) automatically added when job mentions lawn/hedge/tree/garden waste
- Default hourly rate: $90/hr if AI doesn't specify
- All calculations round to whole dollars (no cents)
- GST: 10% of subtotal, rounded

### AI Integration

- Uses OpenAI GPT-4o-mini for cost efficiency
- Graceful fallback to demo quote if:
  - No API key provided
  - API call fails
  - Response is invalid JSON
- Validates AI response structure before using

### Share Links

- 8-character alphanumeric slugs
- In-memory storage (quotes lost on server restart)
- Read-only view at `/share/:slug`

## Project Structure

```
tradieaipro/
├── client/              # React frontend
│   ├── src/
│   │   ├── App.tsx      # Main app with routing
│   │   ├── QuoteEditor.tsx  # Main quote editor screen
│   │   ├── SharePage.tsx    # Read-only share page
│   │   └── types.ts     # TypeScript types
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── index.ts     # Express server
│   │   ├── ai.ts        # AI integration
│   │   ├── pricing.ts   # Pricing logic (pure functions)
│   │   ├── storage.ts   # Quote storage
│   │   ├── types.ts     # TypeScript types
│   │   └── __tests__/   # Unit tests
│   └── package.json
└── package.json         # Root package.json
```

## Acceptance Criteria

✅ Type job → Generate → see 3-6 items with totals  
✅ Edit any field → totals update instantly  
✅ Save → working share link with matching read-only quote  
✅ Copy produces clean plain text for SMS/email  
✅ App fully usable without AI key (via demo quote)  
✅ Code is minimal and readable  
✅ README covers: setup, env vars, local dev, running tests  

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions, or [QUICK_START.md](./QUICK_START.md) for a 5-minute quick start guide.

### Quick Deploy Options

- **Render** (Recommended): Free tier available, easy setup
- **Railway**: Great for Node.js apps
- **Fly.io**: Global deployment

All deployment configurations are included in this repository.

## License

MIT

