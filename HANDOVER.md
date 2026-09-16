# Continuing I Made A Thing at home

Copy this entire folder, including assets. No Codex session state or package installation is needed. Run `python -m http.server 8080` from the folder, then open http://localhost:8080. Alternatively open index.html directly.

## Files

- index.html: page structure, identity and introductory wording.
- style.css: scenery, responsive layout and card styling.
- app.js: sample content in the items array, categories, depth layout, gestures and reader.
- assets/neon-mountains.png: static generated mountain artwork.

## Agreed direction

Headline: I Made A Thing. Identity: Dean Edis / DeanTheCoder. Tone: personal and practical — what I tried, what went wrong, and what others can learn.

All six cards initially sit in a distant field. Categories are mutually exclusive but can all be off. Clicking a distant card selects its category and brings it forward; clicking the foreground card opens the reader. Mouse dragging, touch and horizontal trackpad gestures navigate the carousel. The floor and mountains drift subtly only with no category selected. Motion can be disabled and respects the system reduced-motion preference.

## Importing articles

Dean has captures of the original article HTML at home. Use those as the migration source. The blog was readable at https://imadeathing.co.uk/ during this session; the .com address did not serve the blog.

Start with “Making a Game Boy Emulator – Let’s Play Tetris”, paired with G33kBoy (https://github.com/deanthecoder/G33kBoy). Other candidates include ZX Speculator, GLSL Shader Shrinker, shader experiments and hardware builds.

Extract article content from the WordPress wrapper, preserving headings, code, links, dates and image captions. Remove old navigation, widgets and executable scripts. Copy associated images and fix asset paths. Review video embeds individually. Replace the sample text and illustrative previews with original articles and actual project screenshots. The current sample articles are not Dean’s original writing.

As the collection grows, move content out of app.js into separate static article files. Keep stable article URLs and plan mappings for old WordPress URLs before launch. The current reader uses hash URLs only.

## Remaining work

- Import captured articles and add the G33kBoy project/article pair.
- Add real project screenshots and individual repository links.
- Animate the selected card expanding into the reader and returning on close.
- Check mobile/touch behaviour and performance on modest hardware.
- Configure the chosen GitHub Pages repository and domain when ready. Nothing has been published.
