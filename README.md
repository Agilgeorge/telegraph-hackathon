# TrustMesh

TrustMesh is a full-stack verification system designed to help AI agents decide whether information is trustworthy before acting on it. It combines a Next.js frontend with a TypeScript Express API that analyzes text and URL inputs, extracts claims, routes them through intelligence providers, and produces a decision with trust scoring and evidence.

The project is built around the idea of an "agent decision firewall": before a model or workflow takes an action, it can verify the source, assess risk, and surface the reasoning behind the decision.

## Features

- AI-agent safety layer for evaluating uncertain instructions and claims
- URL and text verification flow
- Claim extraction and action-risk classification
- Intelligence intent routing and parallel signal collection
- Evidence fusion and trust-scoring logic
- Decision output with rationale, evidence, and confidence score
- Real-time frontend dashboard for verification results
- History tracking for prior verification requests

## Tech Stack

- Frontend: Next.js 16 + React 19 + TypeScript
- Backend: Node.js + Express + TypeScript
- Verification pipeline: custom claim extraction, ranking, and scoring logic
- UI styling: Tailwind CSS
- Data/telegraph integrations: custom service-based routing layer

## Repository Structure

```text
telegraph-hackathon/
├── client/                 # Next.js frontend
│   ├── app/                # App pages, UI, hooks, components
│   ├── public/             # Static assets
│   ├── package.json
│   └── tsconfig.json
├── server/                 # Express API and verification engine
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── telegraph/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── miners.json             # Miner metadata / source definitions
├── package.json            # Root scripts for running frontend/backend
├── README.md              # Project documentation
└── package-lock.json
```

## Prerequisites

Before starting, make sure you have:

- Node.js 18+
- npm
- A terminal for running the client and server together

## Installation

Install dependencies for each app:

```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

## Environment Configuration

### Server
Create a `.env` file inside `server/`:

```env
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Client
Create a `.env.local` file inside `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running the Application

From the repository root:

```bash
npm run dev:server
```

In a second terminal:

```bash
npm run dev:client
```

Then open:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Root Scripts

The root `package.json` includes convenience scripts:

```bash
npm run dev:server   # start the Express backend
npm run dev:client   # start the Next.js frontend
npm run build:server # compile the server
npm run build:client # build the frontend
npm run build        # build both apps
npm run lint         # lint the frontend
npm test            # build server and lint client
```

## How It Works

1. A user submits a URL or text snippet in the frontend.
2. The client sends the input to the backend verification API.
3. The server validates the request and routes it into the verification pipeline.
4. The system extracts content and claims, classifies the risk, and builds intent requests.
5. It calls intelligence sources through the Telegraph-style provider layer.
6. Signals are normalized, fused with evidence, and scored.
7. The result includes a decision, rationale, trust score, and supporting evidence.

## Verification Flow

```text
Input (URL or text)
   ↓
Request validation
   ↓
Content extraction / claim detection
   ↓
Intent routing
   ↓
Parallel signal collection
   ↓
Evidence fusion + scoring
   ↓
Decision + rationale output
```

## Important Notes

- The frontend calls the backend at `NEXT_PUBLIC_API_URL`.
- The backend enforces basic request validation and rate limiting.
- Public URLs are validated before they are processed.
- The verification service is designed to be extended with additional miners or evidence sources.

## Development Notes

- UI work happens in `client/app/`
- API logic lives under `server/src/`
- Service logic for verification, scoring, and evidence handling is centralized under `server/src/services/`
- Add or adjust miners in `miners.json` when you expand source coverage

## Contributing

Contributions are welcome. If you are improving the verification logic, UI, or data providers:

1. Create a feature branch
2. Make focused changes
3. Run the relevant build/lint checks
4. Submit a pull request with a clear description of the improvement

## License

This project is currently configured without a custom license file. If you plan to distribute or commercialize it, add an appropriate license before publishing.

## Status

TrustMesh is a functional prototype for secure AI verification and decision-making workflows. It is designed to be extended for production-grade trust evaluation, additional provider integrations, and operational monitoring.
