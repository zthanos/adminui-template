# Project Structure

This project follows **Vertical Slice Architecture (VSA)**, organizing code by feature rather than technical layer.

## Directory Organization

```
src/
├── features/           # Feature slices (self-contained modules)
│   ├── auth/          # Authentication slice
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   └── views/
│   ├── users/         # User management slice
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   └── views/
│   ├── activity/      # Activity tracking slice
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   └── views/
│   └── dashboard/     # Dashboard slice
│       ├── components/
│       └── views/
├── shared/            # Cross-cutting concerns
│   ├── ui/           # Reusable UI components
│   ├── types/        # Global TypeScript interfaces
│   ├── composables/  # Shared composables (notifications, theme)
│   ├── guards/       # Router guards
│   └── utils/        # Utility functions
├── layouts/          # Layout components
└── router/           # Router configuration
```

## Key Principles

1. **Feature Slices**: Each feature is self-contained with all related code (components, stores, services, views) in one directory
2. **Shared Layer**: Cross-cutting concerns like reusable UI components, types, and utilities live in `src/shared/`
3. **No Circular Dependencies**: Features should not import from each other; shared code goes in `src/shared/`
4. **Colocation**: Keep related code together within each slice

## File Naming Conventions

- Components: PascalCase (e.g., `UserTable.vue`, `LoginForm.vue`)
- Stores: camelCase with `Store` suffix (e.g., `authStore.ts`, `userStore.ts`)
- Services: camelCase with `Service` suffix (e.g., `authService.ts`, `userService.ts`)
- Views: PascalCase with `View` suffix (e.g., `LoginView.vue`, `DashboardView.vue`)
- Composables: camelCase with `use` prefix (e.g., `useNotification.ts`, `useTheme.ts`)

## Route Protection

All routes are protected by default via router guards. Public routes must be explicitly marked in route metadata.
