#!/usr/bin/env node

/**
 * Map actual images from storage to rental objects
 * This script updates rental-objects-comprehensive.json with real image paths
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Name pattern mapping: rental object name patterns -> storage folder
const NAME_TO_FOLDER_MAPPING = {
  'Fotballbane': 'lokaler-og-baner',
  'Tennisbane': 'lokaler-og-baner',
  'Svømmehall': 'Svømmehall',
  'Gymnastikksal': 'Gymsal',
  'Basketballbane': 'lokaler-og-baner',
  'Volleyballbane': 'lokaler-og-baner',
  'Badmintonhall': 'Idrettshaller',
  'Håndballbane': 'lokaler-og-baner',
  'Ishall': 'Idrettshaller',
  'Idrettshall': 'Idrettshaller',
  'Møterom': 'Møterom og kursrom',
  'Duker og Stoler': 'utstyr',
  'Lydutstyr': 'utstyr',
  'Projektorer': 'utstyr',
  'Telt': 'utstyr',
  'Fotballutstyr': 'utstyr',
  'Arrangementssted': 'Selskapslokaler',
  'Bibliotek': 'Bibliotek',
  'Kulturhus': 'Kulturhus',
  'Grendehus': 'Grendehus og sammfunnshus',
};

// Function to determine folder from rental object name
function getFolderFromName(name) {
  for (const [pattern, folder] of Object.entries(NAME_TO_FOLDER_MAPPING)) {
    if (name.includes(pattern)) {
      return folder;
    }
  }
  return null;
}

// Paths
const SEED_FILE = path.join(__dirname, '../domain/rental-objects-comprehensive.json');
const STORAGE_DIR = path.join(__dirname, '../storage/seed-images');

// Read seed data
console.log('📖 Reading rental objects seed data...');
const seedData = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));

// Get images from storage folders
console.log('📁 Scanning storage folders...');
const imagesByFolder = {};

// Get all unique folders from mapping
const uniqueFolders = [...new Set(Object.values(NAME_TO_FOLDER_MAPPING))];

uniqueFolders.forEach(storageFolder => {
  const folderPath = path.join(STORAGE_DIR, storageFolder);
  
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath)
      .filter(file => /\.(jpg|jpeg|png|webp|avif)$/i.test(file))
      .map(file => `/storage/seed-images/${storageFolder}/${file}`);
    
    imagesByFolder[storageFolder] = files;
    console.log(`  ✓ ${storageFolder}: ${files.length} images`);
  } else {
    console.log(`  ⚠ ${storageFolder}: folder not found`);
    imagesByFolder[storageFolder] = [];
  }
});

// Update rental objects with real images
console.log('\n🖼️  Mapping images to rental objects...');
let updatedCount = 0;
let skippedCount = 0;

seedData.rental_objects.forEach((obj, index) => {
  const folder = getFolderFromName(obj.name);
  const availableImages = folder ? imagesByFolder[folder] : [];
  
  if (!folder || availableImages.length === 0) {
    console.log(`  ⚠ No images for: ${obj.name} (folder: ${folder || 'not found'})`);
    skippedCount++;
    return;
  }
  
  // Assign 3 images per rental object (cycling through available images)
  const startIndex = (index * 3) % availableImages.length;
  const selectedImages = [];
  
  for (let i = 0; i < 3; i++) {
    const imgIndex = (startIndex + i) % availableImages.length;
    selectedImages.push(availableImages[imgIndex]);
  }
  
  // Update images array
  obj.images = selectedImages.map((url, idx) => ({
    url,
    alt: `${obj.name} - bilde ${idx + 1}`,
    thumbnail: url,
    is_primary: idx === 0,
    sort_order: idx + 1
  }));
  
  updatedCount++;
});

// Update metadata
seedData.meta.description = 'Comprehensive seed data for Digilist Platform - WITH REAL IMAGES';
seedData.meta.version = '1.1.0';
seedData.meta.created = new Date().toISOString();

// Write updated data
console.log(`\n💾 Writing updated seed data...`);
fs.writeFileSync(SEED_FILE, JSON.stringify(seedData, null, 2), 'utf-8');

console.log(`\n✅ Complete!`);
console.log(`   Updated: ${updatedCount} rental objects with real images`);
console.log(`   Skipped: ${skippedCount} rental objects (no matching images)`);
console.log(`   File: ${SEED_FILE}`);
