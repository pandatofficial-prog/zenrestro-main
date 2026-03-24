# ZenRestro Render Deployment TODO

## Plan Status: In Progress

1. [x] **Fix render.yaml**: Updated service names (`zenrestro-api/web`), dynamic URLs via `$ZENRESTRO_API_URL`, added prod settings (npm ci, NODE_ENV), JWT_SECRET auto-generate.
2. [x] **Update package.jsons**: Added engines to all, root preview script. Render uses npm ci in buildCommand.
3. [x] **Enhance backend/server.js**: Added helmet, compression, rateLimit (100/15min), morgan logging, prod error handling.
4. [x] **Verify frontend config**: api.js good, _redirects good.
5. [ ] **MongoDB Setup**: Create Atlas cluster (see earlier instructions), get URI.
6. [x] **GitHub Repo**: Pushed `blackboxai/render-deploy` branch to https://github.com/pandatofficial-prog/zenrestro-main.
7. [ ] **Connect to Render**: Dashboard → New Blueprint → https://github.com/pandatofficial-prog/zenrestro-main.
8. [ ] **Configure Env Vars**: Set MONGODB_URI, JWT_SECRET, etc. in Render services.
9. [ ] **Seed DB & Test**: POST /api/seed, verify frontend/backend integration.
10. [ ] **Complete**: Provide final URLs and monitoring instructions.

**Next Step**: 1. Fix render.yaml

