#!/usr/bin/env python3
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pass_path = root / '.env.pass'
template_path = root / '.env.template'
backup_path = root / '.env.pass.bak'
merged_path = root / '.env.pass'

source_path = pass_path if pass_path.exists() else backup_path

if not source_path.exists():
    print('.env.pass not found; run ./scripts/generate-pass-env.sh --out .env.pass first')
    raise SystemExit(2)
if not template_path.exists():
    print('.env.template not found')
    raise SystemExit(2)

pass_text = source_path.read_text().replace('\r\n', '\n')
# Build pass map
pass_map = {}
for m in re.finditer(r"^([A-Z0-9_]+)=(['\"])(.*)\2$", pass_text, flags=re.M):
    k, q, v = m.group(1), m.group(2), m.group(3)
    pass_map[k] = q + v + q

# Read template and produce merged
template_lines = template_path.read_text().splitlines()
merged_lines = []
mapped = {}
unmatched = []

# Helper: tokenize and normalize
def tokens(s):
    return [t for t in re.split(r'[^A-Za-z0-9]+', s) if t]

def norm(s):
    return ''.join(c for c in s.lower() if c.isalnum())

pass_keys_norm = {k: norm(k) for k in pass_map.keys()}
GENERIC_TOKENS = {
    'api', 'base', 'com', 'key', 'note', 'password', 'public', 'secret',
    'token', 'url', 'username', 'next', 'http', 'https', 'www',
}

FIELD_COMPAT = {
    'password': {'password', 'secret', 'token'},
    'secret': {'secret', 'password', 'token'},
    'token': {'token', 'secret', 'password', 'api_key'},
    'api_key': {'api_key', 'token', 'secret'},
    'username': {'username'},
    'note': {'note'},
}

def expected_kind(var: str):
    if var in {'BLOB_READ_WRITE_TOKEN', 'CRON_SECRET', 'PREVIEW_SECRET', 'VERCEL_OIDC_TOKEN'}:
        return 'token' if 'TOKEN' in var else 'secret'
    if var in {'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY'}:
        return 'api_key'
    if var in {'SUPABASE_JWT_SECRET', 'SUPABASE_SECRET_KEY'}:
        return 'secret'
    if var == 'SUPABASE_SERVICE_ROLE_KEY':
        return 'secret'
    if var in {'DATABASE_URI', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL', 'POSTGRES_URL_NON_POOLING', 'POSTGRES_URL_NO_SSL'}:
        return 'connection_string'
    if var in {'PGPASSWORD', 'POSTGRES_PASSWORD'}:
        return 'password'
    if var == 'NEON_AUTH_BASE_URL':
        return 'url'
    if var.endswith('_USERNAME'):
        return 'username'
    if var.endswith('_PASSWORD'):
        return 'password'
    if var.endswith('_TOKEN'):
        return 'token'
    if var.endswith('_SECRET'):
        return 'secret'
    if var.endswith('_API_KEY'):
        return 'api_key'
    return None

def field_kind_from_uri(uri: str):
    return uri.rsplit('/', 1)[-1].strip("'\"")

def compatible(expected, actual):
    if expected is None:
        return True
    if expected == 'connection_string':
        return actual in {'url', 'url_or_connection_string', 'connection_string', 'password_or_url'}
    if expected == 'url':
        return actual in {'url', 'website', 'url_or_connection_string', 'password_or_url'}
    return actual in FIELD_COMPAT.get(expected, {expected})

for line in template_lines:
    m = re.match(r'^([A-Z0-9_]+)=(.*)$', line)
    if not m:
        merged_lines.append(line)
        continue
    var = m.group(1)
    rhs = m.group(2)
    # Only attempt substitution if placeholder contains ITEM_ID_HERE
    if 'ITEM_ID_HERE' not in rhs:
        merged_lines.append(line)
        continue
    # Try exact
    if var in pass_map:
        actual_kind = field_kind_from_uri(pass_map[var])
        expected = expected_kind(var)
        if compatible(expected, actual_kind):
            merged_lines.append(f"{var}={pass_map[var]}")
            mapped[var] = var
            continue
    # Heuristic matching: find best pass_map key by token overlap
    expected = expected_kind(var)
    var_tokens = tokens(var)
    var_signal_tokens = {t.lower() for t in var_tokens if t.lower() not in GENERIC_TOKENS}
    best = None
    best_score = -10**9
    for pk in pass_map.keys():
        actual_kind = field_kind_from_uri(pass_map[pk])
        if not compatible(expected, actual_kind):
            continue
        score = 0
        pk_tokens = tokens(pk)
        pk_signal_tokens = {t.lower() for t in pk_tokens if t.lower() not in GENERIC_TOKENS}
        shared_signal = var_signal_tokens & pk_signal_tokens
        if not shared_signal and norm(var) != norm(pk):
            continue
        # common tokens
        score += len(set(t.lower() for t in var_tokens) & set(t.lower() for t in pk_tokens))
        # substring matches on normalized
        if norm(var) in pass_keys_norm[pk] or pass_keys_norm[pk] in norm(var):
            score += 1
        score += len(shared_signal) * 2
        if expected and actual_kind == expected:
            score += 2
        elif expected and actual_kind in FIELD_COMPAT.get(expected, set()):
            score += 1
        if expected in {'connection_string', 'url'} and actual_kind in {'password', 'secret', 'token'}:
            score -= 3
        if score > best_score:
            best_score = score
            best = pk
    if best and best_score >= 2:
        merged_lines.append(f"{var}={pass_map[best]}")
        mapped[var] = best
    else:
        merged_lines.append(line)
        unmatched.append(var)

# Back up the original .env.pass before overwriting it with the merged output
if source_path == pass_path and not backup_path.exists():
    pass_path.rename(backup_path)

# Write merged to .env.pass
merged_text = '\n'.join(merged_lines) + '\n'
merged_path.write_text(merged_text)
merged_path.chmod(0o600)

print(f'Merged .env.pass written from {source_path.name}. Backup preserved at .env.pass.bak')
print('\nMappings:')
for var, pk in mapped.items():
    print(f"{var} <= {pk}")
if unmatched:
    print('\nUnmatched template vars (left as placeholders):')
    for u in unmatched:
        print(u)

print('\nDone.')
