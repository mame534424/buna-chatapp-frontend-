# ChatApp — Frontend

Professional, production-ready React frontend built with Vite for the ChatApp project.

This repository contains the single-page application (SPA) that provides the chat user interface, authentication flows, file uploads, and realtime messaging support.

**Status:** Active development

**Table of Contents**

- Project Overview
- Demo
- Backend
- Features
- Tech stack
- Getting started
- Environment
- Scripts
- Contributing
- License

**Project Overview**

This frontend implements the client UI for ChatApp. It connects to a separate backend service (API and realtime server) to authenticate users, persist conversations, and deliver messages.

**Demo**

- Video demo: [Loom demo](https://www.loom.com/share/cdb823166c1a49cd86554143cf43f1d1)

[![Watch demo](.github/demo-placeholder.svg)](https://www.loom.com/share/cdb823166c1a49cd86554143cf43f1d1)

Click the image to open the Loom video in a new tab.

**Backend**

The backend for this project is maintained in a separate repository. Replace the URL below with the canonical backend repo for this application:

- Backend repository: https://github.com/mame534424/buna-chatapp

Include the backend README for API docs, environment variables, database migrations, and deployment instructions.

**Features**

- Email/password authentication, signup, verification, and password reset
- Real-time messaging using WebSocket provider
- User avatars and file attachments with upload/preview
- Group conversations and participant management
- Responsive UI components and accessible form handling

**Tech Stack**

- React + Vite
- Context API for auth and WebSocket provider
- Axios for HTTP requests
- Lightweight component structure (see `src/components`)

**Getting started (local development)**

Prerequisites:

- Node.js 16+ and npm

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open the app at `http://localhost:5173` (or the address shown by Vite).

**Environment**

Create a `.env` or `.env.local` file at the project root and set backend-related variables (example names — confirm with backend README):

```
VITE_API_BASE_URL=https://api.example.com
VITE_WS_URL=wss://realtime.example.com
```

**Scripts**

- `npm run dev` — start development server
- `npm run build` — build production assets
- `npm run preview` — locally preview production build

**Contributing**

Please read the contributing guidelines in the backend repo and open issues or PRs against this repository for frontend changes. Keep UI changes focused and include screenshots or a short demo when relevant.

**License**

This project is provided under the [MIT License](LICENSE) unless otherwise noted.

---

If you want, I can: (1) add a real demo embed, (2) link the exact backend repo URL, or (3) add a CONTRIBUTING.md. Which would you like next?
