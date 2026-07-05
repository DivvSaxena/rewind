# Adding a new frontend domain

Every frontend domain must be in the backend's CORS allowlist, or the browser
blocks all API calls and the debugger shows **"Failed to fetch" / disconnected**
even though the backend is healthy. This has bitten us twice
(`rewind-pink.vercel.app`, then `tryrewind.vercel.app`) — follow this checklist
whenever a domain is added or changed.

## Checklist

1. **Add the domain in Vercel** (project → Settings → Domains). Wait for
   "Valid Configuration".

2. **Add the origin to the backend CORS allowlist.** Edit `backend/fly.toml`:

   ```toml
   [env]
     CORS_ORIGINS = '...existing origins...,https://<new-domain>'
   ```

   Rules for each entry:
   - Exact match only — no wildcards.
   - Include the `https://` scheme.
   - No trailing slash.
   - Comma-separated, no spaces (the backend does a plain `.split(",")`
     in `backend/main.py`).

3. **Redeploy the backend** so the env change takes effect:

   ```bash
   cd backend && fly deploy
   ```

4. **Verify with a preflight request** before touching the browser:

   ```bash
   curl -s -i -X OPTIONS https://rewind-backend.fly.dev/graph \
     -H "Origin: https://<new-domain>" \
     -H "Access-Control-Request-Method: GET" | head -8
   ```

   Good: `HTTP/2 200` with `access-control-allow-origin: https://<new-domain>`.
   Bad: `HTTP/2 400` with body `Disallowed CORS origin` → the origin string in
   `fly.toml` doesn't exactly match what the browser sends.

5. **Commit the `fly.toml` change** so the repo matches what's deployed.

## If the *backend* URL ever changes

The frontend bakes the API URL at build time (`NEXT_PUBLIC_API_URL`). A new
backend URL requires updating that env var in Vercel (or the
`--build-arg` for the Fly frontend) and **rebuilding/redeploying the
frontend** — a runtime env change is not enough.

## Symptom → cause quick reference

| Symptom | Likely cause |
|---------|--------------|
| "Failed to fetch", backend healthy | New domain missing from `CORS_ORIGINS` |
| Preflight 400 "Disallowed CORS origin" | Origin typo: scheme, trailing slash, or www mismatch |
| Works on old domain, fails on new | Allowlist updated but backend not redeployed |
| Fails everywhere | Backend actually down — check `fly status -a rewind-backend` |
