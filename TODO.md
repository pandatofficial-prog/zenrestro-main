# ZenRestro Render Deployment TODO

## Plan Status: In Progress

1. [x] **Fix render.yaml**: Updated service names (`zenrestro-api/web`), dynamic URLs via `$ZENRESTRO_API_URL`, added prod settings (npm ci, NODE_ENV), JWT_SECRET auto-generate.
2. [x] **Update package.jsons**: Added engines to all, root preview script. Render uses npm ci in buildCommand.
3. [x] **Enhance backend/server.js**: Added helmet, compression, rateLimit (100/15min), morgan logging, prod error handling.
4. [ ] **Verify frontend config**: Check api.js uses VITE_API_URL, update _redirects for SPA.
5. [ ] **MongoDB Setup**: Create Atlas cluster, get URI for Render env vars.
6. [ ] **GitHub Repo**: Create/push code to GitHub.
7. [ ] **Connect to Render**: Dashboard → New Blueprint → Deploy from GitHub repo.
8. [ ] **Configure Env Vars**: Set MONGODB_URI, JWT_SECRET, etc. in Render services.
9. [ ] **Seed DB & Test**: POST /api/seed, verify frontend/backend integration.
10. [ ] **Complete**: Provide final URLs and monitoring instructions.

**Next Step**: 1. Fix render.yaml

