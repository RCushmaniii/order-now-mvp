# setup-order-now.ps1
# 🛠️ Windsurf AI MVP Project Bootstrap Script
# Assumes you're in: C:\Users\Robert Cushman\.vscode\Projects

# Step 1: Create and enter the project folder
$projectRoot = "C:\Users\Robert Cushman\.vscode\Projects\order-now-mvp"
New-Item -ItemType Directory -Force -Path $projectRoot
Set-Location $projectRoot

# Step 2: Scaffold with Vite (React + TS)
npm create vite@latest . -- --template react-ts

# Step 3: Install base dependencies
npm install

# Step 4: Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Step 5: Update tailwind.config.ts
(Get-Content "tailwind.config.ts") -replace 'content: \[\]', 'content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]' | Set-Content "tailwind.config.ts"

# Step 6: Add Tailwind directives to index.css
Set-Content -Path ".\src\index.css" -Value "@tailwind base;`n@tailwind components;`n@tailwind utilities;"

# Step 7: Install Supabase CLI (local-only)
npm install --save-dev supabase

# Step 8: ESLint + Prettier setup
npm install -D prettier eslint eslint-config-prettier eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Step 9: Create .gitignore
Set-Content ".gitignore" @"
node_modules
dist
.env
.DS_Store
.vscode
"@

# Step 10: Initialize Git
git init

# Done 🎉
Write-Host "`n✅ Windsurf AI project setup complete!" -ForegroundColor Green
Write-Host "`n🚀 To start your dev server, run:" -ForegroundColor Cyan
Write-Host "   cd '$projectRoot'" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
