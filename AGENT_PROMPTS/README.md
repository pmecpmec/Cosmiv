# Cursor Agent Prompts — Broken Planet Edition

This directory contains specialized agent prompts for managing Cosmiv's **Broken Planet** aesthetic transformation.

## 📋 Available Agents

### 🎯 Quick Start — For Daan

**`DAAN_TODO_GENERATOR.md`** ← **START HERE IF YOU'RE DAAN**

This is Daan's personal TODO generator. Simply:
1. Open `AGENT_PROMPTS/DAAN_TODO_GENERATOR.md`
2. Copy the entire file contents (from "## 🪐 Agent Prompt" onwards)
3. Paste into Cursor's agent prompt field
4. The agent will automatically update `TODO_DAAN.md` with your tasks

**This agent:**
- Reads current project status
- Generates personalized tasks for Daan
- Updates TODO_DAAN.md automatically
- Uses plain language (no technical jargon)

---

### 1. `BIGROAD_BROKENPLANET`
**Purpose:** Audit project and create comprehensive Big Road plan  
**Output:** `BIGROAD_BROKENPLANET.md`  
**When to use:** Starting new development phase, major feature planning

### 2. `STYLE_AUDITOR_BROKENPLANET`
**Purpose:** Audit and apply Broken Planet styling across all UI components  
**Output:** `STYLE_AUDIT_BROKENPLANET.md`  
**When to use:** UI updates, style consistency checks, new component styling

### 3. `TODO_DAAN_BROKENPLANET`
**Purpose:** Assign non-technical tasks to Daan (integrations, design research)  
**Output:** Updates to `TODO_DAAN.md`  
**When to use:** Need Daan to handle API setup, design research, or external integrations  
**Note:** Daan should use `DAAN_TODO_GENERATOR.md` instead for simplicity

### 4. `EMAIL_SETUP_BROKENPLANET`
**Purpose:** Create cosmic business email system with Broken Planet branding  
**Output:** Updates to `EMAIL_SETUP_DAAN.md`  
**When to use:** Setting up business emails, updating email signatures

### 5. `MASTER_ORCHESTRATOR`
**Purpose:** Coordinate all agents and maintain consistency  
**Output:** `BROKENPLANET_ORCHESTRATION_LOG.md`, `BROKENPLANET_TRANSFORMATION_SUMMARY.md`  
**When to use:** Running multiple agents, ensuring consistency across updates

---

## 🚀 Quick Start Guide

### For Daan (Non-Technical)

**Easy Method:**
1. Open `AGENT_PROMPTS/DAAN_TODO_GENERATOR.md`
2. Copy everything from "## 🪐 Agent Prompt" to the end
3. Paste into Cursor's agent prompt
4. Done! Your `TODO_DAAN.md` will be updated automatically

**What it does:**
- Generates personalized tasks for you
- Uses simple, clear language
- Provides step-by-step instructions
- Links to all resources you need
- Updates your TODO file automatically

### For Pedro (Technical Lead)

**Single Agent Execution:**
1. Choose the agent you need (see list above)
2. Copy the agent's file contents
3. Paste into Cursor's agent prompt
4. Review output and apply changes

**Multi-Agent Orchestration:**
1. Start with `MASTER_ORCHESTRATOR.md`
2. It coordinates all other agents automatically
3. Generates comprehensive summary when complete

### For Both Founders

**Full Transformation:**
1. Run `MASTER_ORCHESTRATOR.md` once
2. It will coordinate all agents in correct order
3. You'll get a complete transformation report

---

## 📚 Documentation Reference

All agents reference:
- `COSMIV_STORY.md` - Complete brand guidelines and story (READ THIS FIRST)
- `PROJECT_STATUS_FOR_CHATGPT.md` - Current project status
- `TODO_DAAN.md` / `TODO_PEDRO.md` - Task lists
- `EMAIL_SETUP_DAAN.md` - Email system guide

---

## 🎨 Broken Planet Style Guide

**Key Elements:**
- **Gradients:** Violet → Deep Blue → Neon Cyan
- **Glitch Pink:** `#FF0080` - Error states, glitch effects
- **Hot Pink:** `#FF00FF` - Vibrant highlights
- **Scanlines:** CRT-style horizontal lines (~5-10% opacity)
- **Neon Glow:** Enhanced luminosity on interactive elements
- **Broken Planet:** Cracked/glitched planet visual elements
- **Chromatic Aberration:** Red/cyan separation on animations

**See `COSMIV_STORY.md` for complete style guidelines.**

---

## ⚠️ Important Notes

1. **Maintain Functionality:** All agents preserve existing features while updating style
2. **Performance:** Effects should use CSS, not heavy JavaScript
3. **Accessibility:** Glitch effects shouldn't hinder readability
4. **Consistency:** All updates must align with Broken Planet aesthetic
5. **Documentation:** All agents update `PROJECT_STATUS_FOR_CHATGPT.md`
6. **Plain Language:** Daan's tasks are written in simple, clear terms

---

## 📝 Usage Examples

### Example 1: Daan Needs Tasks
```
1. Open: AGENT_PROMPTS/DAAN_TODO_GENERATOR.md
2. Copy: Everything from "## 🪐 Agent Prompt" to end
3. Paste: Into Cursor agent prompt
4. Result: Updated TODO_DAAN.md with personalized tasks
```

### Example 2: Style Audit
```
1. Open: AGENT_PROMPTS/STYLE_AUDITOR_BROKENPLANET.md
2. Copy: Entire file contents
3. Paste: Into Cursor agent prompt
4. Result: Complete UI component audit with Broken Planet styling updates
```

### Example 3: Full Transformation
```
1. Open: AGENT_PROMPTS/MASTER_ORCHESTRATOR.md
2. Copy: Entire file contents
3. Paste: Into Cursor agent prompt
4. Result: Coordinated execution of all agents with summary report
```

---

## 🔄 Agent Relationships

```
DAAN_TODO_GENERATOR
    ↓ (generates)
TODO_DAAN.md

BIGROAD_BROKENPLANET
    ↓ (creates)
BIGROAD_BROKENPLANET.md

STYLE_AUDITOR_BROKENPLANET
    ↓ (creates)
STYLE_AUDIT_BROKENPLANET.md
    ↓ (updates)
All UI components

EMAIL_SETUP_BROKENPLANET
    ↓ (updates)
EMAIL_SETUP_DAAN.md

MASTER_ORCHESTRATOR
    ↓ (coordinates)
All agents above
    ↓ (generates)
BROKENPLANET_TRANSFORMATION_SUMMARY.md
```

---

## 💡 Tips for Daan

- **Use DAAN_TODO_GENERATOR.md** whenever you need fresh tasks
- **Ask ChatGPT** if any step is unclear
- **Document findings** - add research results to shared docs
- **Communicate with Pedro** - let him know when you've completed setup tasks
- **One task at a time** - focus on completing one thing before moving to the next

---

_For complete Cosmiv branding, see `COSMIV_STORY.md`_  
_For project status, see `PROJECT_STATUS_FOR_CHATGPT.md`_  
_For Daan's tasks, see `TODO_DAAN.md` (generated by DAAN_TODO_GENERATOR)_
