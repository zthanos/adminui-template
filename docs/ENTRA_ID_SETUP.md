# Entra ID (Azure AD) Setup Guide

This guide walks you through configuring Microsoft Entra ID (formerly Azure Active Directory) as your OpenID Connect identity provider for the Vue 3 Admin Template.

## Prerequisites

- Azure subscription with access to Entra ID (Azure AD)
- Permissions to register applications in Entra ID
- Basic understanding of Azure AD concepts (tenants, app registrations)

## Step 1: Register an Application

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** (or **Azure Active Directory**)
3. Select **App registrations** from the left menu
4. Click **New registration**
5. Configure the registration:
   - **Name**: `Vue Admin Template` (or your preferred name)
   - **Supported account types**: Choose based on your needs:
     - `Accounts in this organizational directory only` (Single tenant)
     - `Accounts in any organizational directory` (Multi-tenant)
     - `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: 
     - Platform: `Single-page application (SPA)`
     - URI: `http://localhost:5173/auth/callback`
6. Click **Register**

## Step 2: Configure Authentication

After registration, configure authentication settings:

1. Navigate to **Authentication** in the left menu
2. Under **Platform configurations** → **Single-page application**:
   - Add additional redirect URIs if needed:
     ```
     http://localhost:5173/auth/callback
     https://yourdomain.com/auth/callback
     ```
3. Under **Logout URL**:
   - Add: `http://localhost:5173` (and production URL)
4. Under **Implicit grant and hybrid flows**:
   - **Do NOT** enable ID tokens or Access tokens (we use Authorization Code Flow with PKCE)
5. Under **Advanced settings**:
   - **Allow public client flows**: `No`
   - **Enable the following mobile and desktop flows**: `No`
6. Click **Save**

## Step 3: Configure API Permissions

1. Navigate to **API permissions** in the left menu
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add the following permissions:
   - `openid` (required)
   - `profile` (recommended)
   - `email` (recommended)
   - `User.Read` (for user profile access)
   - `offline_access` (for refresh tokens)
6. Click **Add permissions**
7. Click **Grant admin consent for [Your Organization]** (if you have admin rights)

## Step 4: Configure Token Configuration

1. Navigate to **Token configuration** in the left menu
2. Click **Add optional claim**
3. Select **ID** token type
4. Add the following claims:
   - `email`
   - `family_name`
   - `given_name`
   - `upn` (User Principal Name)
5. Click **Add**
6. If prompted, check **Turn on the Microsoft Graph email, profile permission**

## Step 5: Configure App Roles (for RBAC)

### Create App Roles

1. Navigate to **App roles** in the left menu
2. Click **Create app role**
3. Create roles for your application:

**Admin Role:**
- **Display name**: `Administrator`
- **Allowed member types**: `Users/Groups`
- **Value**: `admin`
- **Description**: `Full administrative access`
- **Enable this app role**: `Checked`

**User Role:**
- **Display name**: `User`
- **Allowed member types**: `Users/Groups`
- **Value**: `user`
- **Description**: `Standard user access`
- **Enable this app role**: `Checked`

**Viewer Role:**
- **Display name**: `Viewer`
- **Allowed member types**: `Users/Groups`
- **Value**: `viewer`
- **Description**: `Read-only access`
- **Enable this app role**: `Checked`

4. Click **Apply** for each role

### Assign Roles to Users

1. Navigate to **Enterprise applications** in Entra ID
2. Find and select your application
3. Navigate to **Users and groups**
4. Click **Add user/group**
5. Select users or groups
6. Select the appropriate role
7. Click **Assign**

## Step 6: Get Application Details

1. Navigate to **Overview** in your app registration
2. Note the following values:
   - **Application (client) ID**: Your client ID
   - **Directory (tenant) ID**: Your tenant ID

## Step 7: Construct OIDC Endpoints

Entra ID endpoints follow this pattern:

- **Issuer**: `https://login.microsoftonline.com/{tenant-id}/v2.0`
- **Authorization Endpoint**: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize`
- **Token Endpoint**: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token`
- **UserInfo Endpoint**: `https://graph.microsoft.com/oidc/userinfo`
- **End Session Endpoint**: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/logout`
- **Revocation Endpoint**: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/revoke`

Replace `{tenant-id}` with your actual tenant ID.

**Alternative**: You can use `common`, `organizations`, or `consumers` instead of tenant ID:
- `common`: Multi-tenant and personal accounts
- `organizations`: Multi-tenant (work/school accounts only)
- `consumers`: Personal Microsoft accounts only

## Step 8: Configure Environment Variables

Create or update your `.env` file with the following configuration:

```bash
# Core OIDC endpoints
VITE_OIDC_ISSUER=https://login.microsoftonline.com/{tenant-id}/v2.0
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token
VITE_OIDC_USERINFO_ENDPOINT=https://graph.microsoft.com/oidc/userinfo
VITE_OIDC_END_SESSION_ENDPOINT=https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/logout
VITE_OIDC_REVOCATION_ENDPOINT=https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/revoke

# Client configuration
VITE_OIDC_CLIENT_ID=your-application-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_SCOPE=openid profile email User.Read offline_access

# Claims configuration (Entra ID-specific)
VITE_OIDC_ROLES_CLAIM=roles
VITE_OIDC_PERMISSIONS_CLAIM=permissions
```

**Important Notes:**
- Replace `{tenant-id}` with your actual tenant ID
- Replace `your-application-client-id` with your actual application (client) ID
- Update URLs for production deployment
- Include `offline_access` scope for refresh token support

## Step 9: Test the Configuration

1. Start your application: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click the login button
4. You should be redirected to Microsoft login page
5. Sign in with your Microsoft account
6. Grant consent if prompted
7. After successful authentication, you should be redirected back to the application
8. Verify that user profile and roles are displayed correctly

## Entra ID-Specific Features

### App Roles in Tokens

Entra ID includes app roles in the `roles` claim of the ID token and access token. The claim structure is:

```json
{
  "roles": ["admin", "user"]
}
```

Use `VITE_OIDC_ROLES_CLAIM=roles` to extract these roles.

### Groups Claims

If you prefer using Azure AD groups instead of app roles:

1. Navigate to **Token configuration**
2. Click **Add groups claim**
3. Select group types to include
4. Choose claim format (Group ID, sAMAccountName, etc.)
5. Update your configuration: `VITE_OIDC_ROLES_CLAIM=groups`

**Note**: Group IDs are GUIDs. You may need to map them to friendly names in your application.

### Optional Claims

Entra ID supports many optional claims:

- `acct`: Account type (0 = user, 1 = guest)
- `auth_time`: Time of authentication
- `ctry`: User's country
- `email`: User's email address
- `family_name`: User's last name
- `given_name`: User's first name
- `upn`: User Principal Name

Add these in **Token configuration** → **Add optional claim**.

### Conditional Access

Entra ID supports conditional access policies:

1. Navigate to **Entra ID** → **Security** → **Conditional Access**
2. Create policies based on:
   - User/group membership
   - Device compliance
   - Location
   - Risk level
3. Require MFA, compliant devices, or block access based on conditions

### Token Lifetime Policies

Configure token lifetimes:

1. Navigate to **Entra ID** → **App registrations** → Your app
2. Go to **Token configuration**
3. Default lifetimes:
   - **Access tokens**: 1 hour
   - **ID tokens**: 1 hour
   - **Refresh tokens**: 90 days (sliding window)

To customize, use PowerShell or Microsoft Graph API.

## Troubleshooting

### Issue: "AADSTS50011: The redirect URI specified in the request does not match"

**Solution**:
- Verify the redirect URI in your `.env` matches exactly what's configured in Azure
- Check for trailing slashes - they must match exactly
- Ensure the platform is set to **Single-page application (SPA)**

### Issue: "AADSTS65001: The user or administrator has not consented"

**Solution**:
- Grant admin consent for the required permissions
- Or have users consent individually on first login
- Check that all required permissions are added

### Issue: Roles not appearing in token

**Solution**:
- Verify app roles are created in **App roles**
- Ensure users are assigned roles in **Enterprise applications** → **Users and groups**
- Check that roles are assigned, not just users added
- Verify `VITE_OIDC_ROLES_CLAIM=roles`

### Issue: "Invalid token" error

**Solution**:
- Verify the issuer URL includes `/v2.0` at the end
- Check that the tenant ID is correct
- Ensure the client ID in the token matches your configuration
- Verify system clocks are synchronized

### Issue: Token refresh fails

**Solution**:
- Ensure `offline_access` scope is included
- Verify the scope is granted in API permissions
- Check that refresh tokens are being issued (check token response)
- Verify the token endpoint URL is correct

### Issue: UserInfo endpoint returns 401

**Solution**:
- Ensure `User.Read` permission is granted
- Verify the access token includes the required scopes
- Check that admin consent was granted
- The application will fall back to ID token claims if UserInfo fails

### Issue: Logout doesn't redirect back

**Solution**:
- Verify the logout URL is configured in **Authentication** settings
- Ensure `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` is in the logout URL list
- Check that the post_logout_redirect_uri parameter is being sent

## Security Best Practices

1. **Use Single-Page Application Platform**: Always register as SPA, not Web
2. **Don't Enable Implicit Flow**: Use Authorization Code Flow with PKCE only
3. **Restrict Redirect URIs**: Only add specific redirect URIs needed
4. **Use Specific Tenant ID**: Avoid `common` in production for better security
5. **Enable Conditional Access**: Require MFA for sensitive operations
6. **Review Permissions Regularly**: Only grant necessary permissions
7. **Monitor Sign-ins**: Use Azure AD sign-in logs to monitor authentication
8. **Enable Security Defaults**: Turn on security defaults in Entra ID
9. **Use Managed Identities**: For backend services, use managed identities
10. **Keep Tokens Short-Lived**: Use short access token lifespans

## Advanced Configuration

### Custom Domain

To use a custom domain for authentication:

1. Navigate to **Entra ID** → **Custom domain names**
2. Add and verify your custom domain
3. Update endpoints to use custom domain
4. Configure DNS records as instructed

### B2C Integration

For customer-facing applications, consider Azure AD B2C:

1. Create an Azure AD B2C tenant
2. Register your application in B2C
3. Configure user flows (sign-up, sign-in, password reset)
4. Update endpoints to use B2C tenant

### Multi-Tenant Applications

For multi-tenant applications:

1. Set **Supported account types** to multi-tenant during registration
2. Use `organizations` or `common` in endpoint URLs
3. Implement tenant-specific logic in your application
4. Handle consent for each tenant

### Microsoft Graph Integration

To access Microsoft Graph APIs:

1. Add Microsoft Graph permissions in **API permissions**
2. Use the access token to call Graph APIs
3. Common endpoints:
   - User profile: `https://graph.microsoft.com/v1.0/me`
   - User photo: `https://graph.microsoft.com/v1.0/me/photo/$value`
   - Calendar: `https://graph.microsoft.com/v1.0/me/calendar`

## Migration from Legacy OAuth Configuration

If migrating from the legacy Microsoft-specific OAuth configuration:

### Mapping Legacy Variables

| Legacy Variable | New Variable |
|----------------|--------------|
| `VITE_OAUTH_AUTHORIZATION_ENDPOINT` | `VITE_OIDC_AUTHORIZATION_ENDPOINT` |
| `VITE_OAUTH_TOKEN_ENDPOINT` | `VITE_OIDC_TOKEN_ENDPOINT` |
| `VITE_OAUTH_CLIENT_ID` | `VITE_OIDC_CLIENT_ID` |
| `VITE_OAUTH_REDIRECT_URI` | `VITE_OIDC_REDIRECT_URI` |
| `VITE_OAUTH_POST_LOGOUT_REDIRECT_URI` | `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` |
| `VITE_OAUTH_SCOPE` | `VITE_OIDC_SCOPE` |

### Key Changes

- Add `VITE_OIDC_ISSUER` for token validation
- Add `VITE_OIDC_USERINFO_ENDPOINT` for standard profile access
- Add `VITE_OIDC_END_SESSION_ENDPOINT` for proper logout
- Add `VITE_OIDC_REVOCATION_ENDPOINT` for token revocation
- Update scope to include `offline_access` for refresh tokens

## Additional Resources

- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [Microsoft Identity Platform](https://learn.microsoft.com/en-us/entra/identity-platform/)
- [Microsoft Graph Documentation](https://learn.microsoft.com/en-us/graph/)
- [Azure AD B2C Documentation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/)
- [OpenID Connect on Microsoft Identity Platform](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc)

## Next Steps

After completing the setup:

1. Test all authentication flows (login, logout, token refresh)
2. Verify role-based access control works correctly
3. Assign roles to users and groups
4. Configure conditional access policies if needed
5. Set up production environment with proper redirect URIs
6. Review and adjust token lifetime settings
7. Enable monitoring and logging in Azure
8. Consider implementing Microsoft Graph integration for enhanced features
