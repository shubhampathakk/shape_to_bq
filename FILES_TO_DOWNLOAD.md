# Files Required for Google Cloud App Engine Deployment

Download all these files and maintain the folder structure:

## Root Directory Files
- `package.json` - Dependencies and scripts
- `app.yaml` - App Engine configuration
- `.gcloudignore` - Files to exclude from deployment
- `build.js` - Build script
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui configuration

## Source Code Directories (Complete folders)
- `server/` - All backend code
  - `server/index.ts`
  - `server/routes.ts`
  - `server/storage.ts`
  - `server/vite.ts`

- `client/` - All frontend code
  - `client/src/` (entire folder with all subfolders)
  - `client/index.html`

- `shared/` - Shared type definitions
  - `shared/schema.ts`

## Build Process
1. Run `npm install` to install dependencies
2. Run the custom build script (see build-standalone.js below)
3. Deploy with `gcloud app deploy app.yaml`

## Note
The `npm run build` command refers to scripts in package.json which you have in your downloaded files. The error suggests either:
1. You're not in the correct directory with package.json
2. Some files are missing

Make sure you download ALL files and maintain the exact folder structure shown above.