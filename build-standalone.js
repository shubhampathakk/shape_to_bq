#!/usr/bin/env node

// Standalone build script for deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Shapefile to BigQuery application...');

try {
  // Build the client (frontend)
  console.log('Building frontend...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Build the server (backend)
  console.log('Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  console.log('Build completed successfully!');
  console.log('Generated files:');
  console.log('- client/dist/ (frontend static files)');
  console.log('- dist/index.js (backend server)');
  console.log('');
  console.log('Ready for deployment with: gcloud app deploy app.yaml');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}