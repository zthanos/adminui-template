# Vue 3 Admin Template

A production-ready Vue 3 + TypeScript admin template built with Vertical Slice Architecture (VSA).

## Features

- OAuth 2.0 authentication with PKCE (Entra ID)
- Role-based access control (RBAC)
- User management interface
- Activity tracking and audit logs
- Responsive layout with collapsible sidebar
- Light/dark theme support
- Global notification system
- Breadcrumb navigation

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS + DaisyUI
- **Authentication**: OAuth 2.0 with PKCE

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your OAuth settings:

```bash
cp .env.example .env
```

4. Update the OAuth configuration in `.env` with your Entra ID credentials

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── features/           # Feature slices (self-contained modules)
│   ├── auth/          # Authentication slice
│   ├── users/         # User management slice
│   ├── activity/      # Activity tracking slice
│   └── dashboard/     # Dashboard slice
├── shared/            # Cross-cutting concerns
│   ├── ui/           # Reusable UI components
│   ├── types/        # Global TypeScript interfaces
│   ├── composables/  # Shared composables
│   ├── guards/       # Router guards
│   └── utils/        # Utility functions
├── layouts/          # Layout components
└── router/           # Router configuration
```

## RBAC Permission System

The template includes a comprehensive role-based access control system for managing user permissions.

### Using the usePermissions Composable

```typescript
import { usePermissions } from '@/shared/composables/usePermissions'

const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

// Check single permission
if (hasPermission('manage_users')) {
  // User has permission
}

// Check multiple permissions (OR logic)
if (hasAnyPermission(['manage_users', 'view_users'])) {
  // User has at least one permission
}

// Check multiple permissions (AND logic)
if (hasAllPermissions(['manage_users', 'delete_users'])) {
  // User has all permissions
}
```

### Using the v-permission Directive

The `v-permission` directive conditionally renders elements based on user permissions:

```vue
<!-- Single permission -->
<button v-permission="'manage_users'">Manage Users</button>

<!-- Multiple permissions (OR logic - default) -->
<div v-permission="['manage_users', 'view_users']">
  User management content
</div>

<!-- Multiple permissions (AND logic) -->
<div v-permission.all="['manage_users', 'delete_users']">
  Advanced user management
</div>
```

### Route-Level Permissions

Routes can require specific permissions in their metadata:

```typescript
{
  path: '/users',
  name: 'users',
  component: UsersView,
  meta: {
    requiresAuth: true,
    permission: 'manage_users',
    breadcrumb: 'User Management',
  },
}
```

The authentication guard automatically checks these permissions and redirects unauthorized users.

## Environment Variables

All OAuth configuration is managed through environment variables prefixed with `VITE_OAUTH_`:

- `VITE_OAUTH_AUTHORIZATION_ENDPOINT`: OAuth authorization endpoint
- `VITE_OAUTH_TOKEN_ENDPOINT`: OAuth token endpoint
- `VITE_OAUTH_CLIENT_ID`: OAuth client ID
- `VITE_OAUTH_REDIRECT_URI`: OAuth redirect URI
- `VITE_OAUTH_POST_LOGOUT_URI`: Post-logout redirect URI
- `VITE_OAUTH_SCOPE`: OAuth scopes (space-separated)

## License

MIT
