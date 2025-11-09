# Vue 3 Admin Template

A production-ready Vue 3 + TypeScript admin template built with Vertical Slice Architecture (VSA).

## Features

- OpenID Connect (OIDC) authentication with PKCE flow
- Provider-agnostic authentication (Keycloak, Entra ID, Auth0, and more)
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
- **Authentication**: OpenID Connect (OIDC) with PKCE

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your OIDC settings:

```bash
cp .env.example .env
```

4. Update the OIDC configuration in `.env` with your identity provider credentials

See the [Identity Provider Setup](#identity-provider-setup) section for provider-specific configuration guides.

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

### OIDC Configuration (Recommended)

All OIDC configuration is managed through environment variables prefixed with `VITE_OIDC_`:

**Core Endpoints:**
- `VITE_OIDC_ISSUER`: OIDC issuer URL for token validation (optional)
- `VITE_OIDC_AUTHORIZATION_ENDPOINT`: Authorization endpoint URL
- `VITE_OIDC_TOKEN_ENDPOINT`: Token endpoint URL
- `VITE_OIDC_USERINFO_ENDPOINT`: UserInfo endpoint URL (optional)
- `VITE_OIDC_END_SESSION_ENDPOINT`: Logout endpoint URL (optional)
- `VITE_OIDC_REVOCATION_ENDPOINT`: Token revocation endpoint URL (optional)

**Client Configuration:**
- `VITE_OIDC_CLIENT_ID`: OAuth client ID
- `VITE_OIDC_REDIRECT_URI`: Redirect URI after login
- `VITE_OIDC_POST_LOGOUT_REDIRECT_URI`: Redirect URI after logout
- `VITE_OIDC_SCOPE`: OAuth scopes (must include `openid`)

**Claims Configuration:**
- `VITE_OIDC_ROLES_CLAIM`: Claim path for extracting user roles (default: `roles`)
- `VITE_OIDC_PERMISSIONS_CLAIM`: Claim path for extracting permissions (default: `permissions`)

### Legacy OAuth Configuration (Deprecated)

The legacy `VITE_OAUTH_*` variables are still supported for backward compatibility but are deprecated:

- `VITE_OAUTH_AUTHORIZATION_ENDPOINT` → Use `VITE_OIDC_AUTHORIZATION_ENDPOINT`
- `VITE_OAUTH_TOKEN_ENDPOINT` → Use `VITE_OIDC_TOKEN_ENDPOINT`
- `VITE_OAUTH_CLIENT_ID` → Use `VITE_OIDC_CLIENT_ID`
- `VITE_OAUTH_REDIRECT_URI` → Use `VITE_OIDC_REDIRECT_URI`
- `VITE_OAUTH_POST_LOGOUT_URI` → Use `VITE_OIDC_POST_LOGOUT_REDIRECT_URI`
- `VITE_OAUTH_SCOPE` → Use `VITE_OIDC_SCOPE`

**Migration Note:** If you're using legacy `VITE_OAUTH_*` variables, see the [OIDC Migration Guide](./docs/OIDC_MIGRATION_GUIDE.md) for migration instructions.

## Identity Provider Setup

This template supports any OpenID Connect (OIDC) compliant identity provider. We provide detailed setup guides for popular providers:

### Supported Providers

- **[Keycloak](./docs/KEYCLOAK_SETUP.md)** - Open-source identity and access management
- **[Microsoft Entra ID (Azure AD)](./docs/ENTRA_ID_SETUP.md)** - Microsoft's cloud identity service
- **[Auth0](./docs/AUTH0_SETUP.md)** - Identity platform for developers

### Quick Start Examples

**Keycloak:**
```bash
VITE_OIDC_ISSUER=https://keycloak.example.com/realms/myrealm
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://keycloak.example.com/realms/myrealm/protocol/openid-connect/auth
VITE_OIDC_TOKEN_ENDPOINT=https://keycloak.example.com/realms/myrealm/protocol/openid-connect/token
VITE_OIDC_CLIENT_ID=vue-admin-template
VITE_OIDC_ROLES_CLAIM=realm_access.roles
```

**Entra ID (Azure AD):**
```bash
VITE_OIDC_ISSUER=https://login.microsoftonline.com/{tenant-id}/v2.0
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_ROLES_CLAIM=roles
```

**Auth0:**
```bash
VITE_OIDC_ISSUER=https://your-tenant.auth0.com/
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://your-tenant.auth0.com/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://your-tenant.auth0.com/oauth/token
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_ROLES_CLAIM=https://yourdomain.com/roles
```

For complete setup instructions, see the provider-specific guides linked above.

## OIDC Migration

If you're migrating from the legacy OAuth configuration to the new OIDC configuration, see the [OIDC Migration Guide](./docs/OIDC_MIGRATION_GUIDE.md) for:

- Step-by-step migration instructions
- Environment variable mapping table
- Testing checklist
- Troubleshooting common issues
- Backward compatibility information

## License

MIT
