# TODO_DAAN.md

_Last updated: 2025-01-27 by agent_cosmiv_sync_

## 👋 Welcome, Daan (DeWindWaker)

You're in charge of **API integrations**, **external service connections**, and **design inspiration** for **Cosmiv**, the AI Gaming Montage Platform.  
You'll mostly use **ChatGPT** to figure out things step-by-step.  
Focus on verifying APIs, researching credentials, and keeping design direction fresh.

---

## ✅ Current Snapshot

| Area                       | Status                  | Notes                                                    |
| -------------------------- | ----------------------- | -------------------------------------------------------- |
| Steam/Xbox/PS/Switch OAuth | ⚙️ Mock mode            | OAuth handlers exist but need real credentials + testing |
| Billing (Stripe)           | ⚙️ Mock mode            | Structure ready, needs webhook setup + live keys         |
| Weekly Montage Automation  | ⚙️ Infrastructure ready | Celery beat exists, needs destination config             |
| Social Media Posting       | ⚙️ Mock mode            | TikTok/YouTube/Instagram endpoints ready, need real APIs |
| Design References          | ✅ Space theme implemented | Cosmic background with animated planet, space-themed UI colors (violet → deep blue → neon cyan) |

---

## 📋 Collaborative Phases Overview

Quick reference for all phases you can work on together:

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| **Phase 1** | API Testing & Documentation | 1-2 weeks | ⬜ Not started |
| **Phase 2** | Content Creation & Marketing Prep | 1 week | ⬜ Not started |
| **Phase 3** | User Research & Feedback | 2 weeks | ⬜ Not started |
| **Phase 4** | Design System & Style Guide | 1 week | ⬜ Not started |
| **Phase 5** | API Integration Documentation | 1 week | ⬜ Not started |
| **Phase 6** | Testing & QA Coordination | Ongoing | ⬜ Not started |
| **Phase 7** | Content Strategy & Community Building | Ongoing | ⬜ Not started |
| **Phase 8** | Launch Preparation | 1-2 weeks | ⬜ Not started |
| **Phase 9** | Post-Launch Analysis | Weekly | ⬜ Not started |

**Start with:** Phase 1 (API Testing) or Phase 2 (Content Creation) - pick what feels most urgent!

---

## 🚀 Tasks To Do

### 🎮 Platform OAuth Setup (Priority: High)

**Goal:** Enable real OAuth for Steam, Xbox, PlayStation, and Nintendo Switch

**Steps:**

1. **Steam OpenID Setup:**

   - Get Steam API key from: https://steamcommunity.com/dev/apikey
   - Set `STEAM_API_KEY` in `.env` file (backend/.env or production env)
   - Test callback URL: should be `https://yourdomain.com/api/v2/accounts/oauth/steam/callback`
   - Verify scopes: Steam uses OpenID 2.0 (no scopes needed, but check docs)
   - File to check: `backend/src/services/platform_oauth.py` (lines 16-88)

2. **Xbox Live OAuth:**

   - Register app at: https://portal.azure.com → Azure Active Directory → App registrations
   - Get `XBOX_CLIENT_ID` and `XBOX_CLIENT_SECRET`
   - Set redirect URI to: `https://yourdomain.com/api/v2/accounts/oauth/xbox/callback`
   - Required scopes: `XboxLive.signin XboxLive.offline_access`
   - Test the flow: File location `backend/src/services/platform_oauth.py` (lines 91-165)
   - Set environment variables: `XBOX_API_ENABLED=true`, `XBOX_CLIENT_ID`, `XBOX_CLIENT_SECRET`

3. **PlayStation Network (PSN) OAuth:**

   - Register at: https://developer.playstation.com/
   - Create OAuth application, get Client ID and Secret
   - Set redirect URI: `https://yourdomain.com/api/v2/accounts/oauth/playstation/callback`
   - Required scope: `psn:clientapp` (check if more are needed for clip access)
   - Set env vars: `PLAYSTATION_API_ENABLED=true`, `PLAYSTATION_CLIENT_ID`, `PLAYSTATION_CLIENT_SECRET`
   - File location: `backend/src/services/platform_oauth.py` (lines 168-241)

4. **Nintendo Switch OAuth:**
   - Register at: https://developer.nintendo.com/
   - Create OAuth app, get Client ID and Secret
   - Redirect URI: `https://yourdomain.com/api/v2/accounts/oauth/nintendo/callback`
   - Required scopes: `openid user` (verify if additional scopes needed for gameplay data)
   - Set env vars: `NINTENDO_API_ENABLED=true`, `NINTENDO_CLIENT_ID`, `NINTENDO_CLIENT_SECRET`
   - File location: `backend/src/services/platform_oauth.py` (lines 244-317)

**Testing:**

- Once credentials are set, test each OAuth flow in the frontend: `/accounts` tab → click "Link" for each platform
- Check browser console for errors
- Verify tokens are saved in database (Pedro can help check `UserAuth` table)

**Documentation Help:**

- Ask ChatGPT: "How do I set up Xbox Live OAuth for a web application?"
- Ask ChatGPT: "What scopes do I need for PlayStation Network API to access gameplay clips?"
- Ask ChatGPT: "Nintendo Switch OAuth setup guide for developers"

---

### 💳 Billing Integration (Priority: High)

**Goal:** Replace mock Stripe with live billing + webhook handling

**Steps:**

1. **Stripe Account Setup:**

   - Create Stripe account: https://dashboard.stripe.com/register
   - Get API keys: Dashboard → Developers → API keys
   - Set environment variables:
     - `STRIPE_SECRET_KEY` (sk*live*... for production, sk*test*... for testing)
     - `STRIPE_PUBLISHABLE_KEY` (pk*live*... or pk*test*...)
     - `STRIPE_PRICE_ID_PRO` (create price ID for Pro plan in Stripe dashboard)
     - `STRIPE_PRICE_ID_CREATOR` (create price ID for Creator+ plan)

2. **Webhook Setup:**

   - In Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/v2/billing/webhook`
   - Copy webhook signing secret, set as `STRIPE_WEBHOOK_SECRET` in environment
   - Required events to listen for:
     - `checkout.session.completed` (when user subscribes)
     - `customer.subscription.deleted` (when user cancels)
     - `customer.subscription.updated` (when subscription changes)
     - `invoice.payment_succeeded` (when payment succeeds)
     - `invoice.payment_failed` (when payment fails)
   - File to check: `backend/src/api_billing_v2.py` (webhook handler exists around line 200+)

3. **Test Webhook Locally:**

   - Use Stripe CLI: `stripe listen --forward-to localhost:8000/api/v2/billing/webhook`
   - This gives you a webhook secret to test with
   - Trigger test events: `stripe trigger checkout.session.completed`

4. **Plan Configuration:**
   - In Stripe Dashboard, create Products and Prices:
     - "Pro Plan" - $9/month recurring
     - "Creator+ Plan" - $19/month recurring
   - Copy the Price IDs and add to environment variables

**Documentation Help:**

- Ask ChatGPT: "Stripe webhook setup guide for subscription billing"
- Ask ChatGPT: "How to handle Stripe subscription lifecycle events in FastAPI"

---

### 🎥 Weekly Montage Automation (Priority: Medium)

**Goal:** Automate weekly compilation of best clips into montages

**Steps:**

1. **Verify Celery Beat Configuration:**

   - Check if `tasks_enhanced.py` has weekly montage task scheduled
   - File location: `backend/src/tasks_enhanced.py`
   - Celery beat is already running in Docker Compose (see `backend/docker-compose.yml`)

2. **Research Export Destinations:**

   - **TikTok API:**
     - Research: https://developers.tiktok.com/
     - Need to register TikTok app, get access tokens
     - Check if Pedro has TikTok developer account
   - **YouTube API:**
     - Research: https://developers.google.com/youtube/v3
     - Need OAuth 2.0 credentials, enable YouTube Data API v3
     - Check file: `backend/src/services/social_posters.py` (has YouTube stub)
   - **Instagram API:**
     - Research: https://developers.facebook.com/docs/instagram-api/
     - Need Facebook Developer account, Instagram Business account

3. **Automation Flow Planning:**
   - Document: How should weekly montages be generated?
   - Which clips should be included? (highest scores? most views? specific games?)
   - What style/theme for weekly montages? (auto-selected or manual?)
   - Where should they be uploaded? (TikTok, YouTube, both?)

**Documentation Help:**

- Ask ChatGPT: "How to upload videos to TikTok using their API"
- Ask ChatGPT: "YouTube Data API v3 upload video tutorial"
- Ask ChatGPT: "Instagram Graph API upload video post"

---

### 🌌 Cosmiv Rebranding & Space Theme (Priority: Completed ✅)
**Goal:** Platform fully rebranded to Cosmiv with space-themed UI

**Status:** ✅ Completed by agent_cosmiv_sync

**What's Been Updated:**
1. **Branding:**
   - All "Aiditor" references changed to "Cosmiv" across frontend, backend, and docs
   - Package name: `cosmiv-frontend`
   - Database/bucket names: `cosmiv`
   - Celery app name: `cosmiv`

2. **Space-Themed UI:**
   - Cosmic background component with animated starfield, nebulae, and glowing planet
   - Color palette: Violet (#8B5CF6) → Deep Blue (#1E3A8A) → Neon Cyan (#00FFFF)
   - Space-themed subscription plans: "Cosmic Cadet" (free) and "Nebula Knight" (pro)
   - Updated tab styling with cosmic color accents

3. **Theme Colors (in Tailwind):**
   - `cosmic-violet`, `cosmic-deep-blue`, `cosmic-neon-cyan`
   - Cosmic gradient backgrounds
   - Space-themed hover effects and borders

**Next Design Steps (Optional Enhancements):**
1. **Additional Space Animations:**
   - Subtle particle effects on hover
   - Glowing pulse animations for AI assistant representation
   - Loading spinner with space orb

### 🎨 Design Research (Priority: Low but Important)

**Goal:** Collect modern gaming/AI dashboard design inspirations and cosmic/futuristic UI patterns

**Steps:**

1. **Create Design Folder:**
   - Create `designs/` folder at repo root
   - Create `designs/ideas.md` file

2. **Research Sources:**
   - **Dribbble:** Search for:
     - "AI gaming dashboard"
     - "montage editor UI"
     - "video editing interface"
     - "gaming highlight app"
     - "cosmic space UI design"
   - **Behance:** Search for:
     - "motion UI gaming"
     - "AI video tool interface"
     - "futuristic dashboard design"
   - **Awwwards:** Look for award-winning gaming/video apps
   - **Design Systems:** Check out:
     - Gaming company design systems (Riot Games, Epic Games)
     - Video editing tool UIs (DaVinci Resolve, Premiere Pro)

3. **Document Findings:**
   - Add at least 5-10 design inspiration links
   - Note color palettes (hex codes) - focus on cosmic/space themes
   - Note typography choices
   - Note motion/animation styles
   - Note layout patterns

4. **Share with Pedro:**
   - Create a summary document
   - Highlight top 3-5 designs that match the Cosmiv vision
   - Suggest specific UI improvements based on research

**Documentation Help:**
- Ask ChatGPT: "Best modern gaming dashboard UI designs"
- Ask ChatGPT: "Color palette suggestions for AI video editing tools"
- Ask ChatGPT: "Motion design trends for gaming applications"
- Ask ChatGPT: "Cosmic/space-themed UI design inspirations"

---

### 📋 Additional Tasks

#### Environment Variables Checklist

Create a checklist of all environment variables that need to be set in production:

- OAuth credentials (Steam, Xbox, PSN, Nintendo)
- Stripe keys
- Database connection strings
- S3/MinIO storage credentials
- JWT secret key
- API keys for AI services (OpenAI, Anthropic, etc.)

Location: Ask Pedro where production `.env` file should be stored

#### API Documentation Review

- Review each platform's API documentation
- Note rate limits
- Note authentication requirements
- Document any special setup steps

---

## 🤝 Collaborative Phases (Pedro + Daan)

These are tasks you can tackle together without coding:

### Phase 1: API Testing & Documentation (1-2 weeks)

**Goal:** Test all platform APIs and document everything for future reference

**Tasks:**

1. **Manual API Testing Sessions**
   - Test each OAuth flow (Steam, Xbox, PSN, Nintendo) together
   - Document what works, what breaks, edge cases
   - Create test accounts for each platform
   - Take screenshots of the full OAuth flow
   - Create a shared document: `docs/api_testing_results.md`

2. **API Rate Limit Research**
   - Research rate limits for each platform API
   - Document: requests per minute/hour/day
   - Plan caching strategies together
   - Create rate limit monitoring plan

3. **Error Handling Documentation**
   - List all possible API errors from each platform
   - Document: What errors mean, how to handle them
   - Create error response examples
   - Plan user-friendly error messages

4. **Testing Playbook Creation**
   - Write step-by-step testing procedures
   - Create test scenarios for each feature
   - Document expected vs actual results
   - This becomes your QA playbook

**Deliverables:**
- `docs/api_testing_results.md` - Complete testing documentation
- `docs/api_rate_limits.md` - Rate limit reference guide
- `docs/error_handling_guide.md` - Error handling best practices
- `docs/testing_playbook.md` - Step-by-step testing procedures

---

### Phase 2: Content Creation & Marketing Prep (1 week)

**Goal:** Create demo content, marketing materials, and social media assets

**Tasks:**

1. **Demo Video Creation**
   - Record gameplay clips to use as demos
   - Use Cosmiv to create sample highlight reels
   - Create before/after comparisons
   - Edit together to show platform capabilities
   - Store in: `docs/demo_videos/`

2. **Screenshot & GIF Collection**
   - Take screenshots of key features
   - Create animated GIFs of UI interactions
   - Organize by feature (Upload, Processing, Download, etc.)
   - Create versions for different platforms (Twitter, Instagram, TikTok formats)
   - Store in: `docs/marketing_assets/`

3. **Marketing Copy Writing**
   - Write feature descriptions together
   - Create taglines and value propositions
   - Write social media post templates
   - Create email templates for user onboarding
   - Document in: `docs/marketing/copy.md`

4. **Social Media Strategy Planning**
   - Plan launch posts for each platform
   - Create content calendar (first month)
   - Plan demo releases (what to show when)
   - Research hashtags and communities to target
   - Document in: `docs/marketing/social_media_strategy.md`

**Deliverables:**
- Demo videos showcasing features
- Screenshot library organized by feature
- Marketing copy document
- Social media content calendar

---

### Phase 3: User Research & Feedback (2 weeks)

**Goal:** Get real user feedback before major launch

**Tasks:**

1. **Beta Tester Recruitment**
   - Identify potential beta testers (gaming communities, Discord servers)
   - Create beta signup form
   - Plan beta program structure (what to give, what to ask)
   - Create welcome email template

2. **Feedback Collection System**
   - Design feedback form/survey together
   - Decide: What questions to ask? What's most important?
   - Plan: In-app feedback vs external survey?
   - Create feedback categories (UX, Features, Bugs, Performance)

3. **User Interview Planning**
   - Select 5-10 beta testers for interviews
   - Create interview questions
   - Plan: What workflows to observe?
   - Schedule interview sessions
   - Document in: `docs/user_research/interviews.md`

4. **Feedback Analysis Sessions**
   - Review feedback together weekly
   - Categorize: Critical vs Nice-to-have
   - Prioritize improvements
   - Create improvement roadmap based on feedback

**Deliverables:**
- Beta tester list and recruitment plan
- Feedback collection forms/surveys
- User interview notes and insights
- Prioritized improvement roadmap

---

### Phase 4: Design System & Style Guide (1 week)

**Goal:** Create comprehensive design system documentation

**Tasks:**

1. **Color Palette Documentation**
   - Document all cosmic colors with hex codes
   - Create color usage guidelines (when to use what)
   - Create color contrast examples
   - Create accessibility guidelines (WCAG compliance)
   - Document in: `docs/design_system/colors.md`

2. **Typography Guide**
   - Document all font families used
   - Create hierarchy guide (H1, H2, body, etc.)
   - Show font size examples
   - Create spacing guidelines
   - Document in: `docs/design_system/typography.md`

3. **Component Library Documentation**
   - Document all UI components (buttons, cards, forms)
   - Show component variations
   - Document component states (hover, active, disabled)
   - Create usage guidelines
   - Document in: `docs/design_system/components.md`

4. **Animation & Interaction Guidelines**
   - Document animation timing/easing
   - Show transition examples
   - Create micro-interaction guidelines
   - Plan loading states and feedback animations
   - Document in: `docs/design_system/animations.md`

**Deliverables:**
- Complete design system documentation
- Style guide reference for future development
- Component usage guidelines

---

### Phase 5: API Integration Documentation (1 week)

**Goal:** Document all external integrations for future reference

**Tasks:**

1. **Platform API Documentation**
   - Document Steam API endpoints we use
   - Document Xbox API endpoints we use
   - Document PSN API endpoints we use
   - Document Nintendo API endpoints we use
   - Include: Request/response examples, authentication, rate limits
   - Store in: `docs/integrations/`

2. **Social Media API Documentation**
   - Document TikTok API integration
   - Document YouTube API integration
   - Document Instagram API integration
   - Include: Upload workflows, error handling, best practices
   - Store in: `docs/integrations/social_media.md`

3. **Stripe Integration Documentation**
   - Document payment flow
   - Document webhook handling
   - Document subscription lifecycle
   - Create troubleshooting guide
   - Store in: `docs/integrations/stripe.md`

4. **Third-Party Services Map**
   - Create diagram of all external services
   - Document: What each service does, why we use it
   - Document: API keys needed, where they're stored
   - Create dependency map
   - Store in: `docs/integrations/services_map.md`

**Deliverables:**
- Complete API integration documentation
- Troubleshooting guides for each integration
- Service dependency map

---

### Phase 6: Testing & QA Coordination (Ongoing)

**Goal:** Establish continuous testing process

**Tasks:**

1. **Weekly Testing Sessions**
   - Schedule 1-hour testing sessions together
   - Test new features as they're built
   - Test regression (do old features still work?)
   - Document bugs in shared spreadsheet
   - Prioritize fixes together

2. **Cross-Platform Testing**
   - Test on different browsers (Chrome, Firefox, Safari, Edge)
   - Test on mobile devices (iOS, Android)
   - Test on different screen sizes
   - Document device/browser compatibility
   - Store in: `docs/testing/compatibility.md`

3. **Performance Testing**
   - Test upload speeds with different file sizes
   - Test processing times
   - Test concurrent users (if possible)
   - Document performance benchmarks
   - Identify bottlenecks together

4. **User Acceptance Testing**
   - Create test scenarios for end-to-end workflows
   - Test: Sign up → Upload → Process → Download
   - Test: OAuth linking → Clip discovery → Auto-montage
   - Document pain points and improvements needed

**Deliverables:**
- Weekly testing reports
- Bug tracking spreadsheet
- Compatibility matrix
- Performance benchmarks

---

### Phase 7: Content Strategy & Community Building (Ongoing)

**Goal:** Build community and create engaging content

**Tasks:**

1. **Content Calendar Planning**
   - Plan weekly content themes
   - Plan feature announcements
   - Plan user showcase posts
   - Plan educational content (how-to guides)
   - Create calendar: `docs/marketing/content_calendar.md`

2. **Community Platform Setup**
   - Decide: Discord? Reddit? Twitter Spaces?
   - Set up community platform
   - Create welcome message and rules
   - Plan community events (launch day, weekly highlights)

3. **User Showcase Planning**
   - Plan: How to feature user-created montages
   - Create showcase criteria
   - Plan reward system (features, credits, etc.)
   - Create showcase templates

4. **Educational Content Creation**
   - Write "How to create best montages" guide
   - Create video tutorials
   - Write "Best practices for highlight reels"
   - Create FAQ document based on user questions

**Deliverables:**
- Content calendar
- Community platform set up
- User showcase program
- Educational content library

---

### Phase 8: Launch Preparation (1-2 weeks before launch)

**Goal:** Prepare everything for public launch

**Tasks:**

1. **Launch Checklist Creation**
   - Create comprehensive launch checklist
   - Include: Technical, marketing, legal, support items
   - Assign ownership to each item
   - Track completion status
   - Document in: `docs/launch/checklist.md`

2. **Support System Setup**
   - Plan: How will users get help? (Email, Discord, tickets?)
   - Create support email templates
   - Set up support channels
   - Create FAQ document
   - Plan: Response time goals, escalation process

3. **Legal & Compliance Review**
   - Review terms of service together
   - Review privacy policy
   - Check: GDPR compliance, data storage, user rights
   - Plan: Cookie policy, data deletion policy
   - Document concerns and action items

4. **Launch Day Planning**
   - Plan launch announcement posts
   - Coordinate: Who posts what, when?
   - Plan launch day monitoring (watch for issues)
   - Create contingency plan (what if something breaks?)
   - Plan: Celebration! 🎉

**Deliverables:**
- Complete launch checklist
- Support system documentation
- Legal review notes
- Launch day playbook

---

### Phase 9: Post-Launch Analysis (Weekly)

**Goal:** Analyze metrics and plan improvements

**Tasks:**

1. **Weekly Metrics Review**
   - Review: User signups, active users, retention
   - Review: Most-used features, least-used features
   - Review: Error rates, performance issues
   - Identify trends and patterns
   - Meet weekly to discuss findings

2. **User Feedback Analysis**
   - Review all user feedback from week
   - Categorize: Bugs, feature requests, UX issues
   - Prioritize improvements
   - Plan: What to fix next sprint?

3. **Competitive Analysis**
   - Monitor competitor features
   - Track what competitors are doing
   - Identify opportunities to differentiate
   - Plan: What features do we need?

4. **Roadmap Planning**
   - Based on metrics and feedback, plan next features
   - Prioritize together: What's most valuable?
   - Create quarterly roadmap
   - Share roadmap with community

**Deliverables:**
- Weekly metrics reports
- Feedback analysis summaries
- Quarterly roadmap
- Competitive analysis notes

---

## 🧭 If You Don't Know What To Do

1. **Ask ChatGPT first** - it's great for:

   - Explaining how OAuth flows work
   - Step-by-step setup guides
   - API documentation summaries
   - Design research queries

2. **Document everything** - add findings to this file or create notes files

3. **Ask Pedro (`pmec`)** when:
   - You need access to developer accounts
   - You need to test something that requires code changes
   - A major milestone is complete and needs verification
   - You're blocked and need technical help

---

## 🪜 Progress Log

| Date       | Task                        | Status | Notes                                         |
| ---------- | --------------------------- | ------ | --------------------------------------------- |
| 2025-01-27 | Initial TODO list created   | ✅     | Agent generated tasks                         |
| 2025-01-27 | OAuth infrastructure review | ⚙️     | Found mock implementations, need credentials  |
| 2025-01-27 | Billing system review       | ⚙️     | Stripe structure exists, needs webhook config |

---

## 📝 Notes

- All OAuth integrations are in **mock mode** by default
- To enable real OAuth, set `*_API_ENABLED=true` in environment variables
- Stripe billing has the structure ready, just needs live keys + webhooks
- Design research is completely new - create the folder and start collecting

---

_Next agent run will update this file with new tasks based on progress._
