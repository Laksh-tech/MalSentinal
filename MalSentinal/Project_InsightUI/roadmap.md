# Roadmap

## Deploy to GitHub Pages (github.io)
- [x] vite.config.ts — GITHUB_PAGES-gated static build (base /MalSentinal/, prerender, nitro static)
- [x] .github/workflows/deploy.yml — build + deploy dist/client via actions/deploy-pages@v4
- [x] public/.nojekyll, relative favicon link
- [x] Static build verified (GITHUB_PAGES=true bun run build → prerender OK)
- [ ] User connects Lovable project to repo Laksh-tech/MalSentinal and enables Pages → GitHub Actions source

## Live demo page
- [x] Add interactive demo route /demo: run model on a sample graph, show classification result
- [x] Link from Home (Slide 2) and Model Training (Slide 6)
- [x] Works on static GitHub Pages build (client-side simulated pipeline)
- [x] Verified: 3 samples (benign, trojan, adware), animated pipeline, graph viz, explanation
