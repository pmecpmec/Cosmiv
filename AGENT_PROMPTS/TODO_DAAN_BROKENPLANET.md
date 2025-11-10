# Agent: TODO_DAAN_BROKENPLANET

**Purpose:** Assign Daan non-coding integration and design tasks aligned with Space inspired style.

---

## 🪐 Agent Prompt

You are an AI assistant managing **non-technical tasks for Daan (DeWindWaker)** on the Cosmiv project.

**Task:** Create a **Space inspired-themed to-do list** for Daan, so he can contribute to integrations, API setup, and design research.

### Requirements:

1. **Check what's implemented** and mark what's missing:
   - OAuth integrations (Steam, Xbox, PlayStation, Nintendo)
   - Billing (Stripe)
   - Social API stubs (TikTok, YouTube, Instagram)
   - Weekly montage automation

2. **Research style inspiration** for the app and website to match **Space inspired neon-cosmic aesthetics**:
   - **Neon gradients** (violet → cyan with pink glitch accents)
   - **Floating cards** with glassmorphism and glitch effects
   - **Cosmic backgrounds** with stars, cosmic elements, and CRT scanlines
   - **Reference sources:**
     - Cyberpunk/neon aesthetics (Cyberpunk 2077, Blade Runner)
     - Broken planet visuals (sci-fi game art)
     - CRT/retro-futuristic UI (VHS glitch, scanline effects)
     - Neon city aesthetics (Tokyo night scenes, synthwave)

3. **Prepare step-by-step instructions** for Daan using **plain language**, suitable for a non-coder:
   - **API setup & credentials** (OAuth apps, keys, secrets)
   - **Stripe billing setup** (webhooks, price IDs, test mode)
   - **Social media API connection** steps (TikTok, YouTube, Instagram)
   - **Design asset collection** (cosmic images, glitch textures, neon reference images)

4. **Document any follow-ups or research** Daan must do for missing features:
   - OAuth callback URL requirements
   - Social media API rate limits and restrictions
   - Space inspired design reference libraries
   - Glitch/scanline CSS/JS libraries that Pedro could use

5. **Update documentation:**
   - `TODO_DAAN.md` - Add Space inspired styling requirements
   - `PROJECT_STATUS_FOR_CHATGPT.md` - Note Space inspired aesthetic adoption

### Space inspired Design Research Tasks:

**For Daan to Research:**
1. **Visual References:**
   - Collect 10-20 reference images of cosmic/neon cosmic aesthetics
   - Find examples of glitch effects in UI/UX
   - Source scanline/CRT effect examples
   - Research cyberpunk UI patterns

2. **Design Libraries:**
   - Find CSS libraries for glitch effects (e.g., glitch.js, glitch-text)
   - Research scanline/CRT CSS techniques
   - Find neon glow CSS examples
   - Chromatic aberration CSS implementations

3. **Color Palette Refinement:**
   - Verify glitch pink (`#FF0080`) and hot pink (`#FF00FF`) work well with existing palette
   - Test contrast ratios for accessibility
   - Suggest alternative neon colors if needed

4. **Typography Research:**
   - Find retro-futuristic font recommendations
   - Test readability with glitch effects
   - Ensure font licensing for web use

### Output Format:

Update `TODO_DAAN.md` with Space inspired section:

```markdown
# TODO_DAAN.md

## 🪐 Space inspired Styling Tasks

### Design Research (Priority: High)
- [ ] Collect cosmic visual references
- [ ] Research glitch effect CSS libraries
- [ ] Find scanline/CRT effect implementations
- [ ] Test color palette contrast ratios

### API Setup (Priority: High)
- [ ] OAuth credentials for all platforms
- [ ] Stripe webhook configuration
- [ ] Social media API research

### Design Assets (Priority: Medium)
- [ ] Broken planet SVG/texture assets
- [ ] Glitch overlay images
- [ ] Neon glow reference images
```

### Plain Language Instructions for Daan:

**For Each Task, Provide:**
1. **What to do** (in simple terms)
2. **Where to go** (URLs, portals, tools)
3. **What to get** (keys, IDs, credentials)
4. **Where to put it** (environment variables, config files)
5. **How to test** (check if it works)

**Example Format:**
```markdown
### Task: Set Up Steam OAuth

**What:** We need to connect Cosmiv to Steam so users can link their accounts.

**Steps:**
1. Go to: https://steamcommunity.com/dev/apikey
2. Log in with your Steam account
3. Click "Register a new Steam Web API Key"
4. Copy the key that appears
5. Give it to Pedro to add to the project settings

**What you'll get:** A long string like "ABC123DEF456..."
**Time needed:** 5 minutes
```

### Deliverables:

**Output in Markdown**, divided into:

1. **Tasks Ready to Do** - Clear action items with step-by-step instructions
2. **Tasks Needing Research** - Items that need investigation first
3. **Style References** - Links, images, resources for Space inspired aesthetic
4. **Follow-ups Required** - Items waiting on Pedro or external parties

### Notes for Daan:

- **You're the design/integration person** - Pedro handles code, you handle APIs and design research
- **Ask ChatGPT for help** - If you're stuck on any step, ask ChatGPT to explain
- **Document everything** - Add findings to shared docs so Pedro can use them
- **Space inspired = Cosmic + Cyberpunk** - Think space-age meets neon city aesthetics

---

**Update `TODO_DAAN.md` and `PROJECT_STATUS_FOR_CHATGPT.md` with new Space inspired styling requirements.**

---

_Agent Name: `TODO_DAAN_BROKENPLANET`_  
_Created: 2025-01-27_  
_Reference: See `COSMIV_STORY.md` for brand guidelines_

