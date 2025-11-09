Auth0 Setup Guide
=================

This guide walks you through configuring Auth0 as your OpenID Connect identity provider for the Vue 3 Admin Template.

Prerequisites
-------------

-   Auth0 account (free tier available at [auth0.com](https://auth0.com/))

-   Access to Auth0 Dashboard

-   Basic understanding of Auth0 concepts (tenants, applications, APIs)

Step 1: Create an Application
-----------------------------

1.  Log in to the [Auth0 Dashboard](https://manage.auth0.com/)

2.  Navigate to Applications → Applications in the left sidebar

3.  Click Create Application

4.  Configure the application:

    -   Name: `Vue Admin Template` (or your preferred name)

    -   Application Type: `Single Page Web Applications`

5.  Click Create

Step 2: Configure Application Settings
--------------------------------------

After creating the application, configure the following settings:

### Basic Information

-   Name: Your application name

-   Domain: Note your Auth0 domain (e.g., `your-tenant.auth0.com`)

-   Client ID: Note your client ID (you'll need this later)

### Application URIs

Scroll down to the Application URIs section:

Allowed Callback URLs:

text

http://localhost:5173/auth/callback, https://yourdomain.com/auth/callback

Allowed Logout URLs:

text

http://localhost:5173, https://yourdomain.com

Allowed Web Origins:

text

http://localhost:5173, https://yourdomain.com

Allowed Origins (CORS):

text

http://localhost:5173, https://yourdomain.com

### Advanced Settings

Click Show Advanced Settings at the bottom:

1.  Go to OAuth tab:

    -   JsonWebToken Signature Algorithm: `RS256`

    -   OIDC Conformant: `Enabled` (should be enabled by default)

2.  Go to Grant Types tab:

    -   Ensure Authorization Code is checked

    -   Ensure Refresh Token is checked

    -   Uncheck Implicit (not needed for PKCE flow)

3.  Click Save Changes

Step 3: Create API (Optional but Recommended)
---------------------------------------------

If you want to use custom claims and permissions:

1.  Navigate to Applications → APIs

2.  Click Create API

3.  Configure the API:

    -   Name: `Vue Admin Template API`

    -   Identifier: `https://api.yourdomain.com` (use your actual API URL or a unique identifier)

    -   Signing Algorithm: `RS256`

4.  Click Create

### Configure API Permissions

1.  Select your API

2.  Go to Permissions tab

3.  Add permissions (scopes) for your application:

    -   `read:users` - Read user data

    -   `write:users` - Modify user data

    -   `read:admin` - Administrative read access

    -   `write:admin` - Administrative write access

4.  Click Add for each permission

Step 4: Create Roles
--------------------

1.  Navigate to User Management → Roles

2.  Click Create Role

3.  Create roles for your application:

Admin Role:

-   Name: `Administrator`

-   Description: `Full administrative access`

-   Click Create

-   Go to Permissions tab

-   Click Add Permissions

-   Select your API and add all permissions

User Role:

-   Name: `User`

-   Description: `Standard user access`

-   Click Create

-   Add appropriate permissions

Viewer Role:

-   Name: `Viewer`

-   Description: `Read-only access`

-   Click Create

-   Add read-only permissions

Step 5: Configure Roles in Tokens
---------------------------------

To include roles in ID tokens and access tokens, create an Action:

1.  Navigate to Actions → Library

2.  Click Build Custom

3.  Configure the action:

    -   Name: `Add Roles to Tokens`

    -   Trigger: `Login / Post Login`

    -   Runtime: `Node 18` (or latest)

4.  Click Create

5.  Add the following code:

javascript

/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://yourdomain.com';

  if (event.authorization) {
    // Add roles to ID token and access token
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);

    // Add permissions to access token
    if (event.authorization.permissions) {
      api.accessToken.setCustomClaim(`${namespace}/permissions`, event.authorization.permissions);
    }
  }
};

1.  Click Deploy

2.  Navigate to Actions → Flows → Login

3.  Click Custom tab

4.  Drag your Add Roles to Tokens action to the flow (between Start and Complete)

5.  Click Apply

Step 6: Assign Roles to Users
-----------------------------

1.  Navigate to User Management → Users

2.  Select a user (or create a new test user)

3.  Go to Roles tab

4.  Click Assign Roles

5.  Select appropriate roles

6.  Click Assign

Step 7: Get OIDC Endpoints
--------------------------

Auth0 provides a discovery document at:

Discovery URL: `https://your-tenant.auth0.com/.well-known/openid-configuration`

You can also construct endpoints manually:

-   Issuer: `https://your-tenant.auth0.com/`

-   Authorization Endpoint: `https://your-tenant.auth0.com/authorize`

-   Token Endpoint: `https://your-tenant.auth0.com/oauth/token`

-   UserInfo Endpoint: `https://your-tenant.auth0.com/userinfo`

-   End Session Endpoint: `https://your-tenant.auth0.com/v2/logout`

-   Revocation Endpoint: `https://your-tenant.auth0.com/oauth/revoke`

Step 8: Configure Environment Variables
---------------------------------------

Create or update your `.env` file with the following configuration:

env

# Core OIDC endpoints
VITE_OIDC_ISSUER=https://your-tenant.auth0.com/
VITE_OIDC_AUTHORIZATION_ENDPOINT=https://your-tenant.auth0.com/authorize
VITE_OIDC_TOKEN_ENDPOINT=https://your-tenant.auth0.com/oauth/token
VITE_OIDC_USERINFO_ENDPOINT=https://your-tenant.auth0.com/userinfo
VITE_OIDC_END_SESSION_ENDPOINT=https://your-tenant.auth0.com/v2/logout
VITE_OIDC_REVOCATION_ENDPOINT=https://your-tenant.auth0.com/oauth/revoke

# Client configuration
VITE_OIDC_CLIENT_ID=your-auth0-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_SCOPE=openid profile email offline_access

# Claims configuration (Auth0-specific with custom namespace)
VITE_OIDC_ROLES_CLAIM=https://yourdomain.com/roles
VITE_OIDC_PERMISSIONS_CLAIM=https://yourdomain.com/permissions

Important Notes:

-   Replace `your-tenant` with your actual Auth0 tenant name

-   Replace `your-auth0-client-id` with your actual client ID

-   Replace `https://yourdomain.com` with your actual domain (used as namespace)

-   Update URLs for production deployment

-   Include `offline_access` scope for refresh token support

-   Auth0 requires custom namespaces for custom claims (must be a valid URL)

Step 9: Test the Configuration
------------------------------

1.  Start your application: `npm run dev`

2.  Navigate to `http://localhost:5173`

3.  Click the login button

4.  You should be redirected to Auth0 Universal Login

5.  Sign in with your Auth0 account

6.  After successful authentication, you should be redirected back to the application

7.  Verify that user profile and roles are displayed correctly

Auth0-Specific Features
-----------------------

### Custom Namespaced Claims

Auth0 requires custom claims to use a namespaced format (a valid URL). This prevents claim collisions:

javascript

// In your Action
const namespace = 'https://yourdomain.com';
api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);

In your application configuration:

env

VITE_OIDC_ROLES_CLAIM=https://yourdomain.com/roles

### Universal Login

Auth0's Universal Login provides:

-   Centralized authentication UI

-   Built-in security features

-   Customizable branding

-   Multi-factor authentication

-   Social connections

To customize:

1.  Navigate to Branding → Universal Login

2.  Choose a template or customize HTML/CSS

3.  Add your logo and brand colors

### Social Connections

To enable social login (Google, Facebook, etc.):

1.  Navigate to Authentication → Social

2.  Click on a provider (e.g., Google)

3.  Enable the connection

4.  Configure client ID and secret from the provider

5.  Select which applications can use this connection

6.  Click Save

### Multi-Factor Authentication

To enable MFA:

1.  Navigate to Security → Multi-factor Auth

2.  Enable desired factors:

    -   Push notifications via Auth0 Guardian

    -   SMS

    -   Time-based One-Time Password (TOTP)

    -   Email

3.  Configure policies:

    -   Always require MFA

    -   Require MFA based on context

    -   Allow users to enroll

### Organizations (Enterprise Feature)

For B2B applications with multiple organizations:

1.  Navigate to Organizations

2.  Create organizations for different tenants

3.  Assign users to organizations

4.  Configure organization-specific branding and connections

5.  Use organization ID in authentication requests

### Rules vs Actions

Auth0 is transitioning from Rules to Actions:

-   Rules (Legacy): JavaScript functions that execute during authentication

-   Actions (Current): Node.js-based, more powerful and flexible

Use Actions for new implementations. Rules will be deprecated.

Troubleshooting
---------------

### Issue: "Callback URL mismatch"

Solution:

-   Verify the redirect URI in your `.env` matches exactly what's configured in Auth0

-   Check for trailing slashes - they must match exactly

-   Ensure the URL is in the Allowed Callback URLs list

-   URLs are case-sensitive

### Issue: Roles not appearing in token

Solution:

-   Verify the Action is deployed and added to the Login flow

-   Check that users have roles assigned

-   Ensure the namespace in the Action matches `VITE_OIDC_ROLES_CLAIM`

-   Check the ID token payload in [jwt.io](https://jwt.io/) to see what claims are present

-   Verify the Action code doesn't have syntax errors

### Issue: "Invalid audience" error

Solution:

-   If using an API, ensure the audience parameter is included in the authorization request

-   Verify the API identifier is correct

-   Check that the API is enabled

### Issue: CORS errors

Solution:

-   Add your application URL to Allowed Web Origins in application settings

-   Add your application URL to Allowed Origins (CORS)

-   Ensure URLs match exactly (including protocol and port)

### Issue: "Invalid token" error

Solution:

-   Verify the issuer URL includes a trailing slash: `https://your-tenant.auth0.com/`

-   Check that the client ID in the token matches your configuration

-   Ensure system clocks are synchronized

-   Verify the token hasn't expired

### Issue: Token refresh fails

Solution:

-   Ensure `offline_access` scope is included

-   Verify Refresh Token grant type is enabled in application settings

-   Check that refresh tokens are being issued (check token response)

-   Verify the token endpoint URL is correct

-   Check Auth0 logs for specific error messages

### Issue: Logout doesn't work properly

Solution:

-   Verify `VITE_OIDC_END_SESSION_ENDPOINT` uses `/v2/logout` (not `/logout`)

-   Ensure the logout URL is in Allowed Logout URLs

-   Include `client_id` and `returnTo` parameters in logout request

-   Check that `returnTo` URL is in the allowed logout URLs list

### Issue: Custom claims not appearing

Solution:

-   Verify the namespace is a valid URL format

-   Check that the Action is deployed and in the Login flow

-   Ensure the Action code uses `api.idToken.setCustomClaim()` correctly

-   Check Auth0 Real-time Webtask Logs for Action errors

Security Best Practices
-----------------------

-   Use PKCE: Always use Authorization Code Flow with PKCE for SPAs

-   Don't Use Implicit Flow: Implicit flow is deprecated and less secure

-   Restrict Callback URLs: Only add specific callback URLs needed

-   Enable MFA: Require multi-factor authentication for sensitive operations

-   Use Short Token Lifespans: Configure short access token lifespans (15 minutes or less)

-   Rotate Refresh Tokens: Enable refresh token rotation in application settings

-   Monitor Logs: Regularly review Auth0 logs for suspicious activity

-   Use Custom Domains: Use custom domains in production for better branding and security

-   Enable Anomaly Detection: Turn on brute force protection and breached password detection

-   Keep Actions Updated: Regularly review and update Actions for security best practices

Advanced Configuration
----------------------

### Custom Domains

To use a custom domain (e.g., `auth.yourdomain.com`):

1.  Navigate to Branding → Custom Domains

2.  Add your custom domain

3.  Configure DNS records as instructed

4.  Verify domain ownership

5.  Update all endpoints to use custom domain

### Token Lifetime Configuration

Configure token lifespans:

1.  Navigate to Applications → Your Application → Settings

2.  Scroll to Token Expiration:

    -   ID Token Expiration: Default 36000 seconds (10 hours)

    -   Access Token Expiration: Default 86400 seconds (24 hours)

3.  For APIs, configure in Applications → APIs → Your API → Settings:

    -   Token Expiration: Recommended 900 seconds (15 minutes)

    -   Token Expiration For Browser Flows: Recommended 7200 seconds (2 hours)

### Refresh Token Rotation

Enable refresh token rotation for better security:

1.  Navigate to Applications → Your Application → Settings

2.  Scroll to Refresh Token Rotation

3.  Enable Rotation

4.  Configure Reuse Interval (0 for one-time use)

5.  Enable Absolute Expiration

6.  Set Absolute Lifetime (e.g., 2592000 seconds = 30 days)

### Attack Protection

Configure attack protection:

1.  Navigate to Security → Attack Protection

2.  Brute Force Protection:

    -   Enable protection

    -   Configure thresholds and block duration

3.  Suspicious IP Throttling:

    -   Enable throttling

    -   Configure allowlists if needed

4.  Breached Password Detection:

    -   Enable detection

    -   Choose action (block or notify)

### Hooks (Legacy) and Actions

Create custom logic for various triggers:

-   Post Login: Add custom claims, enforce policies

-   Pre User Registration: Validate user data, prevent registration

-   Post User Registration: Send welcome emails, create records

-   Post Change Password: Notify users, log events

-   Send Phone Message: Customize MFA SMS messages

### Auth0 Management API

For programmatic management:

1.  Create a Machine-to-Machine application

2.  Authorize it for Auth0 Management API

3.  Grant necessary scopes

4.  Use client credentials flow to get access token

5.  Call Management API endpoints

Migration from Legacy OAuth Configuration
-----------------------------------------

If migrating from a legacy OAuth configuration:

### Mapping Legacy Variables

| Legacy Variable | New Variable |
| --- | --- |
| VITE_OAUTH_AUTHORIZATION_ENDPOINT | VITE_OIDC_AUTHORIZATION_ENDPOINT |
| VITE_OAUTH_TOKEN_ENDPOINT | VITE_OIDC_TOKEN_ENDPOINT |
| VITE_OAUTH_CLIENT_ID | VITE_OIDC_CLIENT_ID |
| VITE_OAUTH_REDIRECT_URI | VITE_OIDC_REDIRECT_URI |
| VITE_OAUTH_POST_LOGOUT_REDIRECT_URI | VITE_OIDC_POST_LOGOUT_REDIRECT_URI |
| VITE_OAUTH_SCOPE | VITE_OIDC_SCOPE |

### Key Changes

-   Add `VITE_OIDC_ISSUER` for token validation

-   Add `VITE_OIDC_USERINFO_ENDPOINT` for standard profile access

-   Add `VITE_OIDC_END_SESSION_ENDPOINT` (use `/v2/logout`)

-   Add `VITE_OIDC_REVOCATION_ENDPOINT` for token revocation

-   Update scope to include `offline_access` for refresh tokens

-   Use namespaced claims for roles and permissions

Additional Resources
--------------------

-   [Auth0 Documentation](https://auth0.com/docs)

-   [Auth0 Actions Documentation](https://auth0.com/docs/actions)

-   [Auth0 Management API](https://auth0.com/docs/api/management/v2)

-   [Auth0 Community](https://community.auth0.com/)

-   [OpenID Connect on Auth0](https://auth0.com/docs/protocols/oidc)

-   [Auth0 Best Practices](https://auth0.com/docs/best-practices)

Next Steps
----------

After completing the setup:

-   Test all authentication flows (login, logout, token refresh)

-   Verify role-based access control works correctly

-   Assign roles to users

-   Configure MFA if required

-   Set up production environment with proper redirect URIs

-   Review and adjust token lifetime settings

-   Enable attack protection features

-   Consider using a custom domain for production

-   Set up monitoring and alerts in Auth0 Dashboard

-   Review Auth0 logs regularly for security and debugging