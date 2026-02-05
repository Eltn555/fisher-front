# Fisher MiniApp - React Frontend

This is the React frontend for the Telegram MiniApp, converted from the original HTML files.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
miniApp/
├── src/
│   ├── components/
│   │   ├── Form.tsx          # Main form component (converted from form.html)
│   │   ├── Form.css
│   │   ├── UserManagement.tsx # User management component (converted from userManagement.html)
│   │   └── UserManagement.css
│   ├── services/
│   │   └── api.ts             # Centralized API service
│   ├── App.tsx                # Main app component with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts            # Vite configuration
└── .env.example              # Environment variables example
```

## Features

- **Form Component**: Data submission form with support for multiple data types
- **User Management Component**: Admin interface for managing users
- **React Router**: Navigation between pages
- **TypeScript**: Full type safety
- **Telegram WebApp Integration**: Uses Telegram WebApp API

## API Configuration

All API requests are centralized in `src/services/api.ts`. The API base URL is configured via environment variables.

### Environment Variables

Create a `.env` file in the `miniApp` directory (you can copy from `.env.example`):

```bash
# API Base URL
# Leave empty to use relative paths (will be proxied by Vite in development)
# For production, set to your backend API URL
VITE_API_URL=

# Example for production:
# VITE_API_URL=https://your-api-domain.com
# Or for local development with custom port:
# VITE_API_URL=http://localhost:3001
```

**Note:** 
- If `VITE_API_URL` is not set or empty, the app will use relative paths which will be proxied by Vite during development
- In production, set `VITE_API_URL` to your backend API URL
- All environment variables in Vite must be prefixed with `VITE_`

## Development

The Vite dev server is configured to proxy API requests to the backend server running on port 3001. Make sure your NestJS backend is running when developing.

If you set `VITE_API_URL` in your `.env` file, the app will use that URL instead of the proxy.
