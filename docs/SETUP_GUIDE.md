# Setup Guide

This guide will help you set up the Vue 3 Admin Template with OAuth 2.0 authentication (Entra ID).

## Prerequisites

- Node.js 18+ and npm
- An Azure/Entra ID tenant with app registration permissions
- Basic understanding of OAuth 2.0 and PKCE flow

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure OAuth 2.0 with Entra ID

#### Step 2.1: Create App Registration in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: Your app name (e.g., "Admin Portal")
   - **Supported account types**: Choose based on your needs
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:5173/callback` (for development)
5. Click **Register**

#### Step 2.2: Configure Authentication Settings

1. In your app registration, go to **Authentication**
2. Under **Implicit grant and hybrid flows**, ensure nothing is checked (we use PKCE)
3. Under **Advanced settings**:
   - Allow public client flows: **No**
   - Enable the following mobile and desktop flows: **No**
4. Add additional redirect URIs for production:
   - `https://yourdomain.com/callback`
5. Configure logout URL:
   - Front-channel logout URL: `http://localhost:5173` (dev)
   - Add production URL: `https://yourdomain.com`

#### Step 2.3: Configure API Permissions

1. Go to **API permissions**
2. Add the following Microsoft Graph permissions:
   - `User.Read` (Delegated) - Read user profile
   - `email` (Delegated) - Read user email
   - `openid` (Delegated) - Sign in
   - `profile` (Delegated) - Read user profile
3. Click **Grant admin consent** (if you have admin rights)

#### Step 2.4: Note Your Configuration

From the **Overview** page, note:
- **Application (client) ID**
- **Directory (tenant) ID**

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# OAuth 2.0 Configuration (Entra ID)
VITE_OAUTH_AUTHORITY=https://login.microsoftonline.com/{tenant-id}
VITE_OAUTH_CLIENT_ID={your-client-id}
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/callback
VITE_OAUTH_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OAUTH_SCOPE=openid profile email User.Read

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
```

Replace:
- `{tenant-id}` with your Azure AD tenant ID
- `{your-client-id}` with your application client ID

### 4. Set Up Your Backend API

The template expects a backend API that:

1. **Validates OAuth tokens** from Entra ID
2. **Returns user information** with roles and permissions
3. **Provides CRUD endpoints** for users and activity logs

#### Example Backend Endpoints

```
GET  /api/auth/me              - Get current user with roles
POST /api/auth/logout          - Logout (optional server-side cleanup)

GET  /api/users                - List users (requires 'manage_users' permission)
GET  /api/users/:id            - Get user details
PUT  /api/users/:id/roles      - Update user roles

GET  /api/activity             - List activity logs (requires 'view_audit_logs' permission)
```

#### Example User Response Format

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["admin", "user"],
  "permissions": ["manage_users", "view_audit_logs"]
}
```

### 5. Update API Client Configuration

Edit `src/shared/utils/httpClient.ts` if needed to customize:
- Request interceptors
- Response interceptors
- Error handling
- Token refresh logic

### 6. Run the Application

#### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### Production Build

```bash
npm run build
npm run preview
```

## Testing the Setup

### 1. Test Login Flow

1. Navigate to `http://localhost:5173`
2. You should be redirected to `/login`
3. Click "Sign In with Microsoft"
4. Complete the Microsoft login flow
5. You should be redirected back to `/dashboard`

### 2. Test Permissions

The template includes two main permissions:
- `manage_users` - Access to user management
- `view_audit_logs` - Access to activity logs

To test:
1. Ensure your backend returns these permissions for your user
2. Check that navigation items appear/disappear based on permissions
3. Try accessing `/users` and `/activity` routes

### 3. Test Role-Based Access

1. Navigate to `/users` (requires `manage_users` permission)
2. Try editing user roles
3. Verify permission checks work correctly

## Troubleshooting

### Login Redirect Loop

**Problem**: Stuck in redirect loop between login and callback

**Solutions**:
- Verify redirect URI in Azure matches exactly (including trailing slash)
- Check that `VITE_OAUTH_REDIRECT_URI` matches your Azure configuration
- Clear browser cookies and localStorage
- Check browser console for CORS errors

### "Invalid Token" Error

**Problem**: Token validation fails on backend

**Solutions**:
- Verify your backend is configured to validate tokens from your tenant
- Check that token audience (`aud`) matches your client ID
- Ensure clock sync between client and server
- Verify token hasn't expired

### Missing Permissions

**Problem**: User can't access certain features

**Solutions**:
- Check that backend returns correct permissions in `/api/auth/me`
- Verify permission names match exactly (case-sensitive)
- Check browser console for permission check logs
- Ensure user has been assigned appropriate roles in your backend

### CORS Errors

**Problem**: API requests blocked by CORS

**Solutions**:
- Configure CORS on your backend to allow your frontend origin
- For development: Allow `http://localhost:5173`
- For production: Allow your production domain
- Ensure credentials are included in CORS configuration

### Build Errors

**Problem**: Build fails with TypeScript errors

**Solutions**:
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### 1. Update Environment Variables

Create `.env.production`:

```env
VITE_OAUTH_AUTHORITY=https://login.microsoftonline.com/{tenant-id}
VITE_OAUTH_CLIENT_ID={your-client-id}
VITE_OAUTH_REDIRECT_URI=https://yourdomain.com/callback
VITE_OAUTH_POST_LOGOUT_REDIRECT_URI=https://yourdomain.com
VITE_OAUTH_SCOPE=openid profile email User.Read
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 2. Update Azure App Registration

Add production redirect URIs:
- `https://yourdomain.com/callback`
- `https://yourdomain.com` (logout)

### 3. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 4. Deploy

Deploy the `dist/` directory to your hosting provider:
- **Netlify**: Drag and drop `dist/` folder
- **Vercel**: Connect GitHub repo and configure build command
- **Azure Static Web Apps**: Use GitHub Actions
- **AWS S3 + CloudFront**: Upload to S3 bucket

### 5. Configure SPA Routing

Ensure your hosting provider redirects all routes to `index.html`:

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use HTTPS in production** - Required for OAuth
3. **Validate tokens on backend** - Never trust client-side validation
4. **Implement token refresh** - Handle expired tokens gracefully
5. **Use Content Security Policy** - Add CSP headers
6. **Enable CORS properly** - Only allow trusted origins
7. **Implement rate limiting** - Protect your API endpoints
8. **Log security events** - Monitor authentication failures
9. **Keep dependencies updated** - Run `npm audit` regularly
10. **Use environment-specific configs** - Separate dev/prod settings

## Next Steps

- Read [FEATURE_GUIDE.md](./FEATURE_GUIDE.md) to learn how to add new features
- Customize the theme in `tailwind.config.js`
- Add your own business logic and features
- Set up error tracking (e.g., Sentry)
- Configure analytics (e.g., Google Analytics)
