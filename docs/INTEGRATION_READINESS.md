# Integration Readiness Brief
## Cosmiv Platform OAuth & Service Integrations

**Last Updated:** 2025-01-27  
**Author:** Daan (DeWindWaker)  
**Purpose:** Comprehensive guide for setting up external API integrations for Cosmiv platform

---

## 📋 Table of Contents

1. [Gaming Platform OAuth Integrations](#gaming-platform-oauth-integrations)
2. [Billing Integration (Stripe)](#billing-integration-stripe)
3. [Social Media API Integrations](#social-media-api-integrations)
4. [Environment Variables Checklist](#environment-variables-checklist)
5. [Testing & Verification](#testing--verification)

---

## 🎮 Gaming Platform OAuth Integrations

### Overview

All OAuth integrations are currently in **mock mode** by default. To enable real OAuth flows, set the corresponding `*_API_ENABLED=true` environment variable and provide valid credentials.

**Current Status:**
- ✅ Code infrastructure ready in `backend/src/services/platform_oauth.py`
- ✅ Frontend integration ready in `Accounts` component
- ❌ Credentials not yet configured
- ❌ Production callbacks not yet tested

---

### 1. Steam OpenID Integration

**Provider:** Steam (Valve Corporation)  
**Protocol:** OpenID 2.0 (not OAuth 2.0)  
**Current Implementation:** Lines 16-88 in `platform_oauth.py`

#### Setup Requirements

1. **Developer Portal:** https://steamcommunity.com/dev/apikey
2. **Registration:** Free, immediate access
3. **API Key:** Single API key (no Client ID/Secret pair)
4. **Review Timeline:** None (immediate approval)

#### Credentials Needed

- `STEAM_API_KEY` - Single API key from Steam Developer portal

#### Configuration Steps

1. Visit https://steamcommunity.com/dev/apikey
2. Log in with Steam account
3. Register domain (e.g., `cosmiv.app` or `yourdomain.com`)
4. Copy API key
5. Set environment variable: `STEAM_API_KEY=your_api_key_here`
6. Enable integration: `STEAM_API_ENABLED=true`

#### Callback URL Configuration

**Production:**
```
https://yourdomain.com/api/v2/accounts/oauth/steam/callback
```

**Development:**
```
http://localhost:3000/auth/steam/callback
```

#### Scopes & User Information

Steam OpenID doesn't use traditional scopes. Available user data:
- **Steam ID:** Unique numeric identifier (e.g., `76561198012345678`)
- **Username:** Display name from Steam profile
- **Profile URL:** Public Steam profile URL
- **Avatar:** Profile picture URL

**Note:** Steam API requires Steam ID to fetch additional user information (games owned, playtime, etc.)

#### Special Considerations

- Steam uses **OpenID 2.0**, not OAuth 2.0
- No refresh tokens (sessions managed differently)
- API key is domain-restricted (set during registration)
- Rate limits: ~100,000 requests/day per API key (usually sufficient)

#### Testing Checklist

- [ ] API key retrieved from Steam Developer portal
- [ ] Environment variable set: `STEAM_API_KEY`
- [ ] Integration enabled: `STEAM_API_ENABLED=true`
- [ ] Callback URL registered in Steam portal
- [ ] Test OAuth flow in frontend `/accounts` tab
- [ ] Verify Steam ID and username saved in database
- [ ] Check backend logs for any errors

---

### 2. Xbox Live OAuth Integration

**Provider:** Microsoft (Azure Active Directory)  
**Protocol:** OAuth 2.0  
**Current Implementation:** Lines 91-165 in `platform_oauth.py`

#### Setup Requirements

1. **Developer Portal:** https://portal.azure.com → Azure Active Directory → App registrations
2. **Registration:** Free Azure account required
3. **Credentials:** Client ID + Client Secret
4. **Review Timeline:** None (immediate, but may require verification for production)

#### Credentials Needed

- `XBOX_CLIENT_ID` - Application (client) ID from Azure AD
- `XBOX_CLIENT_SECRET` - Client secret value from Azure AD

#### Configuration Steps

1. Go to https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. **Name:** "Cosmiv Xbox Integration" (or your choice)
5. **Supported account types:** "Accounts in any organizational directory and personal Microsoft accounts"
6. **Redirect URI:** 
   - Type: **Web**
   - URL: `https://yourdomain.com/api/v2/accounts/oauth/xbox/callback`
7. Click **Register**
8. Copy **Application (client) ID** → Set as `XBOX_CLIENT_ID`
9. Go to **Certificates & secrets** → **New client secret**
10. Copy **Value** (only shown once!) → Set as `XBOX_CLIENT_SECRET`
11. Set environment variables:
    - `XBOX_API_ENABLED=true`
    - `XBOX_CLIENT_ID=your_client_id`
    - `XBOX_CLIENT_SECRET=your_client_secret`

#### Callback URL Configuration

**Production:**
```
https://yourdomain.com/api/v2/accounts/oauth/xbox/callback
```

**Development:**
```
http://localhost:3000/auth/xbox/callback
```

#### Scopes Required

- `XboxLive.signin` - Basic Xbox Live authentication
- `XboxLive.offline_access` - Refresh token access (for long-lived sessions)

#### User Information Available

- **Xbox User ID:** Unique identifier
- **Gamertag:** Xbox Live gamertag
- **Profile Picture:** Avatar URL (if available)
- **Gaming Activity:** Play history, achievements (requires additional API calls)

#### Special Considerations

- Uses Azure AD OAuth 2.0 flow
- Supports refresh tokens (stored for session renewal)
- Token expiration: ~1 hour (use refresh token)
- Requires Microsoft account authentication
- May need additional API permissions for clip/game data access

#### Testing Checklist

- [ ] Azure AD app registration created
- [ ] Client ID and Secret retrieved
- [ ] Environment variables set
- [ ] Integration enabled: `XBOX_API_ENABLED=true`
- [ ] Redirect URI configured correctly
- [ ] Test OAuth flow in frontend
- [ ] Verify tokens saved in database
- [ ] Test refresh token flow (if applicable)

---

### 3. PlayStation Network (PSN) OAuth Integration

**Provider:** Sony Interactive Entertainment  
**Protocol:** OAuth 2.0  
**Current Implementation:** Lines 168-241 in `platform_oauth.py`

#### Setup Requirements

1. **Developer Portal:** https://developer.playstation.com/
2. **Registration:** Requires PlayStation Partner Program enrollment
3. **Credentials:** Client ID + Client Secret
4. **Review Timeline:** 2-4 weeks for application approval (partnership required)

#### Credentials Needed

- `PLAYSTATION_CLIENT_ID` - OAuth application Client ID
- `PLAYSTATION_CLIENT_SECRET` - OAuth application Client Secret

#### Configuration Steps

1. Visit https://developer.playstation.com/
2. **IMPORTANT:** Apply for PlayStation Partner Program (if not already enrolled)
3. Once approved, navigate to **My Applications**
4. Create new OAuth application:
   - **Application Name:** "Cosmiv"
   - **Description:** "AI Gaming Montage Platform"
   - **Redirect URIs:** 
     - `https://yourdomain.com/api/v2/accounts/oauth/playstation/callback`
5. Copy **Client ID** → Set as `PLAYSTATION_CLIENT_ID`
6. Generate **Client Secret** → Set as `PLAYSTATION_CLIENT_SECRET`
7. Set environment variables:
   - `PLAYSTATION_API_ENABLED=true`
   - `PLAYSTATION_CLIENT_ID=your_client_id`
   - `PLAYSTATION_CLIENT_SECRET=your_client_secret`

#### Callback URL Configuration

**Production:**
```
https://yourdomain.com/api/v2/accounts/oauth/playstation/callback
```

**Development:**
```
http://localhost:3000/auth/playstation/callback
```

#### Scopes Required

- `psn:clientapp` - Basic PlayStation Network access
- **Additional scopes may be needed for:**
  - Game data access
  - Clip/screenshot access
  - Social features

**Note:** Verify required scopes in PlayStation API documentation for specific features.

#### User Information Available

- **PSN Online ID:** Username
- **Account ID:** Unique identifier
- **Profile Information:** Avatar, country, language preferences
- **Game Data:** Requires additional API permissions

#### Special Considerations

- **Partnership Required:** Must be approved PlayStation Partner
- **Review Process:** 2-4 weeks for new applications
- **Regional Restrictions:** Some features may vary by region
- **Rate Limits:** Check API documentation for current limits
- **Clip Access:** May require additional permissions for gameplay clip APIs

#### Testing Checklist

- [ ] PlayStation Partner Program enrollment completed
- [ ] Developer account approved
- [ ] OAuth application created
- [ ] Client ID and Secret retrieved
- [ ] Environment variables set
- [ ] Integration enabled: `PLAYSTATION_API_ENABLED=true`
- [ ] Redirect URI configured correctly
- [ ] Test OAuth flow in frontend
- [ ] Verify tokens saved in database

---

### 4. Nintendo Switch OAuth Integration

**Provider:** Nintendo Co., Ltd.  
**Protocol:** OAuth 2.0  
**Current Implementation:** Lines 244-317 in `platform_oauth.py`

#### Setup Requirements

1. **Developer Portal:** https://developer.nintendo.com/
2. **Registration:** Nintendo Developer Portal account required
3. **Credentials:** Client ID + Client Secret
4. **Review Timeline:** 1-2 weeks for application approval

#### Credentials Needed

- `NINTENDO_CLIENT_ID` - OAuth application Client ID
- `NINTENDO_CLIENT_SECRET` - OAuth application Client Secret

#### Configuration Steps

1. Visit https://developer.nintendo.com/
2. Create Nintendo Developer account (if not already registered)
3. Navigate to **My Applications** or **API Management**
4. Create new OAuth application:
   - **Application Name:** "Cosmiv"
   - **Application Type:** Web Application
   - **Redirect URIs:** 
     - `https://yourdomain.com/api/v2/accounts/oauth/nintendo/callback`
5. Submit application for review
6. Once approved, copy **Client ID** → Set as `NINTENDO_CLIENT_ID`
7. Generate **Client Secret** → Set as `NINTENDO_CLIENT_SECRET`
8. Set environment variables:
   - `NINTENDO_API_ENABLED=true`
   - `NINTENDO_CLIENT_ID=your_client_id`
   - `NINTENDO_CLIENT_SECRET=your_client_secret`

#### Callback URL Configuration

**Production:**
```
https://yourdomain.com/api/v2/accounts/oauth/nintendo/callback
```

**Development:**
```
http://localhost:3000/auth/nintendo/callback
```

#### Scopes Required

- `openid` - OpenID Connect authentication
- `user` - Basic user profile information
- **Additional scopes may be needed for:**
  - Game data access
  - Screenshot/video clip access (if available)

**Note:** Nintendo API capabilities are more limited compared to other platforms. Verify available scopes in Nintendo Developer documentation.

#### User Information Available

- **Nintendo Account ID:** Unique identifier
- **Nickname:** Display name
- **Email:** (if scope granted)
- **Profile Picture:** Avatar URL (if available)

#### Special Considerations

- **Limited API:** Nintendo has more restrictive API access compared to other platforms
- **Application Review:** Requires approval process
- **Clip Access:** May have limited or no access to gameplay clips/videos
- **Regional Availability:** Some features may vary by region
- **Nintendo Account:** Users must have Nintendo Account (not just Nintendo Switch Online)

#### Testing Checklist

- [ ] Nintendo Developer account created
- [ ] OAuth application submitted for review
- [ ] Application approved
- [ ] Client ID and Secret retrieved
- [ ] Environment variables set
- [ ] Integration enabled: `NINTENDO_API_ENABLED=true`
- [ ] Redirect URI configured correctly
- [ ] Test OAuth flow in frontend
- [ ] Verify tokens saved in database

---

## 💳 Billing Integration (Stripe)

### Overview

Stripe billing infrastructure is ready in `backend/src/api_billing_v2.py`. Currently in mock mode until live credentials are configured.

**Current Status:**
- ✅ Billing API endpoints implemented
- ✅ Webhook handler structure ready
- ✅ Subscription plan models defined
- ❌ Live Stripe keys not configured
- ❌ Webhooks not tested with live events

### Setup Requirements

1. **Stripe Account:** https://dashboard.stripe.com/register
2. **Registration:** Free to create, 2.9% + $0.30 per transaction (standard pricing)
3. **Credentials:** API keys + Webhook signing secret
4. **Review Timeline:** Immediate (can use test mode first)

### Configuration Steps

1. **Create Stripe Account:**
   - Visit https://dashboard.stripe.com/register
   - Complete account setup
   - Verify email address

2. **Get API Keys:**
   - Go to **Developers** → **API keys**
   - **Test Mode Keys** (for development):
     - Copy **Publishable key** → Set as `STRIPE_PUBLISHABLE_KEY`
     - Copy **Secret key** → Set as `STRIPE_SECRET_KEY`
   - **Live Mode Keys** (for production):
     - Toggle to **Live mode**
     - Copy **Publishable key** → Set as `STRIPE_PUBLISHABLE_KEY`
     - Copy **Secret key** → Set as `STRIPE_SECRET_KEY`

3. **Create Products & Prices:**
   - Go to **Products** → **Add product**
   - **Product 1:**
     - Name: "Pro Plan"
     - Price: $9.00/month (recurring)
     - Copy **Price ID** → Set as `STRIPE_PRICE_ID_PRO`
   - **Product 2:**
     - Name: "Creator+ Plan"
     - Price: $19.00/month (recurring)
     - Copy **Price ID** → Set as `STRIPE_PRICE_ID_CREATOR`

4. **Configure Webhooks:**
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - **Endpoint URL:** `https://yourdomain.com/api/v2/billing/webhook`
   - **Events to listen for:**
     - `checkout.session.completed` - User subscribes
     - `customer.subscription.deleted` - User cancels
     - `customer.subscription.updated` - Subscription changes
     - `invoice.payment_succeeded` - Payment succeeds
     - `invoice.payment_failed` - Payment fails
   - Click **Add endpoint**
   - Copy **Signing secret** → Set as `STRIPE_WEBHOOK_SECRET`

5. **Set Environment Variables:**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID_PRO=price_...
   STRIPE_PRICE_ID_CREATOR=price_...
   ```

### Webhook Events Required

| Event | Purpose | Handler Location |
|-------|---------|------------------|
| `checkout.session.completed` | User completes subscription purchase | `api_billing_v2.py` line ~200+ |
| `customer.subscription.deleted` | User cancels subscription | `api_billing_v2.py` |
| `customer.subscription.updated` | Subscription plan changes | `api_billing_v2.py` |
| `invoice.payment_succeeded` | Monthly payment succeeds | `api_billing_v2.py` |
| `invoice.payment_failed` | Payment fails, retry needed | `api_billing_v2.py` |

### Local Webhook Testing

Use Stripe CLI for local development:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:8000/api/v2/billing/webhook
```

This will output a webhook secret (starts with `whsec_`) - use this for `STRIPE_WEBHOOK_SECRET` in development.

Trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

### Testing Checklist

- [ ] Stripe account created
- [ ] API keys retrieved (test and live)
- [ ] Products and Prices created
- [ ] Webhook endpoint configured
- [ ] Webhook signing secret copied
- [ ] Environment variables set
- [ ] Test webhook locally with Stripe CLI
- [ ] Test subscription flow in frontend
- [ ] Verify webhook events received
- [ ] Test subscription cancellation
- [ ] Verify database updates (Entitlement table)

---

## 📱 Social Media API Integrations

**Status:** Mock implementations ready, real APIs need configuration

### Available Integrations

1. **TikTok API** - `TIKTOK_API_ENABLED=true`
2. **YouTube API** - `YOUTUBE_API_ENABLED=true`
3. **Instagram API** - `INSTAGRAM_API_ENABLED=true`

**Implementation Location:** `backend/src/services/social_posters.py`

### Next Steps

- Research TikTok Business API requirements
- Set up YouTube Data API v3 OAuth credentials
- Configure Instagram Graph API (requires Facebook Developer account)

---

## 🔐 Environment Variables Checklist

### Required for Production

#### OAuth Credentials
- [ ] `STEAM_API_KEY`
- [ ] `XBOX_CLIENT_ID`
- [ ] `XBOX_CLIENT_SECRET`
- [ ] `PLAYSTATION_CLIENT_ID`
- [ ] `PLAYSTATION_CLIENT_SECRET`
- [ ] `NINTENDO_CLIENT_ID`
- [ ] `NINTENDO_CLIENT_SECRET`

#### OAuth Enable Flags
- [ ] `STEAM_API_ENABLED=true`
- [ ] `XBOX_API_ENABLED=true`
- [ ] `PLAYSTATION_API_ENABLED=true`
- [ ] `NINTENDO_API_ENABLED=true`

#### Billing (Stripe)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_ID_PRO`
- [ ] `STRIPE_PRICE_ID_CREATOR`

#### Security
- [ ] `JWT_SECRET_KEY` (CRITICAL: Must be unique, secure random string)
- [ ] `ENCRYPTION_KEY` (for OAuth token storage)

#### Database
- [ ] `POSTGRES_DSN` (production database URL)
- [ ] `DB_PATH` (if using SQLite in development)

#### Storage
- [ ] `S3_ENDPOINT_URL`
- [ ] `S3_ACCESS_KEY`
- [ ] `S3_SECRET_KEY`
- [ ] `S3_BUCKET`
- [ ] `S3_REGION`

#### AI Services (Optional)
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `AI_PROVIDER`
- [ ] `AI_DEFAULT_MODEL`

#### Base URL
- [ ] `BASE_URL` (production domain, e.g., `https://cosmiv.app`)

---

## ✅ Testing & Verification

### OAuth Flow Testing

1. **Frontend Testing:**
   - Navigate to `/accounts` tab
   - Click "Link" button for each platform
   - Verify redirect to OAuth provider
   - Complete authentication
   - Verify redirect back to app
   - Check that platform shows as "Connected"

2. **Backend Verification:**
   - Check database `UserAuth` table
   - Verify `platform_user_id` and `platform_username` saved
   - Verify `access_token` encrypted/stored
   - Check `expires_at` timestamp

3. **Error Handling:**
   - Test with invalid credentials
   - Test with disabled API flags
   - Verify error messages shown to user
   - Check backend logs for errors

### Billing Flow Testing

1. **Subscription Testing:**
   - Navigate to `/billing` tab
   - Click "Subscribe" for Pro or Creator+ plan
   - Complete Stripe checkout flow
   - Verify webhook received
   - Check database `Entitlement` table
   - Verify user plan updated

2. **Webhook Testing:**
   - Use Stripe CLI for local testing
   - Verify webhook signature validation
   - Test all webhook events
   - Check error handling for invalid signatures

---

## 📞 Support & Resources

### Platform Documentation Links

- **Steam:** https://steamcommunity.com/dev
- **Xbox:** https://docs.microsoft.com/en-us/gaming/xbox-live/
- **PlayStation:** https://developer.playstation.com/documentation/
- **Nintendo:** https://developer.nintendo.com/
- **Stripe:** https://stripe.com/docs

### ChatGPT Prompts for Help

- "How do I set up Xbox Live OAuth for a web application step by step?"
- "What scopes do I need for PlayStation Network API to access gameplay clips?"
- "Nintendo Switch OAuth setup guide for developers"
- "Stripe webhook setup guide for subscription billing in FastAPI"
- "How to handle Stripe subscription lifecycle events"

---

## 🚀 Next Steps

1. **Immediate Priority:**
   - [ ] Set up Steam OAuth (easiest, no approval needed)
   - [ ] Configure Stripe test mode for development
   - [ ] Test OAuth flows locally

2. **High Priority:**
   - [ ] Apply for PlayStation Partner Program (if needed)
   - [ ] Set up Xbox Live OAuth
   - [ ] Configure Stripe live mode for production

3. **Medium Priority:**
   - [ ] Apply for Nintendo Developer access
   - [ ] Research TikTok/YouTube API requirements
   - [ ] Set up social media posting integrations

---

**Last Updated:** 2025-01-27  
**Next Review:** After first OAuth integration completed

