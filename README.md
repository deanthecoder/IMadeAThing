# I Made A Thing

Dean Edis / DeanTheCoder’s projects and development notes. Static HTML, CSS and JavaScript intended for GitHub Pages, with no build step.

Live site: [deanthecoder.github.io/IMadeAThing](https://deanthecoder.github.io/IMadeAThing/)

## Preview

Run `python3 -m http.server 8080` here and open http://localhost:8080. Use HTTP so the reader can load article pages.

## Collection

All 33 published posts were imported from the September 10, 2026 WordPress backup. The old About page is intentionally omitted. Original wording, code, headings, dates, links and captions are preserved. Thirteen additional shader projects use locally stored ArtStation cover images and link to their live Shadertoy source. ArtStation pieces already covered by an imported article reuse that article instead of appearing twice. Wolfenshine, SteedPilot, ZXBasic, MechRewired, Bad Apple, Brain and Browse are the first new articles added after the import, giving 53 collection entries in total. Ten entries are Featured; other filters are Retro, Shaders, Arduino, Builds and Tools. Featured selects one second after loading unless the visitor interacts first. The distant scene shows a category-balanced sample of up to 20 previews; every entry is available through its category and the full collection grid.

All cards open the same reader, including when `index.html` is opened directly from Finder: article bodies are bundled in `content.js` rather than fetched at runtime. Search uses that same local content and opens from the header, `/` or `Ctrl`/`Command`+`K`. Supported browsers progressively morph a selected card into the reader with the View Transition API. Each article also has a standalone page under `articles/`, and the former WordPress article paths redirect to these pages. YouTube-only posts use locally saved video thumbnails as both their card art and an article preview; selecting the preview opens the original video. The domain itself is not configured or renewed by this project.

Links to known old WordPress article URLs are rewritten to their imported pages. Any remaining links back to `imadeathing.co.uk` are rewritten to the new site homepage, so the finished site does not depend on the expiring domain.

`content.js` supplies the cards and bundled reader content. Purpose-sized card thumbnails live under `assets/cards/`, named after the item ID; a new item falls back to its original image until a thumbnail is added. Original media and article image variants live under `assets/archive/`. YouTube embeds still need an internet connection. Three unavailable external product images are represented by notes; two unavailable advertising tracking pixels were removed. External linked sites and video playback have not been exhaustively verified live.

Placeholder project cards and invented sample articles have been removed; newer projects can be added separately with real content. The original WordPress backup is retained separately from this publication-ready repository.

## Hosting

The public repository is [DeanTheCoder/IMadeAThing](https://github.com/DeanTheCoder/IMadeAThing). GitHub Pages deploys the root of `main`; relative paths and `.nojekyll` keep the site working under `/IMadeAThing/`.
