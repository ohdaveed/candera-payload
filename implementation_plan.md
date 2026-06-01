/# Implementation Plan

Debug Payload CMS admin login (`/admin`) failing on Vercel production deployment. The core issue is that the Payload CMS is deployed on Neon Postgres via Vercel, but no admin user exists in the production database to authenticate with at `/admin/login`. The build itself may also have been failing previously due to missing migrations — that's been fixed with `vercel.json` changes already.

[Types]
No new types or interfaces needed. The existing `User` type from Payload is sufficient.

[Files]
No new files. Only modifications to existing files in `src/endpoints/seed/index.ts` to ensure a default admin user is created during migration/deployment.

[Functions]
**Modified functions:**
- `src/endpoints/seed/index.ts` — `seed()` function: Add creation of a default admin user with email/password, not just `demo-author@example.com` (which has limited permissions). Ensure a user with proper admin access is created.
- `src/collections/Users/index.ts` — `Users` collection config: Potentially add a `beforeChange` or `afterChange` hook to handle admin seeding, or modify the access control to ensure the seeded user is an admin.

**No new functions to add.** The fix leverages Payload CMS's built-in auth flow and just ensures a usable admin user exists.

[Classes]
No class modifications needed.

[Dependencies]
No new dependencies required.

[Testing]
Manual verification:
1. Run `pnpm build` locally to confirm the build passes
2. Verify the admin login page loads at `/admin` on the deployed Vercel URL
3. Test logging in with the seeded admin credentials
4. Check Vercel deployment logs for build or migration errors

[Implementation Order]
1. Create a mechanism to seed an admin user during the deploy process (either via a script in `vercel.json` or through the seed endpoint)
2. Update the `vercel.json` to trigger user seeding after migration (if needed)
3. Deploy and verify the admin login works end-to-end