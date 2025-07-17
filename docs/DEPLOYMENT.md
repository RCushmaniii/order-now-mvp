Absolutely! Here's a **clean, complete, and professional `DEPLOY.md`** tailored for a project running on **Windows 11 / PowerShell** for both **development** and **production**, and structured with best practices.

---

# 🚀 DEPLOY.md

## 📦 Project Deployment Guide (Windows 11 / PowerShell)

This document provides step-by-step instructions for running the project in both **development** and **production** environments using **PowerShell on Windows 11**.

---

## ✅ Prerequisites

Ensure the following tools are installed and accessible from your terminal:

* [Node.js (v18+)](https://nodejs.org/)
* [npm](https://www.npmjs.com/)
* Git (optional but recommended)
* Code editor (e.g., VS Code)

---

## 📁 Project Setup

1. **Clone the repository:**

   ```powershell
   git clone https://github.com/your-org/your-project.git
   cd your-project
   ```

2. **Install dependencies:**

   ```powershell
   npm install
   ```

3. **Set up your environment files:**

   * Copy and customize the `.env.example` file:

     ```powershell
     Copy-Item .env.example .env.development
     ```

   * Or set up `.env.production` manually for production builds.

---

## 🧪 Local Development

To start the app in **development mode** with live reloading:

```powershell
$env:NODE_ENV = "development"
npm run dev
```

* This will use `.env.development` by default (if supported by your tooling).
* The frontend should be available at `http://localhost:3000` (or configured port).

---

## 🚀 Production Build & Run

To build and run the app in **production mode**:

```powershell
$env:NODE_ENV = "production"
npm run build
npm run start
```

* This runs a production-optimized build.
* You can deploy the build output (`dist/`, `build/`, or your target directory) to your hosting service or server.

---

## ⚙️ Environment Variables

Use different `.env` files for each environment:

| File               | Purpose                    |
| ------------------ | -------------------------- |
| `.env.development` | Local development          |
| `.env.production`  | Production deployment      |
| `.env.local`       | Machine-specific overrides |
| `.env.example`     | Safe template (committed)  |

### Required Environment Variables

#### Stripe Payment Integration
```bash
# Stripe Configuration (Required for payment processing)
VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# For production, use live keys:
# VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY=pk_live_your_live_key_here
```

**Important Notes:**
- Stripe keys must start with `pk_test_` (sandbox) or `pk_live_` (production)
- The app will validate the key format on startup and show errors if invalid
- Missing or invalid Stripe keys will prevent payment processing
- Environment variables prefixed with `VITE_` are exposed to the frontend

### Security Best Practices

Your `.gitignore` should include:

```gitignore
.env
.env.*
!.env.example
```

---

## 📌 Notes

* Environment variables prefixed with `VITE_` (or `NEXT_PUBLIC_`, etc.) are **exposed to the frontend**.
* Backend-only secrets should **never** include these prefixes.
* For CI/CD (e.g. Netlify, Vercel, GitHub Actions), set environment variables in the project dashboard or CI environment directly — do not commit `.env.production` with secrets.

---
Here you go — the section fully formatted in **Markdown (`.md`)** syntax:

````markdown
## 🔄 Testing Netlify Functions Locally

Use the **Netlify CLI** to emulate the production server locally and test your serverless functions.

### ✅ Option 1: If Netlify CLI is in your `PATH`

```powershell
netlify dev
````

This will start the Netlify dev environment using your local configuration.

---

### 🛠️ Option 2: If Netlify CLI is **not** in your `PATH`

Use the full path to the CLI executable (customized for your user profile):

```powershell
& "C:\Users\Robert Cushman\AppData\Roaming\npm\netlify.cmd" dev
```

> The `&` operator is required in PowerShell to run a command from a quoted path (especially if the path contains spaces).

---

### 🌱 Optionally Set the Environment First

You can set the `NODE_ENV` before starting Netlify in development mode:

```powershell
$env:NODE_ENV = "development"
& "C:\Users\Robert Cushman\AppData\Roaming\npm\netlify.cmd" dev
```


---

## 🆘 Troubleshooting

* If you see missing environment variable errors:

  * Confirm the correct `.env` file exists and is loaded.
  * Double-check you are using the right `NODE_ENV`.
* Restart PowerShell if environment variable changes aren’t taking effect.

---
