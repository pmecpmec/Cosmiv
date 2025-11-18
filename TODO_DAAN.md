# TODO_DAAN.md

_Last updated: 2025-01-28_

## 👋 Welcome, Daan (DeWindWaker)!

This is your **non-technical task list**. These are tasks that involve API integrations, external service setup, design research, and business development—things that don't require coding but are essential for Cosmiv.

**Note:** Pedro (pmec) is handling all technical development and coding. Check `TODO_PEDRO.md` to see what he's working on.

---

## ✅ Current Snapshot

| Area                   | Status          | Notes                                                    |
| ---------------------- | --------------- | -------------------------------------------------------- |
| Stripe Billing         | ⏳ Pending      | Need to set up Stripe account and API keys               |
| Steam OAuth            | ⏳ Pending      | Need Steam API key                                       |
| Xbox OAuth             | ⏳ Pending      | Need Xbox/Windows Developer account                      |
| PlayStation OAuth      | ⏳ Pending      | Need PlayStation Developer account                       |
| Nintendo OAuth         | ⏳ Pending      | Need Nintendo Developer account                          |
| Discord Integration    | ⏳ Pending      | Need Discord bot application                             |
| Twitch Integration     | ⏳ Pending      | Need Twitch API credentials                              |
| Design Research        | ⚙️ In Progress | Broken Planet styling reference materials                |
| Email Setup            | ⏳ Pending      | Need email service API key (SendGrid/Mailgun)            |

---

## 🚀 High Priority Tasks

### 1. Stripe Billing Setup (Priority: CRITICAL)

**Goal:** Get Stripe set up so users can subscribe to Cosmiv plans.

**Why:** This is how we make money! Users need to be able to subscribe to Cosmic Cadet (Free), Nebula Knight (Pro), or Creator+ plans.

**Steps:**

1. **Create Stripe Account** (if you don't have one)
   - Go to: https://stripe.com
   - Sign up for a new account
   - Complete business verification (you'll need business details)

2. **Get API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the **Publishable key** (starts with `pk_test_...`)
   - Copy the **Secret key** (starts with `sk_test_...`) - Click "Reveal" to see it
   - **Important:** Save these keys somewhere safe (password manager recommended)

3. **Set Up Webhook** (Pedro will need this)
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Enter webhook URL (Pedro will give you this after deployment)
   - Select these events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Webhook signing secret** (starts with `whsec_...`)

4. **Share with Pedro**
   - Give Pedro these three keys:
     - Publishable key (`STRIPE_PUBLISHABLE_KEY`)
     - Secret key (`STRIPE_SECRET_KEY`)
     - Webhook secret (`STRIPE_WEBHOOK_SECRET`)
   - Tell him: "These are the Stripe keys for Cosmiv billing"

**What You'll Get:** Three API keys (publishable, secret, webhook secret)

**Time Needed:** 15-20 minutes

**Follow-up:** Once Pedro adds them, test by trying to subscribe in the app. Start with test mode, then activate live mode when ready.

**Questions?** Stripe has great documentation: https://stripe.com/docs

---

### 2. Email Service Setup (Priority: HIGH)

**Goal:** Set up email service so we can send password reset emails, notifications, and welcome emails.

**Why:** Users need email verification, password resets, and notifications. We need a reliable email service.

**Steps:**

1. **Choose Email Service** (Recommended: SendGrid)
   - SendGrid: https://sendgrid.com (free tier: 100 emails/day)
   - Mailgun: https://www.mailgun.com (free tier: 5,000 emails/month)
   - I recommend SendGrid for simplicity

2. **Create SendGrid Account**
   - Go to: https://signup.sendgrid.com
   - Sign up for free account
   - Verify your email address

3. **Create API Key**
   - Go to: https://app.sendgrid.com/settings/api_keys
   - Click "Create API Key"
   - Name it: "Cosmiv Production"
   - Give it "Full Access" permissions (or at least Mail Send)
   - Click "Create & View"
   - **Important:** Copy the API key immediately (you won't see it again!)
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Verify Domain** (Optional but Recommended)
   - Go to: https://app.sendgrid.com/settings/sender_auth/domains/create
   - Add your domain (e.g., `cosmiv.com`)
   - Follow DNS setup instructions (Pedro can help with DNS)

5. **Share with Pedro**
   - Give Pedro the API key
   - Tell him: "This is the SendGrid API key for email sending"

**What You'll Get:** An API key (starts with `SG.`)

**Time Needed:** 10-15 minutes

**Follow-up:** Pedro will configure it. Then test by requesting a password reset in the app.

**Questions?** SendGrid docs: https://docs.sendgrid.com/for-developers/sending-email/api-getting-started

---

### 3. Steam OAuth Setup (Priority: HIGH)

**Goal:** Connect Cosmiv to Steam so users can link their Steam accounts and automatically discover gameplay clips.

**Why:** Steam is one of the biggest gaming platforms. Many users want to connect their Steam account to find their clips automatically.

**Steps:**

1. **Get Steam Web API Key**
   - Go to: https://steamcommunity.com/dev/apikey
   - Log in with your Steam account
   - You might need to add $5 to your Steam wallet (one-time requirement)
   - Click "Register a new Steam Web API Key"
   - Domain name: Enter your website domain (e.g., `cosmiv.com`)
   - Click "Register"
   - Copy the API key (it's a long string of letters and numbers)

2. **Share with Pedro**
   - Give Pedro the API key
   - Tell him: "This is the Steam API key for OAuth integration"
   - He'll add it as `STEAM_API_KEY` in the environment variables

**What You'll Get:** A Steam Web API key

**Time Needed:** 5-10 minutes (plus Steam wallet funding if needed)

**Follow-up:** Once Pedro integrates it, test by trying to link a Steam account in the app.

**Questions?** Steam Web API docs: https://steamcommunity.com/dev

---

## 🎮 Medium Priority Tasks

### 4. Xbox OAuth Setup (Priority: MEDIUM)

**Goal:** Connect Cosmiv to Xbox/Windows so users can link their Xbox accounts.

**Why:** Xbox Game Pass and Xbox Live have a huge user base. Users want to connect their Xbox accounts.

**Steps:**

1. **Create Azure App Registration** (Xbox uses Microsoft Azure)
   - Go to: https://portal.azure.com
   - Sign in with Microsoft account
   - Go to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "Cosmiv"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Add `https://cosmiv.com/api/v2/auth/xbox/callback` (Pedro will give you exact URL)
   - Click "Register"

2. **Get Client Credentials**
   - After registration, go to "Overview"
   - Copy the **Application (client) ID** (looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - Go to "Certificates & secrets" → "New client secret"
   - Description: "Cosmiv Production"
   - Expires: Choose appropriate timeframe
   - Click "Add"
   - **Important:** Copy the **Value** immediately (you won't see it again!)

3. **Configure API Permissions**
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Xbox Live" (or search for it)
   - Add permission: `XboxLive.signin`, `XboxLive.offline_access`
   - Click "Add permissions"
   - Note: You may need admin consent depending on your tenant

4. **Share with Pedro**
   - Give Pedro:
     - Application (client) ID (`XBOX_CLIENT_ID`)
     - Client secret value (`XBOX_CLIENT_SECRET`)
   - Tell him: "These are the Xbox OAuth credentials"

**What You'll Get:** Client ID and Client Secret

**Time Needed:** 20-30 minutes

**Follow-up:** Pedro will integrate it. Test by trying to link an Xbox account.

**Questions?** Microsoft Identity Platform docs: https://docs.microsoft.com/en-us/azure/active-directory/develop/

---

### 5. PlayStation OAuth Setup (Priority: MEDIUM)

**Goal:** Connect Cosmiv to PlayStation Network so users can link their PSN accounts.

**Why:** PlayStation has millions of users. They want to connect their PlayStation accounts too.

**Steps:**

1. **Create PlayStation Developer Account**
   - Go to: https://developer.playstation.com
   - Sign up for developer account (may require approval)
   - Complete business verification if needed

2. **Create Application**
   - Once approved, go to "My Applications"
   - Click "Create Application"
   - Fill in application details:
     - Name: "Cosmiv"
     - Description: "AI-powered gaming montage platform"
     - Redirect URI: Get from Pedro (e.g., `https://cosmiv.com/api/v2/auth/playstation/callback`)
   - Click "Create"

3. **Get Client Credentials**
   - After creating app, you'll see:
     - **Client ID** (NPSO ID)
     - **Client Secret** (NPSO Secret)
   - **Important:** Copy both immediately and store safely

4. **Share with Pedro**
   - Give Pedro:
     - Client ID (`PLAYSTATION_CLIENT_ID`)
     - Client Secret (`PLAYSTATION_CLIENT_SECRET`)
   - Tell him: "These are the PlayStation OAuth credentials"

**What You'll Get:** Client ID and Client Secret

**Time Needed:** 30-60 minutes (may require account approval)

**Follow-up:** Once Pedro integrates, test by linking a PlayStation account.

**Questions?** PlayStation Developer docs: https://developer.playstation.com/documentation

---

### 6. Nintendo OAuth Setup (Priority: MEDIUM)

**Goal:** Connect Cosmiv to Nintendo so users can link their Nintendo Switch accounts.

**Why:** Nintendo Switch is huge. Users want to connect their Nintendo accounts.

**Steps:**

1. **Create Nintendo Developer Account**
   - Go to: https://developer.nintendo.com
   - Sign up for developer account
   - Complete developer registration (may require business verification)

2. **Create Application**
   - Once approved, go to "My Applications"
   - Click "Create New Application"
   - Fill in details:
     - Application Name: "Cosmiv"
     - Description: "AI-powered gaming montage platform"
     - Redirect URI: Get from Pedro (e.g., `https://cosmiv.com/api/v2/auth/nintendo/callback`)
   - Submit for approval

3. **Get Client Credentials**
   - After approval, you'll receive:
     - **Client ID**
     - **Client Secret**
   - Store these securely

4. **Share with Pedro**
   - Give Pedro:
     - Client ID (`NINTENDO_CLIENT_ID`)
     - Client Secret (`NINTENDO_CLIENT_SECRET`)
   - Tell him: "These are the Nintendo OAuth credentials"

**What You'll Get:** Client ID and Client Secret

**Time Needed:** 1-2 hours (may require account approval and review)

**Follow-up:** Once integrated, test by linking a Nintendo account.

**Questions?** Nintendo Developer Portal: https://developer.nintendo.com

---

### 7. Discord Integration Setup (Priority: MEDIUM)

**Goal:** Allow users to link their Discord accounts for profile integration.

**Why:** Many gamers use Discord. Linking Discord accounts makes profiles more complete.

**Steps:**

1. **Create Discord Application**
   - Go to: https://discord.com/developers/applications
   - Log in with Discord account
   - Click "New Application"
   - Name: "Cosmiv"
   - Click "Create"

2. **Configure OAuth2**
   - Go to "OAuth2" → "General"
   - Copy the **Client ID** (looks like: `123456789012345678`)
   - Go to "OAuth2" → "URL Generator"
   - Scopes: Select `identify` and `email`
   - Redirect: Add Pedro's callback URL (e.g., `https://cosmiv.com/api/v2/auth/discord/callback`)
   - Copy the generated OAuth2 URL

3. **Get Client Secret**
   - Go back to "OAuth2" → "General"
   - Under "Client Secret", click "Reset Secret" or "Copy"
   - **Important:** Copy the secret immediately (you won't see it again!)

4. **Share with Pedro**
   - Give Pedro:
     - Client ID (`DISCORD_CLIENT_ID`)
     - Client Secret (`DISCORD_CLIENT_SECRET`)
   - Tell him: "These are the Discord OAuth credentials"

**What You'll Get:** Client ID and Client Secret

**Time Needed:** 10-15 minutes

**Follow-up:** Test by linking a Discord account in the app.

**Questions?** Discord Developer Portal: https://discord.com/developers/docs

---

### 8. Twitch Integration Setup (Priority: MEDIUM)

**Goal:** Allow users to link their Twitch accounts and potentially import stream highlights.

**Why:** Many content creators stream on Twitch. Connecting Twitch accounts is valuable.

**Steps:**

1. **Create Twitch Application**
   - Go to: https://dev.twitch.tv/console/apps
   - Log in with Twitch account
   - Click "Register Your Application"
   - Name: "Cosmiv"
   - OAuth Redirect URLs: Add Pedro's callback URL (e.g., `https://cosmiv.com/api/v2/auth/twitch/callback`)
   - Category: "Website Integration" or "Desktop Application"
   - Click "Create"

2. **Get Client Credentials**
   - After creating, you'll see:
     - **Client ID** (looks like: `abc123def456ghi789jkl`)
     - Click "New Secret" to generate **Client Secret**
   - **Important:** Copy the secret immediately!

3. **Share with Pedro**
   - Give Pedro:
     - Client ID (`TWITCH_CLIENT_ID`)
     - Client Secret (`TWITCH_CLIENT_SECRET`)
   - Tell him: "These are the Twitch API credentials"

**What You'll Get:** Client ID and Client Secret

**Time Needed:** 10-15 minutes

**Follow-up:** Test by linking a Twitch account.

**Questions?** Twitch Developer docs: https://dev.twitch.tv/docs

---

## 🎨 Design & Research Tasks

### 9. Design Research - Broken Planet Style (Priority: MEDIUM)

**Goal:** Gather reference materials and inspiration for Broken Planet streetwear aesthetic integration.

**Why:** Cosmiv has a cosmic, futuristic theme, but we want to incorporate Broken Planet's glitchy, neon, streetwear aesthetic for certain elements (error states, special effects, etc.).

**Steps:**

1. **Research Broken Planet Aesthetic**
   - Collect images of Broken Planet clothing/designs
   - Note key design elements:
     - Glitch pink (`#FF0080`)
     - Hot pink (`#FF00FF`)
     - Neon gradients
     - Scanlines (CRT-style lines)
     - RGB channel separation
     - Chromatic aberration effects

2. **Create Design Reference Document**
   - Save images to a shared folder or design tool (Figma, etc.)
   - Document color codes
   - Note when to use these styles (error states, special effects, etc.)
   - Share with Pedro for implementation reference

3. **Find Implementation Examples**
   - Look for CSS/JavaScript examples of glitch effects
   - Find scanline effect implementations
   - Note any animation techniques

**What You'll Get:** Design reference collection and style guide

**Time Needed:** 2-3 hours of research

**Follow-up:** Share findings with Pedro so he can implement the styling.

**Questions?** Check existing style references in the codebase or ask Pedro.

---

### 10. Social Media Integration Research (Priority: LOW)

**Goal:** Research how to integrate with YouTube, TikTok, Instagram for profile linking and content sharing.

**Why:** Users want to connect their social media accounts and share Cosmiv videos directly to these platforms.

**Steps:**

1. **Research YouTube API**
   - Check YouTube Data API v3 documentation
   - Understand OAuth requirements
   - Note API rate limits
   - Document what's needed for integration

2. **Research TikTok API**
   - Check TikTok for Developers
   - Understand TikTok Login Kit
   - Note any restrictions or requirements
   - Document integration process

3. **Research Instagram Basic Display API**
   - Check Instagram Graph API documentation
   - Understand OAuth flow
   - Note what data is available
   - Document requirements

4. **Create Integration Plan Document**
   - List what's needed for each platform
   - Prioritize which to implement first
   - Share with Pedro for technical feasibility

**What You'll Get:** Research document with integration requirements

**Time Needed:** 3-4 hours of research

**Follow-up:** Discuss priority with Pedro and plan implementation.

**Questions?** Check official developer documentation for each platform.

---

## 📋 Quick Reference

### API Keys to Collect

| Service      | Key Names                        | Status | Where to Get It                      |
| ------------ | -------------------------------- | ------ | ------------------------------------ |
| Stripe       | Publishable, Secret, Webhook     | ⏳     | https://dashboard.stripe.com         |
| SendGrid     | API Key                          | ⏳     | https://app.sendgrid.com             |
| Steam        | API Key                          | ⏳     | https://steamcommunity.com/dev       |
| Xbox         | Client ID, Client Secret         | ⏳     | https://portal.azure.com             |
| PlayStation  | Client ID, Client Secret         | ⏳     | https://developer.playstation.com    |
| Nintendo     | Client ID, Client Secret         | ⏳     | https://developer.nintendo.com       |
| Discord      | Client ID, Client Secret         | ⏳     | https://discord.com/developers       |
| Twitch       | Client ID, Client Secret         | ⏳     | https://dev.twitch.tv/console        |

### Important Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **SendGrid Dashboard:** https://app.sendgrid.com
- **Steam Web API:** https://steamcommunity.com/dev
- **Azure Portal:** https://portal.azure.com
- **PlayStation Developer:** https://developer.playstation.com
- **Nintendo Developer:** https://developer.nintendo.com
- **Discord Developer:** https://discord.com/developers
- **Twitch Developer:** https://dev.twitch.tv

### Security Reminders

- ⚠️ **Never commit API keys to the repository**
- ⚠️ **Store keys in a password manager**
- ⚠️ **Share keys securely with Pedro** (encrypted message or secure channel)
- ⚠️ **Use test/development keys first, then switch to production**

---

## 📊 Progress Log

| Date       | Task                     | Status | Notes                           |
| ---------- | ------------------------ | ------ | ------------------------------- |
| 2025-01-28 | Initial TODO list created | ✅     | Structured tasks for Daan      |

---

## 🤝 Working with Pedro

**When you complete a task:**

1. Mark it as done in this file
2. Share the API keys/credentials with Pedro securely
3. Update the progress log
4. Test the integration once Pedro implements it

**When you need help:**

- Ask Pedro if something is unclear
- Check official developer documentation
- Use ChatGPT/Claude for step-by-step guidance

**Remember:**

- These tasks don't require coding—just following steps and getting API keys
- Pedro will handle all the technical implementation
- Don't worry if some services require approval—that's normal
- Start with the HIGH priority tasks first

---

_Last updated: 2025-01-28_



