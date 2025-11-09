Feature Guide
=============

This guide provides detailed documentation for all features available in the Vue 3 Admin Template.

Table of Contents
-----------------

-   Authentication

-   Authorization & Permissions

-   User Management

-   Activity Tracking

-   Dashboard

-   Theme System

-   Notifications

-   Navigation

-   Layout System

* * * * *

Authentication
--------------

The template uses OpenID Connect (OIDC) with PKCE flow for secure authentication.

### Features

-   PKCE Flow: Implements OAuth 2.0 PKCE (Proof Key for Code Exchange) for enhanced security

-   Provider Agnostic: Works with any OIDC-compliant provider (Keycloak, Entra ID, Auth0, etc.)

-   Token Management: Automatic token refresh and expiry monitoring

-   Session Handling: Secure session management with automatic cleanup

-   Single Logout: Proper logout with token revocation and provider session termination

### Authentication Store

The `authStore` (Pinia) manages all authentication state:

```typescript

import { useAuthStore } from '@/features/auth/stores/authStore'

const authStore = useAuthStore()

// State
authStore.isAuthenticated  // boolean
authStore.user             // UserProfile | null
authStore.accessToken      // string | null
authStore.idToken          // string | null
authStore.userRoles        // string[]
authStore.userPermissions  // string[]

// Actions
await authStore.initiateLogin()
await authStore.handleCallback(code)
await authStore.logout()
await authStore.refreshToken()
```
### Login Flow

1.  User clicks login button

2.  `initiateLogin()` generates PKCE challenge and redirects to provider

3.  Provider authenticates user and redirects to callback URL with authorization code

4.  `handleCallback()` exchanges code for tokens using PKCE verifier

5.  User profile is fetched and stored

6.  Token monitoring starts automatically

### Token Refresh

Tokens are automatically refreshed when:

-   Access token expires or is about to expire (5-minute buffer)

-   Token monitoring runs every 60 seconds

-   Refresh token is available

If refresh fails, user is automatically logged out.

### Configuration

Set OIDC configuration via environment variables:

```env

VITE_OIDC_ISSUER=https://your-provider.com
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://your-provider.com/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://your-provider.com/token
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/login
VITE_OIDC_SCOPE=openid profile email
```
* * * * *

Authorization & Permissions
---------------------------

Role-Based Access Control (RBAC) with fine-grained permissions.

### Permission System

Permissions are extracted from ID token claims and stored in the user profile. The system supports:

-   Single permission checks: Does user have permission X?

-   Multiple permission checks (OR): Does user have permission X OR Y?

-   Multiple permission checks (AND): Does user have permission X AND Y?

-   Role-based checks: Does user have role X?

### Using the usePermissions Composable

```typescript

import { usePermissions } from '@/shared/composables/usePermissions'

const {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  userPermissions,
  userRoles
} = usePermissions()

// Single permission check
if (hasPermission('manage_users')) {
  // User can manage users
}

// Multiple permissions (OR logic)
if (hasAnyPermission(['manage_users', 'view_users'])) {
  // User has at least one permission
}

// Multiple permissions (AND logic)
if (hasAllPermissions(['manage_users', 'delete_users'])) {
  // User has all permissions
}

// Role checks
if (hasRole('admin')) {
  // User is admin
}

// Reactive access to permissions
console.log(userPermissions.value) // ['manage_users', 'view_audit_logs']
console.log(userRoles.value)       // ['admin', 'user']
```

### Using the v-permission Directive

Conditionally render elements based on permissions:

```vue

<template>
  <!-- Single permission -->
  <button v-permission="'manage_users'">
    Manage Users
  </button>

  <!-- Multiple permissions (OR logic - default) -->
  <div v-permission="['manage_users', 'view_users']">
    User management content
  </div>

  <!-- Multiple permissions (AND logic) -->
  <div v-permission.all="['manage_users', 'delete_users']">
    Advanced user management
  </div>
</template>
```


Elements without required permissions are hidden (`display: none`).

### Route-Level Protection

Protect routes with permission requirements:

```typescript

{
  path: '/users',
  name: 'users',
  component: UsersView,
  meta: {
    requiresAuth: true,
    permission: 'manage_users',  // Required permission
    breadcrumb: 'User Management',
  },
}
```
The `authGuard` automatically:

-   Checks if route requires authentication

-   Verifies user has required permission

-   Redirects to login or error page if unauthorized

### Configuring Claims

Configure which token claims contain roles and permissions:

```env

# Default: roles
VITE_OIDC_ROLES_CLAIM=roles

# Default: permissions
VITE_OIDC_PERMISSIONS_CLAIM=permissions

# Nested claims (e.g., Keycloak)
VITE_OIDC_ROLES_CLAIM=realm_access.roles

# Custom namespace (e.g., Auth0)
VITE_OIDC_ROLES_CLAIM=https://yourdomain.com/roles
```
* * * * *


User Management
---------------

Comprehensive user management interface for administrators.

### Features

-   User Listing: Paginated table with search and filtering

-   Role Assignment: Assign/remove roles from users

-   User Details: View detailed user information

-   Status Management: Enable/disable user accounts

-   Bulk Actions: Perform actions on multiple users

### Required Permission

`manage_users` - Required to access user management features

### User Table

The user table displays:

-   User ID

-   Display name

-   Email

-   Roles (badges)

-   Status (active/inactive)

-   Last login timestamp

-   Actions (edit, delete)

### User Operations

```typescript

import { useUserStore } from '@/features/users/stores/userStore'

const userStore = useUserStore()

// Fetch users
await userStore.fetchUsers()

// Update user
await userStore.updateUser(userId, {
  displayName: 'New Name',
  roles: ['admin', 'user']
})

// Delete user
await userStore.deleteUser(userId)

// Search users
userStore.searchQuery = 'john'
```

### Integration with Backend

User management requires a backend API. The template expects these endpoints:

-   `GET /api/users` - List users

-   `GET /api/users/:id` - Get user details

-   `PATCH /api/users/:id` - Update user

-   `DELETE /api/users/:id` - Delete user

All requests include the access token in the Authorization header.

* * * * *

Activity Tracking
-----------------

Audit logging system for tracking user actions and system events.

### Features

-   Activity Logs: Chronological list of all activities

-   Filtering: Filter by user, action type, date range

-   Search: Full-text search across activity descriptions

-   Export: Export logs for compliance reporting

-   Real-time Updates: Optional real-time activity feed

### Required Permission

`view_audit_logs` - Required to access activity logs

### Activity Log Structure

Each activity log entry contains:

-   Timestamp

-   User (who performed the action)

-   Action type (login, logout, create, update, delete)

-   Resource (what was affected)

-   Description (human-readable description)

-   IP address

-   User agent

### Using Activity Store

```typescript

import { useActivityStore } from '@/features/activity/stores/activityStore'

const activityStore = useActivityStore()

// Fetch activities
await activityStore.fetchActivities()

// Filter by date range
activityStore.dateRange = {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
}

// Filter by action type
activityStore.actionFilter = 'login'

// Search
activityStore.searchQuery = 'user created'
```
### Backend Integration

Activity tracking requires backend API endpoints:

-   `GET /api/activities` - List activities with pagination

-   `GET /api/activities/:id` - Get activity details

-   `POST /api/activities/export` - Export activities

* * * * *

Dashboard
---------

Overview dashboard with key metrics and quick actions.

### Features

-   Metrics Cards: Display key statistics (users, activities, etc.)

-   Recent Activity: Quick view of recent system activities

-   Quick Actions: Shortcuts to common tasks

-   Charts: Visual representation of data (optional)

-   Customizable Widgets: Add/remove dashboard widgets

### Dashboard Widgets

The dashboard supports various widget types:

-   Stat cards (total users, active sessions, etc.)

-   Activity feed

-   Quick action buttons

-   Charts and graphs

-   Alerts and notifications

### Customization

Users can customize their dashboard by:

-   Rearranging widgets (drag and drop)

-   Showing/hiding widgets

-   Configuring widget settings

* * * * *

Theme System
------------

Multi-theme support with light, dark, and corporate themes.

### Features

-   Multiple Themes: Light, dark, and corporate themes

-   Theme Persistence: Selected theme saved to localStorage

-   Instant Switching: No page reload required

-   System Integration: Uses DaisyUI theme system

### Using the useTheme Composable

```typescript

import { useTheme } from '@/shared/composables/useTheme'

const { currentTheme, setTheme, toggleTheme, loadTheme } = useTheme()

// Get current theme
console.log(currentTheme.value) // 'light' | 'dark' | 'corporate'

// Set specific theme
setTheme('dark')

// Toggle through themes
toggleTheme() // light -> dark -> corporate -> light

// Load saved theme
loadTheme()
```

### Theme Toggle Component

The `ThemeToggle` component provides a UI for theme switching:

```vue

<template>
  <ThemeToggle />
</template>

<script setup>
import ThemeToggle from '@/shared/ui/ThemeToggle.vue'
</script>
```
### Adding Custom Themes

Add custom themes in `tailwind.config.js`:

javascript

module.exports = {
  daisyui: {
    themes: ['light', 'dark', 'corporate', 'custom-theme'],
  },
}

Then update the theme type and toggle logic in `useTheme.ts`.

* * * * *

Notifications
-------------

Global notification system for user feedback.

### Features

-   Multiple Types: Success, error, warning, info

-   Auto-dismiss: Configurable duration

-   Manual Dismiss: Close button for user control

-   Stacking: Multiple notifications stack vertically

-   Positioning: Top-right corner (customizable)

### Using the useNotification Composable

```typescript

import { useNotification } from '@/shared/composables/useNotification'

const { success, error, warning, info, show, dismiss, clear } = useNotification()

// Show success notification
success('User created successfully')

// Show error notification
error('Failed to save changes', 8000) // 8 second duration

// Show warning
warning('This action cannot be undone')

// Show info
info('New features available')

// Custom notification
show('Custom message', 'info', 5000, true)

// Dismiss specific notification
dismiss(notificationId)

// Clear all notifications
clear()
```

### Notification Types

-   success: Green, checkmark icon, positive feedback

-   error: Red, X icon, error messages

-   warning: Yellow, warning icon, caution messages

-   info: Blue, info icon, informational messages

### Configuration

Default settings:

-   Duration: 5000ms (5 seconds)

-   Dismissible: true

-   Position: top-right

-   Max visible: unlimited

* * * * *

Navigation
----------

Multi-level navigation system with breadcrumbs and sidebar.

### Sidebar Navigation

Collapsible sidebar with:

-   Logo/branding area

-   Navigation menu items

-   Nested menu support

-   Active route highlighting

-   Permission-based visibility

-   Collapse/expand toggle

### Breadcrumbs

Automatic breadcrumb generation based on route metadata:

```typescript

{
  path: '/users',
  name: 'users',
  component: UsersView,
  meta: {
    breadcrumb: 'User Management', // Breadcrumb label
  },
}
```
Breadcrumbs show the navigation path:
```text

Dashboard > User Management
```

### Navbar

Top navigation bar with:

-   Page title

-   User profile dropdown

-   Theme toggle

-   Notifications (optional)

-   Search (optional)

### Adding Menu Items

Edit the sidebar component to add menu items:

```vue

<template>
  <nav>
    <router-link
      to="/dashboard"
      class="menu-item"
    >
      Dashboard
    </router-link>

    <router-link
      to="/users"
      v-permission="'manage_users'"
      class="menu-item"
    >
      Users
    </router-link>
  </nav>
</template>
```
* * * * *

Layout System
-------------

Flexible layout system with responsive design.

### AppLayout

Main application layout with:

-   Sidebar (collapsible)

-   Navbar (top bar)

-   Breadcrumbs

-   Main content area

-   Notification toasts

### Usage

```vue

<template>
  <AppLayout>
    <!-- Your page content -->
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
</script>
```

### Responsive Behavior

-   Desktop: Full sidebar visible

-   Tablet: Collapsible sidebar

-   Mobile: Drawer-style sidebar (overlay)

### Content Area

The main content area:

-   Flexible height (fills available space)

-   Padding: 1.5rem (24px)

-   Background: base-200 (DaisyUI color)

-   Scrollable when content overflows

### Creating Custom Layouts

Create new layouts in `src/layouts/`:

```vue

<!-- src/layouts/AuthLayout.vue -->
<template>
  <div class="auth-layout">
    <slot />
  </div>
</template>
```
Then use in routes:

```typescript

{
  path: '/login',
  component: LoginView,
  meta: {
    layout: 'auth', // Use AuthLayout
  },
}
```
* * * * *

Best Practices
--------------

### Security

-   Always validate permissions on both frontend and backend

-   Use HTTPS in production

-   Implement proper CORS policies

-   Rotate tokens regularly

-   Log security events

### Performance

-   Lazy load route components

-   Use virtual scrolling for large lists

-   Implement pagination for data tables

-   Cache API responses when appropriate

-   Optimize bundle size

### Accessibility

-   Use semantic HTML

-   Provide ARIA labels

-   Ensure keyboard navigation

-   Maintain color contrast ratios

-   Test with screen readers

### Code Organization

-   Keep features self-contained

-   Use shared components for reusable UI

-   Follow naming conventions

-   Document complex logic

-   Write type-safe code

* * * * *

Troubleshooting
---------------

### Authentication Issues

Problem: Login redirect fails

Solution:

-   Check OIDC configuration in `.env`

-   Verify redirect URI matches provider settings

-   Check browser console for errors

Problem: Token refresh fails

Solution:

-   Ensure refresh token is enabled in provider

-   Check token expiry settings

-   Verify refresh endpoint configuration

### Permission Issues

Problem: User has permission but UI element is hidden

Solution:

-   Check claim configuration (`VITE_OIDC_ROLES_CLAIM`)

-   Verify token contains expected claims

-   Check permission string matches exactly

### Theme Issues

Problem: Theme doesn't persist

Solution:

-   Check localStorage is enabled

-   Verify theme name is valid

-   Check DaisyUI configuration

### Notification Issues

Problem: Notifications don't appear

Solution:

-   Ensure `NotificationToast` component is in layout

-   Check z-index conflicts

-   Verify notification composable is called correctly

* * * * *

Additional Resources
--------------------

-   [README](https://readme.md/) - Project overview and setup

-   [OIDC Migration Guide](https://oidc_migration.md/) - Migrating from OAuth to OIDC

-   [Keycloak Setup](https://keycloak_setup.md/) - Keycloak configuration

-   [Entra ID Setup](https://entra_id_setup.md/) - Microsoft Entra ID configuration

-   [Auth0 Setup](https://auth0_setup.md/) - Auth0 configuration

-   [DaisyUI Documentation](https://daisyui.com/) - UI component library

-   [Vue 3 Documentation](https://vuejs.org/) - Vue.js framework

-   [Pinia Documentation](https://pinia.vuejs.org/) - State management