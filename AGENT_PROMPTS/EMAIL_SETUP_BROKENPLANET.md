# Agent: EMAIL_SETUP_BROKENPLANET

**Purpose:** Create a cosmic business email system aligned with the Broken Planet branding.

---

## 🪐 Agent Prompt

You are managing **Cosmiv business emails**.

**Task:** Implement a **full email setup** with founder and operational emails, keeping the **Broken Planet neon-cosmic identity** in signatures.

### Requirements:

1. **Confirm domain:** `cosmiv.com`

2. **Founder emails:**
   - `pedro@cosmiv.com` - Pedro Cardoso (pmec), Co-Founder & CTO
   - `daan@cosmiv.com` - Daan Brinkmann (DeWindWaker), Co-Founder

3. **Operational emails:**
   - `support@cosmiv.com` - Customer support
   - `info@cosmiv.com` - General information
   - `billing@cosmiv.com` - Payment/subscription issues
   - `hello@cosmiv.com` - Friendly contact
   - `contact@cosmiv.com` - Contact form submissions
   - `feedback@cosmiv.com` - User feedback
   - `press@cosmiv.com` - Media inquiries
   - `marketing@cosmiv.com` - Marketing inquiries

4. **Design cosmic, neon HTML & plain-text signatures** with:
   - **Broken Planet aesthetic:** Gradients, glow effects, glitch accents
   - **Space-themed emojis:** 🌌 (galaxy), ✨ (sparkles), 🚀 (rocket), 🪐 (broken planet)
   - **Neon colors:** Violet → cyan gradients, glitch pink accents
   - **Professional yet cosmic:** Maintains business professionalism with cosmic flair

5. **Provide DNS setup instructions:**
   - MX records (mail exchange)
   - SPF records (sender policy)
   - DKIM records (domain authentication)
   - DMARC records (message authentication)

6. **Security best practices:**
   - 2FA setup instructions
   - Password management recommendations
   - Account recovery procedures

7. **Update documentation:**
   - `EMAIL_SETUP_DAAN.md` - Broken Planet signature templates
   - `PROJECT_STATUS_FOR_CHATGPT.md` - Email system status

### Broken Planet Signature Design:

**HTML Signature Template:**

```html
<div style="font-family: 'Inter', system-ui, sans-serif; color: #FFFFFF; line-height: 1.6; max-width: 600px;">
  <div style="border-left: 3px solid #00FFFF; padding-left: 12px; margin: 16px 0; position: relative;">
    <!-- Glitch effect overlay (subtle) -->
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none;">
      <div style="color: #FF0080; transform: translateX(1px);">[Name]</div>
      <div style="color: #00FFFF; transform: translateX(-1px);">[Name]</div>
    </div>
    
    <!-- Main content -->
    <strong style="color: #00FFFF; font-size: 16px; text-shadow: 0 0 10px #00FFFF;">[Name]</strong><br>
    <span style="color: #8B5CF6;">[Role/Title]</span> | <span style="color: #00FFFF;">Cosmiv</span><br>
    <br>
    
    <!-- Broken Planet symbol -->
    <span style="font-size: 18px; margin-right: 8px;">🪐</span>
    <span style="font-size: 14px; color: #A855F7;">Broken Planet Edition</span>
    <br><br>
    
    <span style="font-size: 12px; color: #FFFFFF;">Website:</span> 
    <a href="https://cosmiv.com" style="color: #00FFFF; text-decoration: none; text-shadow: 0 0 5px #00FFFF;">cosmiv.com</a>
  </div>
</div>
```

**Plain-Text Signature:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Name]
[Role/Title] | Cosmiv

🪐 Broken Planet Edition

Website: cosmiv.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Founder Signatures:

**Pedro Cardoso:**
- Role: Co-Founder & CTO
- Email: `pedro@cosmiv.com`
- Focus: Technical leadership, AI/ML, video processing

**Daan Brinkmann:**
- Role: Co-Founder
- Email: `daan@cosmiv.com`
- Focus: Integrations, design, business development

### Operational Role Signatures:

- **Support Team:** Professional but cosmic
- **Marketing:** Vibrant, energetic, neon-themed
- **Billing:** Professional with subtle cosmic accents
- **Press:** Clean, professional, with cosmic branding

### DNS Configuration:

**MX Records (Google Workspace example):**
```
Type: MX
Priority: 1
Host: @
Value: aspmx.l.google.com.
```

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

**DKIM & DMARC:**
- Generate in provider dashboard
- Add as TXT records

### Output Format:

Update `EMAIL_SETUP_DAAN.md` with:

1. **Broken Planet Signature Templates** (HTML & plain-text)
2. **Email Address List** (all founder and operational emails)
3. **DNS Setup Guide** (step-by-step instructions)
4. **Security Checklist** (2FA, passwords, recovery)
5. **Implementation Steps** (for Daan/Pedro to follow)

### Notes:

- **HTML signatures** should work in major email clients (Gmail, Outlook, Apple Mail)
- **Fallback to plain-text** if HTML doesn't render
- **Mobile-friendly** design (responsive signatures)
- **Accessibility:** Ensure contrast ratios meet WCAG standards
- **Brand consistency:** All signatures should reflect Broken Planet aesthetic

---

**Update `EMAIL_SETUP_DAAN.md` and `PROJECT_STATUS_FOR_CHATGPT.md` with Broken Planet email system.**

---

_Agent Name: `EMAIL_SETUP_BROKENPLANET`_  
_Created: 2025-01-27_  
_Reference: See `COSMIV_STORY.md` for brand guidelines_

