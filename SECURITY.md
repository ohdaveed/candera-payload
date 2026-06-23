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
third-party platforms we depend on (Vercel, Neon, Etsy, Supabase) — please report
those to the respective vendor.
