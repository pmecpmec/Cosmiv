# Cursor Agent Prompts — Broken Planet Edition

This directory contains specialized agent prompts for managing Cosmiv's **Broken Planet** aesthetic transformation.

## 📋 Available Agents

### 1. `BIGROAD_BROKENPLANET`
**Purpose:** Audit project and create comprehensive Big Road plan  
**Output:** `BIGROAD_BROKENPLANET.md`  
**When to use:** Starting new development phase, major feature planning

### 2. `TODO_DAAN_BROKENPLANET`
**Purpose:** Assign non-technical tasks to Daan (integrations, design research)  
**Output:** Updates to `TODO_DAAN.md`  
**When to use:** Need Daan to handle API setup, design research, or external integrations

### 3. `STYLE_AUDITOR_BROKENPLANET`
**Purpose:** Audit and apply Broken Planet styling across all UI components  
**Output:** `STYLE_AUDIT_BROKENPLANET.md`  
**When to use:** UI updates, style consistency checks, new component styling

### 4. `EMAIL_SETUP_BROKENPLANET`
**Purpose:** Create cosmic business email system with Broken Planet branding  
**Output:** Updates to `EMAIL_SETUP_DAAN.md`  
**When to use:** Setting up business emails, updating email signatures

### 5. `MASTER_ORCHESTRATOR`
**Purpose:** Coordinate all agents and maintain consistency  
**Output:** `BROKENPLANET_ORCHESTRATION_LOG.md`, `BROKENPLANET_TRANSFORMATION_SUMMARY.md`  
**When to use:** Running multiple agents, ensuring consistency across updates

## 🚀 Quick Start

### Single Agent Execution

Copy the contents of any agent file and paste into Cursor's agent prompt field. The agent will:
1. Read the prompt instructions
2. Analyze the codebase
3. Generate output according to the agent's purpose
4. Update relevant documentation

### Multi-Agent Orchestration

1. **Start with:** `MASTER_ORCHESTRATOR.md` - This coordinates all agents
2. **Or manually run in order:**
   - `BIGROAD_BROKENPLANET` → Planning
   - `STYLE_AUDITOR_BROKENPLANET` → Style audit
   - `TODO_DAAN_BROKENPLANET` → Task assignment
   - `EMAIL_SETUP_BROKENPLANET` → Email setup

## 📚 Documentation Reference

All agents reference:
- `COSMIV_STORY.md` - Complete brand guidelines and story
- `PROJECT_STATUS_FOR_CHATGPT.md` - Current project status
- `TODO_DAAN.md` / `TODO_PEDRO.md` - Task lists

## 🎨 Broken Planet Style Guide

**Key Elements:**
- Violet → Deep Blue → Neon Cyan gradients
- Glitch Pink (`#FF0080`) accents
- Hot Pink (`#FF00FF`) highlights
- Scanline/CRT effects
- Neon glow enhancements
- Broken planet visual elements
- Chromatic aberration on animations

**See `COSMIV_STORY.md` for complete style guidelines.**

## ⚠️ Important Notes

1. **Maintain Functionality:** All agents preserve existing features while updating style
2. **Performance:** Effects should use CSS, not heavy JavaScript
3. **Accessibility:** Glitch effects shouldn't hinder readability
4. **Consistency:** All updates must align with Broken Planet aesthetic
5. **Documentation:** All agents update `PROJECT_STATUS_FOR_CHATGPT.md`

## 📝 Usage Examples

### Example 1: Style Audit
```
Copy: AGENT_PROMPTS/STYLE_AUDITOR_BROKENPLANET.md
Paste into: Cursor agent prompt
Result: Complete UI component audit with Broken Planet styling updates
```

### Example 2: Task Assignment
```
Copy: AGENT_PROMPTS/TODO_DAAN_BROKENPLANET.md
Paste into: Cursor agent prompt
Result: Updated TODO_DAAN.md with Broken Planet research tasks
```

### Example 3: Full Transformation
```
Copy: AGENT_PROMPTS/MASTER_ORCHESTRATOR.md
Paste into: Cursor agent prompt
Result: Coordinated execution of all agents with summary report
```

---

_For complete Cosmiv branding, see `COSMIV_STORY.md`_  
_For project status, see `PROJECT_STATUS_FOR_CHATGPT.md`_

