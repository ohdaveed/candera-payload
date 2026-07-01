# Security Policy

## Supported Versions

This project is deployed as a single rolling release. Security fixes are applied
to the `main` branch, which is what production runs.

| Branch | Supported          |
| ------ | ------------------ |
| `main` | :white_check_mark: |
| other  | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities **privately**. Do **not** open a public
GitHub issue or pull request for a suspected vulnerability.

- Email: `security@canderacandles.com` _(confirm/replace with the studio's real
  security contact before handoff)._
- Include: a description of the issue, steps to reproduce, affected URL/endpoint,
  and any relevant logs or proof-of-concept. Please do not include live customer
  data.

### What to expect

- **Acknowledgement** within 3 business days.
- **Status update** within 10 business days, including whether the report is
  accepted, needs more information, or is declined (with reasoning).
- We will coordinate a disclosure timeline with you once a fix is available and
  credit reporters who wish to be named.

### Scope

In scope: this application and its API/admin endpoints. Out of scope: findings
that require physical access, social engineering of staff, or vulnerabilities in
third-party platforms we depend on (Vercel, Neon, Etsy) — please report
those to the respective vendor.

---

## Secret Scanning

Every push and pull request is scanned for leaked credentials by the
[Gitleaks](https://github.com/gitleaks/gitleaks) GitHub Actions workflow
(`.github/workflows/gitleaks.yml`). The weekly schedule also performs a
full-history scan.

Local protection is provided by:
- A `ggshield` pre-commit hook (`.husky/pre-commit`) that blocks commits
  containing detected secrets.
- The `.gitignore` rules that prevent `.env*` files (other than `.env.example`)
  from being tracked.

**Never commit a real credential.** Use placeholder values in `.env.example` and
inject real secrets at runtime via `pass-cli` (see `AGENTS.md`).

---

## Leaked-Credential Incident Runbook

If a secret is found in the repository (current files **or** git history):

### 1 — Rotate the credential immediately

| Service | Where to rotate |
| ------- | --------------- |
| Neon Postgres (database role) | Neon Console → Project → Settings → Roles → reset password for the affected role (`neondb_owner` or whichever role name is in use) |
| Payload JWT (`PAYLOAD_SECRET`) | Generate a new random string; set in Vercel env vars |
| Vercel Blob (`BLOB_READ_WRITE_TOKEN`) | Vercel Dashboard → Storage → token management |
| Etsy API key | Etsy Developer Portal → App settings |
| Any other secret | Respective service dashboard |

After rotating, update the secret in **Vercel environment variables** and in your
local `.env` (via `pass-cli`).

### 2 — Verify the credential is no longer usable

Test that the old value no longer authenticates before proceeding.

### 3 — Purge the secret from git history

> ⚠️ This is a **destructive, irreversible operation** that rewrites shared
> history. It must be performed by the repository owner.

Use the helper script provided:

```bash
# From a fresh full clone of the repository:
git clone git@github.com:ohdaveed/candera-payload.git candera-clean
cd candera-clean
./scripts/purge-env-from-history.sh
```

The script uses `git filter-repo` to remove the offending file from every
commit, re-packs the repository, and force-pushes to `origin`.

Prerequisites: `git-filter-repo` must be installed (`pip install git-filter-repo`
or `brew install git-filter-repo`).

### 4 — Notify collaborators

After the force-push all collaborators must delete their local clones and
re-clone. Open pull requests will need to be rebased onto the new `main`.

### 5 — Verify the secret is gone

```bash
# Should return no output:
git log --all --full-history -S "the-leaked-value" -- . | head
```

### 6 — Post-incident

- Document the incident privately (date, affected credential, rotation date).
- Review whether additional secrets may have been exposed in the same file or
  nearby commits (`git log --all -- .env.ci .env.template`).
- Consider whether any dependent systems (e.g., Vercel preview deployments) may
  have cached the old credential and require invalidation.
