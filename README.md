# I Made A Thing

Dean Edis / DeanTheCoder’s portfolio and development notes. Static HTML, CSS and JavaScript, intended for GitHub Pages. No build step or package installation required.

## Local preview

Run `python3 -m http.server 8080` from this folder, then open http://localhost:8080.

## First content slice

The homepage opens with the cards in the distance and subtle mouse-driven terrain movement and a slow forward floor-grid glide. The header keeps just the site title, a short description, and essential links. The Motion control pauses the glide, and reduced-motion preferences disable it. Category controls sit above the carousel; choosing a category brings its cards forward. The collection grid stays collapsed until “View all projects and notes” is opened. The original “Making a Game Boy Emulator – Let’s Play Tetris” article has a standalone URL at `articles/game-boy-tetris/`, with its backed-up image stored locally. The remaining six entries retain the prototype’s demonstration content and illustrations; they are not finished project descriptions.

`content/game-boy-tetris.json` retains the selected published WordPress article as a migration source. The full backup remains outside this repository. Article prose has been preserved; WordPress presentation markup has been cleaned for the new layout.

## Publishing later

This is a local Git repository. No GitHub repository or deployment has been created. The files use relative paths and include `.nojekyll` for static GitHub Pages hosting. Publish from the repository root when ready, after replacing the remaining sample content. No custom domain is configured.

## Next steps

- Review this first real article and the homepage direction.
- Replace sample projects with original writing, screenshots and direct repository links.
- Import the remaining backed-up articles and map old WordPress paths.
- Check mobile, keyboard and touch behavior before launch.

The initial Git commit preserves the unmodified downloaded prototype and its original handover notes.

Featured is a curated filter independent of project categories; currently G33kBoy is featured. Set `featured: true` on additional entries to include them. GitHub, X, and Linktree profile icons sit beside the title. The bottom-right Motion toggle controls animation; the floor advances one tile every six seconds.

Featured selects automatically one second after page load, unless the visitor has already interacted with the carousel or opened an article. Carousel movement uses synchronized position, edge fading and integer stacking order; wrapping cards reach zero opacity before changing sides.

All collection cards open the shared reading dialog, including imported articles. Imported article HTML is loaded from its standalone page, with asset URLs resolved relative to that page. The reader also links to the standalone article for direct access.
