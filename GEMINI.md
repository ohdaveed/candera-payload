# GEMINI.md

This file provides guidance to Gemini AI when working with code in this repository. 
See `AGENTS.md` for a comprehensive guide to architecture, testing, and project structure.

## Quick start

```bash
# Inject environment variables using pass-cli
pass-cli run --env-file .env -- pnpm dev    # Start dev server at http://localhost:3000
pass-cli run --env-file .env -- pnpm build  # Production build (runs next-sitemap postbuild)
pass-cli run --env-file .env -- pnpm start  # Serve production build
```

**Environment Variables:** This project uses `pass-cli` for secret management. The `.env` file contains `pass://` URIs. Do not overwrite `.env` with raw secrets; always use `pass-cli run --env-file .env -- <command>` to inject them at runtime.
