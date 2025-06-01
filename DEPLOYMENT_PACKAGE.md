# Complete Deployment Package

Download these files and maintain the exact folder structure:

## Root Files (download to project root)
```
shapefile-bigquery/
├── package.json
├── app.yaml
├── .gcloudignore
├── build-standalone.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json
└── DEPLOYMENT_GUIDE.md
```

## Server Directory (server/)
```
server/
├── index.ts
├── routes.ts
├── storage.ts
└── vite.ts
```

## Client Directory (client/)
```
client/
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── data-preview.tsx
    │   ├── file-upload-zone.tsx
    │   ├── schema-editor.tsx
    │   ├── upload-progress.tsx
    │   └── ui/ (entire folder with all UI components)
    ├── hooks/
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── lib/
    │   ├── bigquery.ts
    │   ├── queryClient.ts
    │   └── utils.ts
    └── pages/
        ├── not-found.tsx
        └── upload.tsx
```

## Shared Directory (shared/)
```
shared/
└── schema.ts
```

## Build and Deploy Steps

1. **Download all files** maintaining the folder structure above

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the application:**
   ```bash
   node build-standalone.js
   ```

4. **Deploy to Google Cloud:**
   ```bash
   gcloud app deploy app.yaml
   ```

## Alternative Build Method

If `build-standalone.js` doesn't work, you can build manually:

```bash
# Build frontend
npx vite build

# Build backend
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

## Important Notes

- Make sure you download ALL files, especially the complete `client/src/components/ui/` folder
- Maintain the exact folder structure
- Run `npm install` first to install dependencies
- The `package.json` file contains all the necessary dependencies and build scripts