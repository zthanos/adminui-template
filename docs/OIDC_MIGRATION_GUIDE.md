# OIDC Migration Guide

This guide helps you migrate from the legacy OAuth 2.0 configuration (using `VITE_OAUTH_*` variables) to the new provider-agnostic OpenID Connect (OIDC) configuration (using `VITE_OIDC_*` variables).

## Why Migrate?

The new OIDC implementation provides:

- **Provider Agnostic**: Works with any OIDC-compliant identity provider (Keycloak, Entra ID, Auth0, Okta, etc.)
- **Standard Compliance**: Follows OpenID Connect specifications
- **Enhanced Features**: Token refresh, token revocation, and proper logout flows
- **Flexible Claims Mapping**: Configurable roles and permissions extraction
- **Better Security**: ID token validation and proper session management

## Backward Compatibility

The application maintains backward compatibility with `VITE_OAUTH_*` variables. If `VITE_OIDC_*` variables are not set, the system will automatically fall back to `VITE_OAUTH_*` variables with a deprecation warning in the console.

However, we strongly recommend migrating to the new configuration to take advantage of enhanced features and future updates.

## Environment Variable Mapping

### Core Endpoints

| Legacy Variable | New Variable | Notes |
|----------------|--------------|-------|
| `VITE_OAUTH_AUTHORIZATION_ENDPOINT` | `VITE_OIDC_AUTHORIZATION_ENDPOINT` | Authorization endpoint URL |
| `VITE_OAUTH_TOKEN_ENDPOINT` | `VITE_OIDC_TOKEN_ENDPOINT` | Token endpoint URL |
| `VITE_OAUTH_CLIENT_ID` | `VITE_OIDC_CLIENT_ID` | OAuth client ID |
| `VITE_OAUTH_REDIRECT_URI` | `VITE_OIDC_REDIRECT_URI` | Redirect URI after login |
| `VITE_OAUTH_POST_LOGOUT_REDIRECT_URI` | `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` | Redirect URI after logout |
| `VITE_OAUTH_SCOPE` | `VITE_OIDC_SCOPE` | OAuth scopes (must include `openid`) |

### New OIDC-Specific Variables

These variables are new and have no legacy equivalent:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_OIDC_ISSUER` | Optional | - | OIDC issuer URL for token validation |
| `VITE_OIDC_USERINFO_ENDPOINT` | Optional | - | UserInfo endpoint for fetching user profile |
| `VITE_OIDC_END_SESSION_ENDPOINT` | Optional | - | Logout endpoint at identity provider |
| `VITE_OIDC_REVOCATION_ENDPOINT` | Optional | - | Token revocation endpoint |
| `VITE_OIDC_ROLES_CLAIM` | Optional | `roles` | Claim path for extracting user roles |
| `VITE_OIDC_PERMISSIONS_CLAIM` | Optional | `permissions` | Claim path for extracting permissions |

## Migration Steps

### Step 1: Review Current Configuration

Check your current `.env` file and identify all `VITE_OAUTH_*` variables:

```bash
# Example legacy configuration
VITE_OAUTH_AUTHORIZATION_ENDPOINT=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
VITE_OAUTH_TOKEN_ENDPOINT=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
VITE_OAUTH_CLIENT_ID=your-client-id
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OAUTH_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OAUTH_SCOPE=openid profile email
```

### Step 2: Create New OIDC Configuration

Create a new `.env` file with `VITE_OIDC_*` variables. Use the provider-specific setup guides for your identity provider:

- [Keycloak Setup Guide](./KEYCLOAK_SETUP.md)
- [Entra ID Setup Guide](./ENTRA_ID_SETUP.md)
- [Auth0 Setup Guide](./AUTH0_SETUP.md)

**Example for Entra ID:**

```bash
# Core OIDC endpoints
VITE_OIDC_ISSUER=https://login.microsoftonline.com/{tenant}/v2.0
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
VITE_OIDC_USERINFO_ENDPOINT=https://graph.microsoft.com/oidc/userinfo
VITE_OIDC_END_SESSION_ENDPOINT=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/logout
VITE_OIDC_REVOCATION_ENDPOINT=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/revoke

# Client configuration
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_SCOPE=openid profile email

# Claims configuration
VITE_OIDC_ROLES_CLAIM=roles
VITE_OIDC_PERMISSIONS_CLAIM=permissions
```

### Step 3: Update Identity Provider Configuration

Ensure your identity provider is configured to support OIDC:

1. **Verify Redirect URIs**: Ensure `VITE_OIDC_REDIRECT_URI` and `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` are registered in your identity provider
2. **Check Scopes**: Ensure the `openid` scope is included and enabled
3. **Configure Claims**: Set up roles and permissions claims in your identity provider (see provider-specific guides)
4. **Enable Token Refresh**: If using refresh tokens, ensure your client is configured to receive them

### Step 4: Test the Migration

Use the testing checklist below to verify the migration:

## Testing Checklist

### Authentication Flow

- [ ] **Login Flow**
  - [ ] Click login button redirects to identity provider
  - [ ] Authorization endpoint URL is correct
  - [ ] Scopes include `openid` at minimum
  - [ ] PKCE challenge is generated and sent
  - [ ] After authentication, redirects back to application
  - [ ] Callback handler exchanges code for tokens
  - [ ] Access token, ID token, and refresh token (if applicable) are received

- [ ] **Token Validation**
  - [ ] ID token is decoded successfully
  - [ ] Token issuer matches configured issuer
  - [ ] Token audience matches client ID
  - [ ] Token expiration is validated
  - [ ] No console errors related to token validation

- [ ] **User Profile**
  - [ ] User profile is loaded after login
  - [ ] User ID (sub claim) is extracted correctly
  - [ ] Email address is displayed correctly
  - [ ] Display name is shown correctly
  - [ ] Roles are extracted and displayed
  - [ ] Permissions are available for RBAC

### Claims Mapping

- [ ] **Standard Claims**
  - [ ] `sub` claim maps to user ID
  - [ ] `email` claim maps to user email
  - [ ] `name` or `preferred_username` maps to display name
  - [ ] `email_verified` status is captured

- [ ] **Custom Claims**
  - [ ] Roles are extracted from configured claim path
  - [ ] Nested claims (e.g., `realm_access.roles`) work correctly
  - [ ] Permissions are extracted if configured
  - [ ] Missing claims default to empty arrays

### Token Refresh

- [ ] **Refresh Token Flow**
  - [ ] Refresh token is stored after initial login
  - [ ] Token refresh is triggered before expiration
  - [ ] New access token is received and stored
  - [ ] User session continues without interruption
  - [ ] Failed refresh triggers logout

### Logout Flow

- [ ] **Local Logout**
  - [ ] All tokens are cleared from memory
  - [ ] User state is reset
  - [ ] Redirect to login page occurs

- [ ] **Provider Logout**
  - [ ] End session endpoint is called (if configured)
  - [ ] ID token hint is included in logout request
  - [ ] Post-logout redirect URI is included
  - [ ] User is logged out from identity provider
  - [ ] Redirect back to application occurs

- [ ] **Token Revocation**
  - [ ] Revocation endpoint is called (if configured)
  - [ ] Access token is revoked
  - [ ] Refresh token is revoked
  - [ ] Logout completes even if revocation fails

### Backward Compatibility

- [ ] **Fallback Behavior**
  - [ ] Application works with only `VITE_OAUTH_*` variables
  - [ ] Deprecation warning appears in console
  - [ ] No breaking changes to existing deployments

### Provider-Specific Testing

- [ ] **Keycloak** (if applicable)
  - [ ] Realm-specific roles are extracted
  - [ ] `realm_access.roles` claim path works
  - [ ] Client roles are available if configured

- [ ] **Entra ID** (if applicable)
  - [ ] Azure AD roles are extracted
  - [ ] Microsoft Graph UserInfo endpoint works
  - [ ] Tenant-specific configuration is correct

- [ ] **Auth0** (if applicable)
  - [ ] Custom namespace claims work
  - [ ] Auth0 roles are extracted
  - [ ] Auth0 permissions are available

## Troubleshooting

### Issue: "Invalid token format" error

**Cause**: ID token is not a valid JWT

**Solution**:
- Verify the token endpoint is returning an `id_token` in the response
- Check that the `openid` scope is included in the authorization request
- Ensure the identity provider is configured for OIDC (not just OAuth 2.0)

### Issue: Roles not appearing

**Cause**: Roles claim path is incorrect

**Solution**:
- Check the ID token payload to identify where roles are stored
- Update `VITE_OIDC_ROLES_CLAIM` to match the correct claim path
- For nested claims, use dot notation (e.g., `realm_access.roles`)
- Refer to provider-specific setup guides for correct claim paths

### Issue: "Token expired" error immediately after login

**Cause**: Clock skew between client and server

**Solution**:
- Verify system time is synchronized
- Check that the identity provider's clock is accurate
- The system includes a 5-minute buffer for token expiration

### Issue: UserInfo endpoint fails

**Cause**: UserInfo endpoint not configured or access token invalid

**Solution**:
- Verify `VITE_OIDC_USERINFO_ENDPOINT` is correct
- Check that the access token includes the required scopes
- The system will fall back to ID token claims if UserInfo fails
- Check browser console for specific error messages

### Issue: Logout doesn't end provider session

**Cause**: End session endpoint not configured

**Solution**:
- Add `VITE_OIDC_END_SESSION_ENDPOINT` to your configuration
- Verify the endpoint URL is correct for your provider
- Ensure `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` is registered with the provider

### Issue: Token refresh fails

**Cause**: Refresh token not issued or expired

**Solution**:
- Verify your identity provider is configured to issue refresh tokens
- Check that the client has permission to use refresh tokens
- Ensure the `offline_access` scope is requested (if required by provider)
- Check token lifetime settings in your identity provider

## Rollback Plan

If you encounter issues after migration, you can quickly rollback:

1. **Keep Legacy Variables**: Don't delete `VITE_OAUTH_*` variables immediately
2. **Remove OIDC Variables**: Comment out or remove `VITE_OIDC_*` variables
3. **Restart Application**: The system will automatically fall back to legacy configuration
4. **Report Issues**: Document any issues encountered for troubleshooting

## Next Steps

After successful migration:

1. **Remove Legacy Variables**: Once confident in the new configuration, remove `VITE_OAUTH_*` variables
2. **Update Documentation**: Document your specific provider configuration for your team
3. **Monitor Logs**: Watch for any authentication-related errors in production
4. **Test Edge Cases**: Verify token refresh, logout, and error scenarios
5. **Update CI/CD**: Ensure deployment pipelines use new environment variables

## Additional Resources

- [Keycloak Setup Guide](./KEYCLOAK_SETUP.md)
- [Entra ID Setup Guide](./ENTRA_ID_SETUP.md)
- [Auth0 Setup Guide](./AUTH0_SETUP.md)
- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.0 PKCE RFC](https://tools.ietf.org/html/rfc7636)

## Support

If you encounter issues not covered in this guide:

1. Check the provider-specific setup guides
2. Review the troubleshooting section
3. Check browser console for detailed error messages
4. Verify identity provider configuration
5. Consult your identity provider's documentation
