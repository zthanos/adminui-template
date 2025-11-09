# Technology Stack

## Core Technologies

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS + DaisyUI
- **Authentication**: OAuth 2.0 with PKCE (Entra ID)

## Key Libraries

- DaisyUI for pre-built UI components (buttons, cards, inputs, tables, drawer, alerts)
- OAuth 2.0 client library for authentication flows
- HTTP client for API communication

## Environment Configuration

OAuth configuration is managed through environment variables prefixed with `VITE_OAUTH_`:
- Authorization endpoint
- Token endpoint
- Client ID
- Redirect URI
- Post-logout URI

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Preview production build
npm run preview
```

## DaisyUI Configuration

Enabled themes: light, dark, corporate. Theme switching is managed via the `data-theme` attribute on the HTML root element.
