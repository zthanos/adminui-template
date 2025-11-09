# Keycloak Setup Guide

This guide walks you through configuring Keycloak as your OpenID Connect identity provider for the Vue 3 Admin Template.

## Prerequisites

- Keycloak server installed and running (version 15.0 or higher recommended)
- Admin access to Keycloak Admin Console
- Basic understanding of Keycloak realms and clients

## Step 1: Create or Select a Realm

1. Log in to the Keycloak Admin Console
2. Either create a new realm or select an existing one
3. Note the realm name (e.g., `myrealm`) - you'll need this for configuration

## Step 2: Create a Client

1. Navigate to **Clients** in the left sidebar
2. Click **Create** button
3. Configure the client:
   - **Client ID**: `vue-admin-template` (or your preferred ID)
   - **Client Protocol**: `openid-connect`
   - **Root URL**: `http://localhost:5173` (adjust for your environment)
4. Click **Save**

## Step 3: Configure Client Settings

After creating the client, configure the following settings:

### Access Settings

- **Access Type**: `public` (for SPA applications)
- **Standard Flow Enabled**: `ON`
- **Implicit Flow Enabled**: `OFF`
- **Direct Access Grants Enabled**: `OFF`
- **Service Accounts Enabled**: `OFF`

### Valid Redirect URIs

Add your application's callback URLs:

```
http://localhost:5173/auth/callback
http://localhost:5173/*
https://yourdomain.com/auth/callback
https://yourdomain.com/*
```

### Valid Post Logout Redirect URIs

Add your application's post-logout URLs:

```
http://localhost:5173
http://localhost:5173/*
https://yourdomain.com
https://yourdomain.com/*
```

### Web Origins

Add allowed CORS origins:

```
http://localhost:5173
https://yourdomain.com
```

### Advanced Settings

- **Proof Key for Code Exchange Code Challenge Method**: `S256`
- **Access Token Lifespan**: `5 minutes` (adjust as needed)
- **Client Session Idle**: `30 minutes` (adjust as needed)
- **Client Session Max**: `10 hours` (adjust as needed)

Click **Save** to apply changes.

## Step 4: Configure Client Scopes

1. Navigate to **Client Scopes** tab in your client
2. Ensure the following scopes are assigned:
   - `openid` (required)
   - `profile` (recommended)
   - `email` (recommended)
   - `roles` (for role-based access control)

## Step 5: Configure Roles

### Create Realm Roles

1. Navigate to **Roles** → **Realm Roles**
2. Click **Add Role**
3. Create roles for your application:
   - `admin` - Full administrative access
   - `user` - Standard user access
   - `viewer` - Read-only access

### Assign Roles to Users

1. Navigate to **Users**
2. Select a user
3. Go to **Role Mappings** tab
4. Assign appropriate realm roles

## Step 6: Configure Role Mapping in Token

To include roles in the ID token and access token:

1. Navigate to **Clients** → Your Client → **Mappers** tab
2. Click **Create**
3. Configure the mapper:
   - **Name**: `realm roles`
   - **Mapper Type**: `User Realm Role`
   - **Token Claim Name**: `realm_access.roles`
   - **Claim JSON Type**: `String`
   - **Add to ID token**: `ON`
   - **Add to access token**: `ON`
   - **Add to userinfo**: `ON`
   - **Multivalued**: `ON`
4. Click **Save**

## Step 7: Get OIDC Endpoints

Keycloak provides a discovery document with all OIDC endpoints:

**Discovery URL**: `https://your-keycloak-domain/realms/{realm}/.well-known/openid-configuration`

You can also construct endpoints manually:

- **Issuer**: `https://your-keycloak-domain/realms/{realm}`
- **Authorization Endpoint**: `https://your-keycloak-domain/realms/{realm}/protocol/openid-connect/auth`
- **Token Endpoint**: `https://your-keycloak-domain/realms/{realm}/protocol/openid-connect/token`
- **UserInfo Endpoint**: `https://your-keycloak-domain/realms/{realm}/protocol/openid-connect/userinfo`
- **End Session Endpoint**: `https://your-keycloak-domain/realms/{realm}/protocol/openid-connect/logout`
- **Revocation Endpoint**: `https://your-keycloak-domain/realms/{realm}/protocol/openid-connect/revoke`

## Step 8: Configure Environment Variables

Create or update your `.env` file with the following configuration:

```bash
# Core OIDC endpoints
VITE_OIDC_ISSUER=https://your-keycloak-domain/realms/myrealm
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://your-keycloak-domain/realms/myrealm/protocol/openid-connect/auth
VITE_OIDC_TOKEN_ENDPOINT=https://your-keycloak-domain/realms/myrealm/protocol/openid-connect/token
VITE_OIDC_USERINFO_ENDPOINT=https://your-keycloak-domain/realms/myrealm/protocol/openid-connect/userinfo
VITE_OIDC_END_SESSION_ENDPOINT=https://your-keycloak-domain/realms/myrealm/protocol/openid-connect/logout
VITE_OIDC_REVOCATION_ENDPOINT=https://your-keycloak-domain/realms/myrealm/protocol/openid-connect/revoke

# Client configuration
VITE_OIDC_CLIENT_ID=vue-admin-template
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_SCOPE=openid profile email

# Claims configuration (Keycloak-specific)
VITE_OIDC_ROLES_CLAIM=realm_access.roles
VITE_OIDC_PERMISSIONS_CLAIM=permissions
```

**Important Notes:**
- Replace `your-keycloak-domain` with your actual Keycloak server URL
- Replace `myrealm` with your actual realm name
- Replace `vue-admin-template` with your actual client ID
- Update URLs for production deployment

## Step 9: Test the Configuration

1. Start your application: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click the login button
4. You should be redirected to Keycloak login page
5. Enter credentials for a test user
6. After successful authentication, you should be redirected back to the application
7. Verify that user profile and roles are displayed correctly

## Keycloak-Specific Features

### Client Roles vs Realm Roles

Keycloak supports both realm roles and client-specific roles:

**Realm Roles** (recommended for this template):
- Claim path: `realm_access.roles`
- Shared across all clients in the realm
- Use `VITE_OIDC_ROLES_CLAIM=realm_access.roles`

**Client Roles**:
- Claim path: `resource_access.{client-id}.roles`
- Specific to individual clients
- Use `VITE_OIDC_ROLES_CLAIM=resource_access.vue-admin-template.roles`

### Composite Roles

Keycloak supports composite roles (roles that include other roles):

1. Navigate to **Roles** → Select a role
2. Go to **Composite Roles** tab
3. Add child roles
4. Users assigned the parent role automatically get child roles

### Groups

You can also use Keycloak groups for role assignment:

1. Navigate to **Groups**
2. Create groups (e.g., `Administrators`, `Users`)
3. Assign roles to groups
4. Add users to groups

To include groups in tokens:
1. Navigate to **Clients** → Your Client → **Mappers**
2. Create a new mapper:
   - **Mapper Type**: `Group Membership`
   - **Token Claim Name**: `groups`
   - **Add to ID token**: `ON`

### Token Refresh Configuration

To enable refresh tokens:

1. Navigate to **Clients** → Your Client → **Settings**
2. Ensure **Standard Flow Enabled** is `ON`
3. Set appropriate token lifespans:
   - **Access Token Lifespan**: `5 minutes`
   - **Client Session Idle**: `30 minutes`
   - **Client Session Max**: `10 hours`
   - **Refresh Token Max Reuse**: `0` (one-time use)

## Troubleshooting

### Issue: "Invalid redirect_uri"

**Solution**:
- Verify the redirect URI in your `.env` matches exactly what's configured in Keycloak
- Check for trailing slashes - they must match exactly
- Ensure the redirect URI is in the **Valid Redirect URIs** list

### Issue: Roles not appearing in token

**Solution**:
- Verify the role mapper is configured correctly
- Check that **Add to ID token** is enabled
- Ensure users have roles assigned
- Verify `VITE_OIDC_ROLES_CLAIM` matches the mapper's **Token Claim Name**

### Issue: CORS errors

**Solution**:
- Add your application URL to **Web Origins** in client settings
- Use `*` for development (not recommended for production)
- Ensure Keycloak is accessible from your application's domain

### Issue: "Invalid token" error

**Solution**:
- Verify the issuer URL matches exactly (including realm name)
- Check that the client ID in the token matches your configuration
- Ensure system clocks are synchronized

### Issue: Logout doesn't work

**Solution**:
- Verify `VITE_OIDC_END_SESSION_ENDPOINT` is correct
- Ensure **Valid Post Logout Redirect URIs** includes your post-logout URL
- Check that the ID token is being sent in the logout request

### Issue: Token refresh fails

**Solution**:
- Verify **Standard Flow Enabled** is `ON`
- Check token lifespan settings
- Ensure refresh tokens are being issued (check token response)
- Verify the token endpoint URL is correct

## Security Best Practices

1. **Use HTTPS in Production**: Always use HTTPS for Keycloak and your application in production
2. **Restrict Redirect URIs**: Only add specific redirect URIs, avoid wildcards in production
3. **Enable PKCE**: Ensure PKCE is required (S256 method)
4. **Short Token Lifespans**: Use short access token lifespans (5-15 minutes)
5. **Rotate Refresh Tokens**: Set **Refresh Token Max Reuse** to `0`
6. **Review Client Scopes**: Only enable necessary scopes
7. **Use Strong Passwords**: Enforce strong password policies in Keycloak
8. **Enable MFA**: Consider enabling multi-factor authentication
9. **Monitor Sessions**: Regularly review active sessions in Keycloak
10. **Keep Updated**: Keep Keycloak updated to the latest stable version

## Advanced Configuration

### Custom Claims

To add custom claims to tokens:

1. Navigate to **Clients** → Your Client → **Mappers**
2. Click **Create**
3. Choose appropriate mapper type:
   - **User Attribute**: Map user attributes to claims
   - **User Property**: Map user properties (username, email, etc.)
   - **Hardcoded claim**: Add static values
4. Configure claim name and token inclusion

### Session Management

Configure session behavior:

1. Navigate to **Realm Settings** → **Sessions**
2. Configure:
   - **SSO Session Idle**: Time before idle session expires
   - **SSO Session Max**: Maximum session duration
   - **Offline Session Idle**: Time before offline session expires

### Email Verification

To require email verification:

1. Navigate to **Realm Settings** → **Login**
2. Enable **Verify email**
3. Configure SMTP settings in **Email** tab
4. Users will receive verification emails on registration

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Keycloak Community](https://www.keycloak.org/community)

## Next Steps

After completing the setup:

1. Test all authentication flows (login, logout, token refresh)
2. Verify role-based access control works correctly
3. Configure additional users and roles as needed
4. Set up production environment with HTTPS
5. Review and adjust token lifespan settings
6. Configure backup and monitoring for Keycloak
