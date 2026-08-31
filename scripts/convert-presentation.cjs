#!/usr/bin/env node

/**
 * Presentation Conversion Script
 *
 * Converts Slides.com exported presentations to React Router format
 *
 * Usage:
 *   node scripts/convert-presentation.js <path-to-slides-folder>
 *
 * Example:
 *   node scripts/convert-presentation.js ./slides-backup/slides_flutter-101
 */

const fs = require('fs');
const path = require('path');

function extractTheme(bodyClass) {
  const fontMatch = bodyClass.match(/theme-font-(\w+)/);
  const colorMatch = bodyClass.match(/theme-color-([\w-]+)/);

  return {
    font: fontMatch ? fontMatch[1] : 'montserrat',
    color: colorMatch ? colorMatch[1] : 'white-blue',
  };
}

function extractRevealConfig(html) {
  const configMatch = html.match(/Reveal\.initialize\(([\s\S]*?)\);/);
  if (!configMatch) return {};

  try {
    // Extract the config object (simplified parsing)
    const configStr = configMatch[1];
    const config = {};

    // Parse key-value pairs
    const pairs = configStr.match(/(\w+):\s*([^,\n]+)/g) || [];
    pairs.forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (value === 'true') config[key] = true;
      else if (value === 'false') config[key] = false;
      else if (!isNaN(value)) config[key] = Number(value);
      else config[key] = value.replace(/['"]/g, '');
    });

    return config;
  } catch (e) {
    console.warn('Could not parse Reveal config:', e.message);
    return {};
  }
}

function generateSlug(folderName) {
  return folderName.replace(/^slides_/, '');
}

function extractSlidesContent(html) {
  const match = html.match(/<div class="slides">([\s\S]*?)<\/div>\s*<\/div>\s*<script/);
  return match ? match[1].trim() : '';
}

function extractThumbnail(slidesHtml, slug) {
  // Try to find data-background-image in first section
  const firstSectionMatch = slidesHtml.match(/<section[^>]*data-background-image="([^"]+)"/);
  if (firstSectionMatch) {
    return firstSectionMatch[1];
  }

  // Try to find any image in first section
  const firstImgMatch = slidesHtml.match(/<section[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/);
  if (firstImgMatch) {
    return firstImgMatch[1];
  }

  return null;
}

function updateAssetPaths(slidesHtml, slug, assetsFolder) {
  let updated = slidesHtml;

  // Update src attributes
  updated = updated.replace(
    new RegExp(`src="${assetsFolder}/([^"]+)"`, 'g'),
    `src="/presentations/content/${slug}/assets/$1"`
  );

  // Update data-background-image attributes
  updated = updated.replace(
    new RegExp(`data-background-image="${assetsFolder}/([^"]+)"`, 'g'),
    `data-background-image="/presentations/content/${slug}/assets/$1"`
  );

  return updated;
}

function convertPresentation(sourcePath) {
  console.log(`\n📦 Converting presentation from: ${sourcePath}`);

  // 1. Read index.html
  const indexPath = path.join(sourcePath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: index.html not found in', sourcePath);
    process.exit(1);
  }

  const html = fs.readFileSync(indexPath, 'utf-8');

  // 2. Extract metadata
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Untitled Presentation';

  const bodyClassMatch = html.match(/<body class="([^"]+)"/);
  const bodyClass = bodyClassMatch ? bodyClassMatch[1] : '';
  const theme = extractTheme(bodyClass);

  const revealConfig = extractRevealConfig(html);

  // 3. Extract slides content
  const slidesHtml = extractSlidesContent(html);
  if (!slidesHtml) {
    console.error('❌ Error: Could not extract slides content');
    process.exit(1);
  }

  // 4. Find assets folder
  const items = fs.readdirSync(sourcePath);
  const assetsFolders = items.filter(item => {
    const itemPath = path.join(sourcePath, item);
    return fs.statSync(itemPath).isDirectory() && item !== 'lib';
  });

  const assetsFolder = assetsFolders.length > 0 ? assetsFolders[0] : null;

  // 5. Generate slug
  const slug = generateSlug(path.basename(sourcePath));

  console.log(`📝 Title: ${title}`);
  console.log(`🔖 Slug: ${slug}`);
  console.log(`🎨 Theme: ${theme.font} / ${theme.color}`);
  console.log(`📁 Assets folder: ${assetsFolder || 'none'}`);

  // 6. Create target directory
  const targetDir = path.join(process.cwd(), 'public', 'presentations', 'content', slug);
  fs.mkdirSync(targetDir, { recursive: true });

  // 7. Extract thumbnail before updating paths
  const thumbnail = extractThumbnail(slidesHtml, slug);

  // 8. Update asset paths in slides HTML
  let updatedSlidesHtml = slidesHtml;
  if (assetsFolder) {
    updatedSlidesHtml = updateAssetPaths(slidesHtml, slug, assetsFolder);
  }

  // Get the updated thumbnail path (after asset path transformation)
  const thumbnailPath = thumbnail ? extractThumbnail(updatedSlidesHtml, slug) : null;

  // 9. Save slides.html
  const slidesPath = path.join(targetDir, 'slides.html');
  fs.writeFileSync(slidesPath, updatedSlidesHtml);
  console.log(`✅ Created: ${slidesPath}`);

  // 10. Create metadata.json
  const metadata = {
    title,
    slug,
    description: '', // To be filled manually
    date: new Date().toISOString().split('T')[0],
    tags: [],
    thumbnail: thumbnailPath,
    theme,
    revealConfig: {
      width: revealConfig.width || 960,
      height: revealConfig.height || 700,
      margin: revealConfig.margin || 0.05,
      controls: revealConfig.controls !== false,
      progress: revealConfig.progress !== false,
      center: revealConfig.center || false,
      transition: revealConfig.transition || 'slide',
      backgroundTransition: revealConfig.backgroundTransition || 'slide',
      // Required for Reveal to sync to slide 0 on initialize() — without it,
      // Reveal sets up but never marks any <section> as .present, leaving a
      // blank deck until something else (e.g. a manual Reveal.slide() call)
      // forces navigation to a slide.
      hash: revealConfig.hash !== false,
    },
  };

  const metadataPath = path.join(targetDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Created: ${metadataPath}`);
  if (thumbnailPath) {
    console.log(`🖼️  Thumbnail: ${thumbnailPath}`);
  }

  // 11. Copy assets
  if (assetsFolder) {
    const sourceAssetsPath = path.join(sourcePath, assetsFolder);
    const targetAssetsPath = path.join(targetDir, 'assets');

    fs.cpSync(sourceAssetsPath, targetAssetsPath, { recursive: true });
    console.log(`✅ Copied assets: ${targetAssetsPath}`);
  }

  console.log(`\n✨ Conversion complete! Presentation available at:`);
  console.log(`   /presentations/${slug}`);
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/convert-presentation.js <path-to-slides-folder>');
  console.error('Example: node scripts/convert-presentation.js ./slides-backup/slides_flutter-101');
  process.exit(1);
}

const sourcePath = args[0];
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Directory not found: ${sourcePath}`);
  process.exit(1);
}

convertPresentation(sourcePath);
