# Doodle Chat

A real-time chat interface built for the [Doodle Frontend Engineer Challenge](https://github.com/DoodleScheduling/hiring-challenges/tree/master/frontend-engineer).

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** - build tooling
- **Jotai** - atomic state management (write-only action atoms as "methods")
- **CSS Modules** - scoped, zero-runtime styles
- Native `fetch` - no HTTP client library

## Getting Started

### Prerequisites

Run the [Frontend Challenge Chat API](https://github.com/DoodleScheduling/hiring-challenges) locally on port `3000`.

### Setup

```bash
# Install dependencies
npm install

# Copy env config
cp .env.example .env

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL for the chat API |
| `VITE_API_TOKEN` | `super-secret-doodle-token` | Bearer token for API auth |

## Project Structure

```
src/
├── atoms/          # Jotai atoms — state + write-only action atoms
├── components/
│   ├── chat/       # MessageList, MessageBubble, MessageInput
│   └── ui/         # AuthorModal, Spinner
├── lib/            # API client + constants
└── types/          # Shared TypeScript interfaces
```

## Features

- Real-time message polling every 5 seconds
- Auto-scroll to latest message (respects manual scroll)
- Own messages shown on the right, others on the left
- Author name persisted in `localStorage`, clear chat-author value from localStorage set a new author to switch author
- Accessible: `role="log"`, `aria-live`, keyboard navigation, WCAG AA contrast
- Responsive — works on 320px mobile up to desktop
- Respects `prefers-reduced-motion`

## Build

```bash
npm run build
npm run preview
```

## Testing

Run the test suite with [Vitest](https://vitest.dev/):

```bash
# Run tests once
npm test

# Watch mode — re-run on file changes
npm run test:watch
```

**Test Coverage:**
- **Atoms** (`src/atoms/chatAtoms.test.ts`) — State management, message deduplication, polling logic
- **Components** - MessageBubble, MessageInput, AuthorModal, MessageList
- **34 total tests** across 5 test files

Tests use `@testing-library/react` for component testing and Jotai's `createStore` for isolated atom testing.
