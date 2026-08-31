#!/usr/bin/env node

/**
 * Thumbnail Generation Script
 *
 * Extracts first slide background image as thumbnail for each presentation
 * Updates metadata.json with thumbnail information
 */

const fs = require('fs');
const path = require('path');

function extractFirstSlideBackground(slidesHtml) {
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

function updatePresentationThumbnail(slug) {
  const contentDir = path.join(process.cwd(), 'public', 'presentations', 'content', slug);
  const metadataPath = path.join(contentDir, 'metadata.json');
  const slidesPath = path.join(contentDir, 'slides.html');

  if (!fs.existsSync(metadataPath) || !fs.existsSync(slidesPath)) {
    console.log(`⚠️  Skipping ${slug}: Missing files`);
    return;
  }

  // Read slides
  const slidesHtml = fs.readFileSync(slidesPath, 'utf-8');
  const thumbnail = extractFirstSlideBackground(slidesHtml);

  // Read metadata
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  // Update thumbnail
  metadata.thumbnail = thumbnail || `/presentations/content/${slug}/assets/default-thumb.png`;

  // Write back
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`✅ ${slug}: ${thumbnail ? 'Found thumbnail' : 'Using default'}`);
}

function generateAllThumbnails() {
  const contentDir = path.join(process.cwd(), 'public', 'presentations', 'content');

  if (!fs.existsSync(contentDir)) {
    console.error('❌ Content directory not found');
    process.exit(1);
  }

  const presentations = fs.readdirSync(contentDir).filter(item => {
    const itemPath = path.join(contentDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`📸 Generating thumbnails for ${presentations.length} presentations...\n`);

  presentations.forEach(slug => {
    updatePresentationThumbnail(slug);
  });

  console.log(`\n✨ Thumbnail generation complete!`);
}

// Main execution
generateAllThumbnails();
