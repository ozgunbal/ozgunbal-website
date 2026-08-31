# Presentation Conversion Guide

## Overview

This guide explains how to convert Slides.com exported presentations to work with your React Router website.

## Exported Structure Analysis

### Current Structure (from Slides.com)
```
slides_[presentation-name]/
├── index.html              # Main presentation HTML
├── lib/                    # Reveal.js dependencies (shared)
│   ├── reveal.css
│   ├── reveal.js
│   ├── reveal-plugins.js
│   ├── offline.js
│   ├── offline-v1.css
│   ├── offline-v2.css
│   └── fonts/             # Various fonts
└── [presentation-slug]/   # Presentation-specific assets (images, etc.)
```

### Target Structure (for React Router)
```
public/presentations/
├── lib/                   # Shared reveal.js library (once)
│   ├── reveal.css
│   ├── reveal.js
│   ├── reveal-plugins.js
│   └── fonts/
└── content/              # Individual presentations
    ├── flutter-101/
    │   ├── slides.html   # Extracted slides content
    │   ├── metadata.json # Title, description, date, tags
    │   └── assets/       # Images and other assets
    ├── monorepos-in-action/
    └── web-ci-cd/
```

## Conversion Strategy

### Phase 1: Manual Conversion (Current - 3 presentations)

For the initial 3 presentations, we'll:

1. **Extract Slide Content**
   - Parse `index.html`
   - Extract `<section>` elements from `<div class="slides">`
   - Save as standalone HTML fragment

2. **Centralize Library Files**
   - Copy `lib/` folder once to `public/presentations/lib/`
   - All presentations will share this single copy

3. **Organize Assets**
   - Move presentation-specific assets to `public/presentations/content/[slug]/assets/`
   - Update image paths in slide HTML

4. **Create Metadata**
   - Extract title, theme colors, settings from original HTML
   - Store in `metadata.json` for each presentation

### Phase 2: Automated Conversion (Future - remaining 20 presentations)

Create a Node.js script to automate the process:

```bash
npm run convert-presentation -- ./slides-backup/slides_[name]
```

## Conversion Methods

### Method 1: Manual Extraction (Recommended for First 3)

**Step 1: Extract Slides Content**

From `index.html`, copy everything between:
```html
<div class="slides">
  <!-- COPY THIS CONTENT -->
</div>
```

Save to: `public/presentations/content/[slug]/slides.html`

**Step 2: Create Metadata File**

Extract from original HTML `<head>`:
- Title: `<title>` tag
- Theme: `class="theme-font-* theme-color-*"` on `<body>`
- Settings: Reveal.initialize() config

Create `public/presentations/content/[slug]/metadata.json`:
```json
{
  "title": "Flutter 101",
  "slug": "flutter-101",
  "description": "For React Developers",
  "date": "2024-09-02",
  "tags": ["Flutter", "Mobile", "React"],
  "theme": {
    "font": "montserrat",
    "color": "white-blue"
  },
  "revealConfig": {
    "width": 960,
    "height": 700,
    "transition": "slide",
    "controls": true,
    "progress": true
  }
}
```

**Step 3: Move Assets**

```bash
# From slides-backup
cp -r slides_flutter-101/technical-writing public/presentations/content/flutter-101/assets

# Update paths in slides.html
# FROM: technical-writing/image.png
# TO:   /presentations/content/flutter-101/assets/image.png
```

**Step 4: Copy Shared Library (Once)**

```bash
cp -r slides-backup/slides_flutter-101/lib public/presentations/lib
```

### Method 2: Automated Script (For Remaining 20)

**Create conversion script:** `scripts/convert-presentation.js`

```javascript
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function convertPresentation(sourcePath) {
  // 1. Read index.html
  const html = fs.readFileSync(path.join(sourcePath, 'index.html'), 'utf-8');
  const $ = cheerio.load(html);

  // 2. Extract metadata
  const title = $('title').text();
  const bodyClass = $('body').attr('class');
  const theme = extractTheme(bodyClass);

  // 3. Extract slides content
  const slidesHtml = $('.slides').html();

  // 4. Find assets folder
  const assetsFolders = fs.readdirSync(sourcePath)
    .filter(f => !['index.html', 'lib'].includes(f));

  // 5. Generate slug
  const slug = path.basename(sourcePath).replace('slides_', '');

  // 6. Create target structure
  const targetDir = `public/presentations/content/${slug}`;
  fs.mkdirSync(targetDir, { recursive: true });

  // 7. Save slides.html
  fs.writeFileSync(
    path.join(targetDir, 'slides.html'),
    slidesHtml
  );

  // 8. Save metadata.json
  const metadata = {
    title,
    slug,
    theme,
    // ... extract other metadata
  };
  fs.writeFileSync(
    path.join(targetDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  // 9. Copy assets
  if (assetsFolders.length > 0) {
    fs.cpSync(
      path.join(sourcePath, assetsFolders[0]),
      path.join(targetDir, 'assets'),
      { recursive: true }
    );
  }

  // 10. Update asset paths in slides.html
  updateAssetPaths(targetDir, slug);
}
```

## Integration with React Router

### Presentation Viewer Component

```tsx
// app/components/PresentationViewer.tsx
import { useEffect, useRef } from 'react';

interface PresentationViewerProps {
  slug: string;
  metadata: PresentationMetadata;
}

export function PresentationViewer({ slug, metadata }: PresentationViewerProps) {
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load slides content
    fetch(`/presentations/content/${slug}/slides.html`)
      .then(res => res.text())
      .then(html => {
        if (deckRef.current) {
          deckRef.current.innerHTML = html;

          // Initialize Reveal.js
          window.Reveal.initialize({
            ...metadata.revealConfig,
            embedded: true,
          });
        }
      });

    return () => {
      window.Reveal?.destroy();
    };
  }, [slug]);

  return (
    <div className="reveal">
      <div className="slides" ref={deckRef} />
    </div>
  );
}
```

### Route Structure

```tsx
// app/routes/presentations.$slug.tsx
import { useParams, useLoaderData } from 'react-router';
import { PresentationViewer } from '~/components/PresentationViewer';

export async function loader({ params }: LoaderArgs) {
  const metadata = await fetch(`/presentations/content/${params.slug}/metadata.json`)
    .then(res => res.json());
  return { metadata };
}

export default function PresentationPage() {
  const { slug } = useParams();
  const { metadata } = useLoaderData<typeof loader>();

  return (
    <div className="presentation-page">
      <PresentationViewer slug={slug!} metadata={metadata} />
    </div>
  );
}
```

## Asset Path Updates

When converting, update all asset paths:

**Before (in Slides.com export):**
```html
<img src="technical-writing/image.png" />
```

**After (in React Router):**
```html
<img src="/presentations/content/flutter-101/assets/image.png" />
```

Use regex replacement:
```javascript
// In slides.html
html = html.replace(
  /src="([^/"][^"]+)"/g,
  `src="/presentations/content/${slug}/assets/$1"`
);

html = html.replace(
  /data-background-image="([^/"][^"]+)"/g,
  `data-background-image="/presentations/content/${slug}/assets/$1"`
);
```

## Reveal.js Configuration

### Global Setup (app/root.tsx)

```tsx
// Add to <head>
<link rel="stylesheet" href="/presentations/lib/reveal.css" />
<link rel="stylesheet" href="/presentations/lib/offline-v2.css" />

// Add before </body>
<script src="/presentations/lib/reveal.js"></script>
<script src="/presentations/lib/reveal-plugins.js"></script>
```

### Per-Presentation Customization

Each presentation can override default settings via `metadata.json`:

```json
{
  "revealConfig": {
    "width": 960,
    "height": 700,
    "controls": true,
    "progress": true,
    "center": false,
    "transition": "slide",
    "theme": "white-blue"
  }
}
```

## Checklist for Each Presentation

- [ ] Extract slides content to `slides.html`
- [ ] Create `metadata.json` with title, description, tags
- [ ] Move assets to `content/[slug]/assets/`
- [ ] Update all asset paths in HTML
- [ ] Test presentation loads correctly
- [ ] Verify all images display
- [ ] Check code syntax highlighting works
- [ ] Ensure navigation controls work
- [ ] Test on mobile devices

## Next Steps

1. **Manual Conversion**: Convert the 3 sample presentations
2. **Test Integration**: Verify everything works in React Router
3. **Build Automation**: Create conversion script
4. **Batch Convert**: Process remaining 20 presentations
5. **Add Features**: Search, filtering, tags, thumbnails

## Troubleshooting

### Images not loading
- Check asset paths are absolute (`/presentations/...`)
- Verify files copied to correct location
- Check browser console for 404 errors

### Reveal.js not initializing
- Ensure scripts loaded in correct order
- Check for JavaScript errors in console
- Verify `window.Reveal` is available

### Styling issues
- Confirm CSS files loaded
- Check theme classes applied correctly
- Verify custom styles not conflicting

## Resources

- [Reveal.js Documentation](https://revealjs.com/)
- [Slides.com Export Guide](https://help.slides.com/knowledgebase/articles/546541)
- React Router integration examples in `/app/components/`
