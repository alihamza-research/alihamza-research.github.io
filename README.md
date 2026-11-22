# Ali Hamza — Portfolio

Personal portfolio of **Ali Hamza**, Researcher & Software Engineer (MS Software Engineering, NUST).
Open to fully funded PhD positions in Software Engineering & AI.

A single static page with no build step and no dependencies.

| File | Purpose |
|---|---|
| `index.html` | Page content |
| `styles.css` | Layout, colour palettes (60 / 30 / 10 rule), responsive rules |
| `script.js` | Intro animation, dot portrait, scroll reveals, palette switcher |
| `portrait-data.js` | Tone grid the dot portrait is built from |
| `Ali-Hamza-CV.pdf` | Curriculum vitae linked from the page |

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python -m http.server 5500
```

then visit http://localhost:5500. Add `?theme=graphite` (or `lavender`, `sapphire`, `ivory`, `storm`) to open a specific palette, and `?portrait=bw` for the black-and-white portrait.
