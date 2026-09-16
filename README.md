# I Made A Thing

Dean Edis / DeanTheCoder’s projects and development notes. Static HTML, CSS and JavaScript intended for GitHub Pages, with no build step.

## Preview

Run `python3 -m http.server 8080` here and open http://localhost:8080. Use HTTP so the reader can load article pages.

## Collection

All 33 published posts were imported from the September 10, 2026 WordPress backup. The old About page is intentionally omitted. Original wording, code, headings, dates, links and captions are preserved. Six entries are Featured; other filters are Emulation, Shaders, Arduino, Builds and Tools. Featured selects one second after loading unless the visitor interacts first. The distant scene shows up to eight previews; every article is available through its category and the full collection grid.

All cards open the same reader, including when `index.html` is opened directly from Finder: article bodies are bundled in `content.js` rather than fetched at runtime. Each article also has a standalone page under `articles/`, and the former WordPress article paths redirect to these pages. YouTube-only posts use locally saved video thumbnails as both their card art and an article preview; selecting the preview opens the original video. The domain itself is not configured or renewed by this project.

Links to known old WordPress article URLs are rewritten to their imported pages. Any remaining links back to `imadeathing.co.uk` are rewritten to the new site homepage, so the finished site does not depend on the expiring domain.

`content.js` supplies the cards and bundled reader content. Original media and article image variants live under `assets/archive/`. YouTube embeds still need an internet connection. Three unavailable external product images are represented by notes; two unavailable advertising tracking pixels were removed. External linked sites and video playback have not been exhaustively verified live.

Placeholder project cards and invented sample articles have been removed; newer projects such as Browse and G33kShell can be added separately with real content. The original WordPress backup is retained separately from this publication-ready repository.

## Hosting

This is a local Git repository. No GitHub repository or deployment has been created. Relative paths and `.nojekyll` support deployment from the repository root. Review the populated site and check mobile/touch behavior before publishing.
