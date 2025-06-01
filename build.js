#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for Google Cloud App Engine...');

// Build the client
console.log('Building client...');
execSync('npm run build', { stdio: 'inherit' });

// Create production package.json
const productionPackage = {
  "name": "shapefile-to-bigquery",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "20"
  },
  "scripts": {
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@google-cloud/bigquery": "^8.1.0",
    "express": "^4.21.2",
    "multer": "^2.0.0",
    "nanoid": "^5.1.5",
    "shpjs": "^6.1.0",
    "zod": "^3.24.2"
  }
};

// Write production package.json
fs.writeFileSync('package-prod.json', JSON.stringify(productionPackage, null, 2));

console.log('Build complete! Ready for deployment.');
console.log('Generated files:');
console.log('- client/dist/ (static files)');
console.log('- dist/index.js (server bundle)');
console.log('- package-prod.json (production dependencies)');