export const meta = {
  name: 'design-fix-storefront-pages',
  description: 'Design-critique fix pass across storefront pages, one subagent per page, serialized visual verification, single PR',
  phases: [
    { title: 'Critique', detail: 'parallel, read-only draft critique per page' },
    { title: 'Fix & Verify', detail: 'sequential per-page: screenshot, fix, reload, screenshot, pixel-diff, revert no-ops' },
    { title: 'Coordinate', detail: 'package only confirmed-changed pages into one PR with gist screenshot evidence' },
  ],
}

const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args
const REPO = '/home/ohdaveed/projects/candera-payload'
const SCRATCH = parsedArgs.scratchDir
const PAGES = parsedArgs.pages
const THRESHOLD = parsedArgs.threshold

const CRITIQUE_SCHEMA = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    draftFindings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          issue: { type: 'string' },
          fix: { type: 'string' },
          targetFile: { type: 'string' },
        },
        required: ['issue', 'fix', 'targetFile'],
      },
    },
  },
  required: ['key', 'draftFindings'],
}

const FIX_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    rejected: { type: 'boolean' },
    rejectReason: { type: 'string' },
    changedPercent: { type: 'number' },
    consoleClean: { type: 'boolean' },
    newConsoleErrors: { type: 'array', items: { type: 'string' } },
    filesEdited: { type: 'array', items: { type: 'string' } },
    prePath: { type: 'string' },
    postPath: { type: 'string' },
    fixSummary: { type: 'string' },
  },
  required: [
    'key',
    'rejected',
    'rejectReason',
    'changedPercent',
    'consoleClean',
    'newConsoleErrors',
    'filesEdited',
    'prePath',
    'postPath',
    'fixSummary',
  ],
}

const COORDINATOR_SCHEMA = {
  type: 'object',
  properties: {
    prUrl: { type: 'string' },
    accepted: { type: 'array', items: { type: 'string' } },
    rejected: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['prUrl', 'accepted', 'rejected', 'summary'],
}

function critiquePrompt(page) {
  return `You are auditing the "${page.label}" page (route ${page.url}, backed by ${page.files.join(', ')}) in the Candera candle-storefront Next.js/Payload codebase at ${REPO} for design quality.

Read the page's source file(s) and closely related components it renders (page-specific components only). Do NOT read or plan changes to shared Header/Footer/global layout/globals.css/theme.css files unless the page's own file imports something clearly page-scoped that lives there.

Apply a design critique across four lenses:
1. Accessibility — semantic HTML, alt text, color contrast, focus states, aria-labels.
2. Layout — spacing consistency, responsive behavior, alignment.
3. Typography — hierarchy and scale consistent with src/app/(frontend)/typography.config.mjs and typography.css.
4. Visual consistency with design tokens in src/app/(frontend)/globals.css and theme.css.

This is a DRAFT only — do NOT edit any files. List concrete, actionable findings, each tied to a specific file and a specific fix. Keep findings scoped to this page's own template and components. If a fix seems to require a shared/global file, still name findings but note that it's shared-scope in the fix description.

Return via the required schema with key='${page.key}'.`
}

function fixPrompt(page, draft) {
  const pre = `${SCRATCH}/${page.key}-pre.png`
  const post = `${SCRATCH}/${page.key}-post.png`
  const animateKill =
    "() => { const style = document.createElement('style'); style.id = '__diff_calibration__'; style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; caret-color: transparent !important; }'; document.head.appendChild(style); return 'injected'; }"
  return `You are performing a design-critique fix pass for the "${page.label}" page of the Candera candle-storefront app, at ${page.url}, against the Next.js dev server ALREADY RUNNING at localhost:3000 in ${REPO}. This server is SHARED with other work — NEVER kill, stop, or restart it (no pkill, no fuser -k, no ctrl-c to its process, no \`pnpm dev\` re-invocation). Only interact with it via HTTP and the Playwright browser tools (mcp__plugin_playwright_playwright__*).

A prior read-only audit produced this DRAFT critique (from source code only, not yet visually verified):
${JSON.stringify(draft.draftFindings, null, 2)}

Do the following IN ORDER:

1. Confirm the server is up: \`curl -s -o /dev/null -w '%{http_code}' ${page.url} --max-time 15\`. Expect 200; retry a couple times if not.

2. Playwright: navigate to ${page.url}. Call browser_evaluate with EXACTLY this function to make screenshots deterministic:
${animateKill}
Then browser_wait_for(time: 1). Then browser_take_screenshot(filename: '${page.key}-pre.png', fullPage: true, type: 'png', scale: 'css'). This screenshot is written to the repo root (${REPO}/${page.key}-pre.png), NOT the scratch dir — immediately run Bash: \`mv '${REPO}/${page.key}-pre.png' '${pre}'\`. Then call browser_console_messages(level: 'error') and record the list as BASELINE_ERRORS.

3. Look at the pre screenshot (Read tool can view PNGs) together with the draft critique. Decide the final, concrete fix(es) for THIS page only. Scope edits strictly to ${page.files.join(', ')} and any component file used exclusively by this page (check imports/usages before editing — grep for other importers first). Do NOT edit src/app/(payload)/admin/importMap.js, src/payload-types.ts, or src/payload-generated-schema.ts. Avoid editing shared Header/Footer/globals.css/theme.css/typography.css unless there is truly no page-scoped alternative — if you do, call it out explicitly in fixSummary.

4. Apply the fix(es) with the Edit tool. Then run \`git diff --name-only\` in ${REPO} and record the exact changed-file list as FILES_EDITED.

5. Wait for Next.js Fast Refresh: poll \`curl -s -o /dev/null -w '%{http_code}' ${page.url} --max-time 20\` every few seconds until 200 (up to ~45s total). Then in Playwright: navigate to ${page.url} again (fresh reload — the injected style does not persist across navigation), re-run the EXACT SAME browser_evaluate snippet from step 2, browser_wait_for(time: 1), browser_take_screenshot(filename: '${page.key}-post.png', fullPage: true, type: 'png', scale: 'css'), then \`mv '${REPO}/${page.key}-post.png' '${post}'\`. Call browser_console_messages(level: 'error') again and record as AFTER_ERRORS.

6. Diff the two screenshots for real, not by eye, with this exact command and read CHANGED_PERCENT from stdout:
uv run --with pillow python3 - <<'EOF'
from PIL import Image
a = Image.open("${pre}").convert("RGB")
b = Image.open("${post}").convert("RGB")
if a.size != b.size:
    print("SIZE_MISMATCH")
else:
    pa = a.load(); pb = b.load()
    w, h = a.size
    changed = 0
    total = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            ca, cb = pa[x, y], pb[x, y]
            total += 1
            if any(abs(ca[i]-cb[i]) > 10 for i in range(3)):
                changed += 1
    print(f"CHANGED_PERCENT={100*changed/total:.4f}")
EOF

7. Decide:
   - If output was SIZE_MISMATCH, or CHANGED_PERCENT < ${THRESHOLD}: this is a NO-OP. Run \`git checkout -- <each path in FILES_EDITED>\` in ${REPO} to revert. Set rejected=true, rejectReason describing it as stale/no-op (visual unchanged), changedPercent=0 if SIZE_MISMATCH else the printed value, filesEdited=[] (already reverted).
   - Else if AFTER_ERRORS contains any error message not present in BASELINE_ERRORS: this is a REGRESSION. Run \`git checkout -- <each path in FILES_EDITED>\` to revert. Set rejected=true, rejectReason describing the new console error(s), consoleClean=false, newConsoleErrors=[the new messages], filesEdited=[] (already reverted).
   - Otherwise: KEEP the edits (do not revert). Set rejected=false, rejectReason='', changedPercent=the printed value, consoleClean=true, newConsoleErrors=[], filesEdited=FILES_EDITED.

8. Never delete the pre/post PNGs in ${SCRATCH} even for a rejected page — they are evidence of what was tried.

Return via the required schema: key='${page.key}', prePath='${pre}', postPath='${post}', and a 1-3 sentence fixSummary (what changed and why if accepted; what was tried and why rejected if not).`
}

function coordinatorPrompt(accepted, rejected) {
  return `You are finishing a multi-page design-fix pass on the Candera candle-storefront repo at ${REPO}, currently on git branch design/civic-content-journal-fixes (branched off main). Do not merge, do not push to main directly.

ACCEPTED pages (visual fix already applied and left in the working tree — package these, do not re-edit):
${JSON.stringify(accepted, null, 2)}

REJECTED pages (tried, edits already reverted — list as "audited, no change needed" in the PR body with their reason, not as a failure):
${JSON.stringify(rejected, null, 2)}

Steps:
1. \`git status --short\` in ${REPO}. Confirm the only modified files are the accepted pages' filesEdited, plus possibly src/app/(payload)/admin/importMap.js (Payload auto-regenerates this as a side effect of the running dev server). If that file is modified, run \`git checkout -- 'src/app/(payload)/admin/importMap.js'\` — it must NOT be in this commit. If any OTHER unexpected file is modified, STOP and report it instead of continuing.
2. Stage exactly the accepted pages' filesEdited (git add each path individually, not -A).
3. Commit with a conventional commit message, e.g. "fix(design): resolve design-critique issues on N storefront pages", body listing the pages.
4. For each ACCEPTED page, upload its before/after screenshots as evidence: \`gh gist create --public=false --desc "design-fix evidence: <page label>" '<prePath>' '<postPath>'\`, then \`gh api gists/<gist-id>\` and read each file's raw_url from the JSON (files.<filename>.raw_url) — do not guess the URL format.
5. Push: \`git push -u origin design/civic-content-journal-fixes\`.
6. Open ONE PR with \`gh pr create\` targeting main. Title like "fix(design): resolve design-critique issues across storefront pages". Body: for each accepted page, its fixSummary plus two embedded markdown images (before/after) using the raw gist URLs from step 4; then an "Audited, no change needed" section listing rejected pages and their reasons.
7. Never kill or restart the shared dev server.

Return via the schema: prUrl (created PR URL), accepted (page keys included), rejected (page keys), summary (2-3 sentences).`
}

phase('Critique')
const drafts = await parallel(
  PAGES.map((page) => () => agent(critiquePrompt(page), { label: `critique:${page.key}`, phase: 'Critique', schema: CRITIQUE_SCHEMA })),
)
const draftByKey = {}
for (const d of drafts) {
  if (d) draftByKey[d.key] = d
}

phase('Fix & Verify')
const fixResults = []
for (const page of PAGES) {
  const draft = draftByKey[page.key] || { key: page.key, draftFindings: [] }
  log(`Starting fix+verify for ${page.label}...`)
  const result = await agent(fixPrompt(page, draft), {
    label: `fix:${page.key}`,
    phase: 'Fix & Verify',
    schema: FIX_RESULT_SCHEMA,
  })
  if (result) {
    fixResults.push(result)
    log(
      result.rejected
        ? `${page.label}: REJECTED (${result.rejectReason})`
        : `${page.label}: confirmed change (${result.changedPercent.toFixed(2)}%)`,
    )
  } else {
    log(`${page.label}: agent failed, treating as rejected/no-op`)
  }
}

phase('Coordinate')
const accepted = fixResults.filter((r) => !r.rejected)
const rejected = fixResults.filter((r) => r.rejected)

if (accepted.length === 0) {
  log('No page produced a confirmed visual change — skipping PR entirely.')
  return { prUrl: null, accepted: [], rejected: rejected.map((r) => r.key), summary: 'All pages audited; no confirmed visual changes, no PR opened.' }
}

const coordinatorResult = await agent(coordinatorPrompt(accepted, rejected), {
  label: 'coordinate:open-pr',
  phase: 'Coordinate',
  schema: COORDINATOR_SCHEMA,
})

return { fixResults, coordinatorResult }
