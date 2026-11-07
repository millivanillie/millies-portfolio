# Millie Dayaram — Portfolio

A hand-coded portfolio in plain HTML, CSS and JavaScript. No build tools, no frameworks.

## What's in the folder

| File | What it is |
| --- | --- |
| `index.html` | Home page: intro, selected work, how I design, background, contact |
| `fitness-app.html` | Fitness App Redesign case study |
| `hiking-app.html` | Hiking App Redesign case study |
| `styles.css` | All styling. Colours, fonts and spacing live at the top under `:root` |
| `script.js` | Side-rail section name, photo gallery, typewriter title, footer year |
| `images/` | Put your images here |

## Finishing the content

1. **Find what's left to write.** In VS Code, press `Ctrl+Shift+F` (Windows) or `Cmd+Shift+F` (Mac) and search for `todo`. Every highlighted sentence on the site is a prompt for you to replace.
2. **Add images.** Save them in `images/`, then replace each placeholder, for example:

   ```html
   <div class="ph ph--tall">Cover image · images/fitness-cover.jpg</div>
   ```
   becomes
   ```html
   <img class="media-img" src="images/fitness-cover.jpg" alt="Redesigned privacy settings screen showing data sharing toggles">
   ```
   Keep images under about 500 KB each (export as .jpg or .webp) so the site loads quickly.
3. **Gallery photos.** The "Beyond design" gallery has 12 spots (`life-1.jpg` to `life-12.jpg`). See `images/README.txt` for how the filters and sizes work.
4. **Contact details.** In `index.html`, replace `you@example.com` and the LinkedIn link.
5. **Resume.** Add your resume as `resume.pdf` in the main folder (same level as `index.html`).
6. **Change the accent colour.** Edit `--accent` and `--accent-glow` at the top of `styles.css`.

## Previewing in VS Code

1. Open the folder: **File → Open Folder…** and choose `millie-portfolio`.
2. Install the **Live Server** extension (Extensions panel, search "Live Server" by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**. The page reloads every time you save.

## Publishing on GitHub Pages

### First time

1. Go to [github.com/new](https://github.com/new) and create a repository.
   - Name it `millivanillie.github.io` if you want the site at `https://millivanillie.github.io`.
   - Or name it something like `portfolio`, and the site will be at `https://millivanillie.github.io/portfolio`.
   - Keep it **Public**. Don't add a README (this folder already has one).
2. In VS Code, open the terminal (**Terminal → New Terminal**) and run these one at a time, changing the repository name if you used a different one:

   ```bash
   git init
   git add .
   git commit -m "First version of portfolio"
   git branch -M main
   git remote add origin https://github.com/millivanillie/millivanillie.github.io.git
   git push -u origin main
   ```
3. On GitHub, open the repository → **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose **main** and **/(root)**, then **Save**.
5. Wait a minute or two, refresh, and the live link appears at the top of the Pages settings.

### Every update after that

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Or use the **Source Control** panel in VS Code (the branch icon on the left): type a message, click **Commit**, then **Sync Changes**.

## Design notes

The layout pulls from three references:

- **Pill buttons, the vertical side rail and the line running through each "Read case study" button** come from the minimalist PDF portfolio template.
- **The large grotesque type, generous white space, section titles over a full-width rule and the expanding list in "How I design"** come from the Arnau Ros template.
- **The faint column lines in the background and the soft splash of colour behind the intro** come from the UX portfolio website template.

Typefaces are [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) for titles and body text and [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) for smaller headings and labels, both free from Google Fonts. They're set as `--sans` and `--mono` at the top of `styles.css`.

Accessibility built in: a skip link, visible keyboard focus, semantic headings, native expanding sections that work with a keyboard and screen reader, and reduced motion respected (the tools ticker stops for anyone who has turned off animations).
