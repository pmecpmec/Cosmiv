# PROJECT COMMANDS — Cosmiv

/frontend:

- Audit the current frontend.
- Ensure all components match the Space inspired, sleek, and futuristic / Cosmiv aesthetic.
- Apply Framer Motion for smooth animations.
- Check responsive design and update status in `PROJECT_STATUS_FOR_CHATGPT.md`.

/backend:

- Analyze backend code.
- Confirm API endpoints, Celery tasks, and integrations are consistent.
- Ensure configuration files (env vars, flags) match production-ready standards.

/update-status:

- Automatically read project files.
- Update `PROJECT_STATUS_FOR_CHATGPT.md` with what’s completed, in progress, and pending.

/design-audit:

- Scan for CSS, style inconsistencies, missing components, or UI fragments that break the vibe.
- Generate suggestions and TODOs for Daan or front-end agents.

/email-setup:

- Check if email config (EMAIL_SETUP_DAAN.md) is implemented correctly.
- Validate DNS/MX/SPF/DKIM/DMARC placeholders and update logs.

/weekly-montage:

- Review automation pipeline for weekly montage assembly.
- Suggest improvements for Celery scheduling or export destinations.

/create-agent:

- Draft a new agent prompt for Cursor (frontend, backend, design, automation, etc.)
