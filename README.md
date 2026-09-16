# I Made A Thing

Dean Edis / DeanTheCoder’s projects and development notes. Static HTML, CSS and JavaScript intended for GitHub Pages, with no build step.

## Preview

Run `python3 -m http.server 8080` here and open http://localhost:8080. Use HTTP so the reader can load article pages.

## Collection

All 33 published posts and the About page were imported from the September 10, 2026 WordPress backup. Original wording, code, headings, dates, links and captions are preserved. Six entries are Featured; other filters are Tools, Retro, Shaders, Hardware and About. Featured selects one second after loading unless the visitor interacts first. The distant scene shows up to eight previews; every article is available through its category and the full collection grid.

All cards open the same reader. Each article also has a standalone page under `articles/`, and the former WordPress article paths redirect to these pages. `content/url-map.json` records the mapping. YouTube-only posts use locally saved video thumbnails as both their card art and an article preview; selecting the preview opens the original video. The domain itself is not configured or renewed by this project.

`content.js` supplies the cards; `content/articles.json` holds the same metadata. Original media and article image variants live under `assets/archive/`. YouTube embeds still need an internet connection. Three unavailable external product images are represented by notes; two unavailable advertising tracking pixels were removed. Details are in `content/import-report.json`. External linked sites and video playback have not been exhaustively verified live.

The initial commit preserves the downloaded prototype. Placeholder project cards and invented sample articles have been removed; newer projects such as Browse and G33kShell can be added separately with real content.

## Repeatable import and verification

Install `beautifulsoup4` in a Python virtual environment, then run:

```
python scripts/import_backup.py /path/to/imadeathing-backup-2026-09-10.zip
python scripts/verify_import.py /path/to/imadeathing-backup-2026-09-10.zip
```

The importer updates generated article pages, old-path redirects, metadata and archived assets. It preserves the current presentation and carousel implementation. The verifier compares article text (normalizing whitespace) to the source and checks local HTML references.

## Hosting

This is a local Git repository. No GitHub repository or deployment has been created. Relative paths and `.nojekyll` support deployment from the repository root. Review the populated site and check mobile/touch behavior before publishing.
