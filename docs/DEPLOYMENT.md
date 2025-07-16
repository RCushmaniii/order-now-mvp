# 🚀 YapaNow Deployment Guide

> **Status**: ✅ Production Ready  
> **Last Updated**: January 2025  
> **Deployment Platform**: Netlify  
> **Build Time**: ~3-5 minutes  

## 📋 Table of Contents

- [Quick Deployment](#quick-deployment)
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [Netlify Deployment](#netlify-deployment)
- [Domain Configuration](#domain-configuration)
- [Environment Variables](#environment-variables)
- [Build Optimization](#build-optimization)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## ⚡ Quick Deployment

**For experienced developers - get deployed in 5 minutes:**

```bash
# 1. Clone and install
git clone <your-repo-url>
cd order-now-mvp
npm install

# 2. Build and test locally
npm run build
npm run preview

# 3. Deploy to Netlify
# Push to main branch (auto-deploys) OR
netlify deploy --prod

# 4. Configure environment variables in Netlify dashboard
# 5. Set up custom domain (optional)
```

**Live URL**: `https://yapanow.netlify.app`

## 🛠️ Prerequisites

### **Required Accounts**
- [ ] **GitHub Account** (for source code hosting)
- [ ] **Netlify Account** (for deployment and hosting)
- [ ] **Domain Registrar** (optional - for custom domain)

### **Development Tools**
- [ ] **Node.js 18+** installed locally
- [ ] **Git** configured with your GitHub account
- [ ] **VS Code** or preferred editor
- [ ] **Terminal/PowerShell** access

### **Project Requirements**
- [ ] **React 19** with TypeScript
- [ ] **Vite 7** as build tool
- [ ] **Tailwind CSS** for styling
- [ ] **Netlify Functions** for serverless backend

## 💻 Development Setup

### **1. Local Development Environment**

```bash
# Clone the repository
git clone https://github.com/your-username/order-now-mvp.git
cd order-now-mvp

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **2. Verify Local Build**

```bash
# Build the project
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit
```

### **3. Test All Features**

- [ ] **Homepage** loads correctly
- [ ] **Store directory** displays businesses
- [ ] **Order flow** works end-to-end
- [ ] **Payment integration** (Stripe sandbox)
- [ ] **WhatsApp integration** (if implemented)
- [ ] **Mobile responsiveness**

## ⚙️ Environment Configuration

### **Local Environment (.env)**

```env
# Application Configuration
VITE_APP_NAME="YapaNow"
VITE_APP_URL="http://localhost:5173"

# Supabase Configuration (Future)
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
VITE_STRIPE_SANDBOX_PUBLISHABLE_KEY="pk_test_..."

# Stripe Server-side (Netlify Functions)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_SANDBOX_SECRET_KEY="sk_test_..."

# WhatsApp Integration (Optional)
VITE_WHATSAPP_API_BASE_URL="https://graph.facebook.com/v18.0"
VITE_WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_access_token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_verify_token"

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### **Production Environment Variables**

These will be configured in Netlify dashboard:

```env
# Production URLs
VITE_APP_URL="https://yapanow.netlify.app"

# Production Stripe Keys
STRIPE_SECRET_KEY="sk_live_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Production WhatsApp
WHATSAPP_ACCESS_TOKEN="production_token"

# Security
NODE_ENV="production"
```

## 🌐 Netlify Deployment

### **Method 1: Git Integration (Recommended)**

1. **Connect Repository to Netlify**
   ```
   Netlify Dashboard → New Site from Git → GitHub
   → Select Repository: order-now-mvp
   ```

2. **Configure Build Settings**
   ```
   Base Directory: (leave empty)
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Deploy Settings**
   ```
   Production Branch: main
   Auto-publish: ✅ Enabled
   Branch Deploys: ✅ Enabled for all branches
   ```

4. **Auto-Deploy Setup**
   - Every push to `main` branch triggers production deployment
   - Pull requests create preview deployments
   - Deploy status visible in GitHub commits

### **Method 2: Manual Deployment**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy to production
netlify deploy --prod --dir=dist

# OR deploy for testing first
netlify deploy --dir=dist
```

### **Method 3: Drag & Drop**

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Go to Netlify dashboard
   - Drag `dist` folder to deployment area
   - Wait for deployment to complete

## 🌍 Domain Configuration

### **Using Netlify Subdomain (Free)**

Your site is automatically available at:
```
https://[random-name].netlify.app

# You can customize the subdomain:
Site Settings → Domain Management → Options → Edit Site Name
→ https://yapanow.netlify.app
```

### **Custom Domain Setup**

1. **Purchase Domain** (Recommended providers)
   - **Namecheap** (affordable, good support)
   - **Google Domains** (easy integration)
   - **Cloudflare** (advanced features)

2. **Configure DNS in Netlify**
   ```
   Site Settings → Domain Management → Add Custom Domain
   → Enter: yapanow.com
   ```

3. **Update DNS Records**
   ```
   # Add these records in your domain registrar:
   Type: CNAME
   Name: www
   Value: yapanow.netlify.app

   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify IP)
   ```

4. **SSL Certificate**
   ```
   Netlify automatically provisions Let's Encrypt SSL
   Available within 24 hours of DNS propagation
   ```

### **Domain Examples**
- **Production**: `https://yapanow.com`
- **Staging**: `https://staging.yapanow.com`
- **Development**: `https://dev-yapanow.netlify.app`

## 🔑 Environment Variables

### **Setting Variables in Netlify**

1. **Navigate to Site Settings**
   ```
   Netlify Dashboard → [Your Site] → Site Settings → Environment Variables
   ```

2. **Add Production Variables**
   ```
   Key: STRIPE_SECRET_KEY
   Value: sk_live_...
   Scope: All Deploys ✅
   
   Key: WHATSAPP_ACCESS_TOKEN
   Value: [production_token]
   Scope: Production ✅
   
   Key: NODE_ENV
   Value: production
   Scope: Production ✅
   ```

3. **Add Development Variables**
   ```
   Key: STRIPE_SECRET_KEY
   Value: sk_test_...
   Scope: Branch Deploys ✅
   ```

### **Environment Variable Security**

- [ ] **Never commit** `.env` files to Git
- [ ] **Use different keys** for development/production
- [ ] **Rotate secrets** regularly
- [ ] **Limit variable scope** (production vs all deploys)
- [ ] **Audit access** regularly

### **Required Variables Checklist**

**Essential (Required for basic functionality):**
- [ ] `VITE_APP_URL`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`

**WhatsApp Integration:**
- [ ] `WHATSAPP_ACCESS_TOKEN`
- [ ] `WHATSAPP_PHONE_NUMBER_ID`
- [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

**Analytics (Optional):**
- [ ] `VITE_GOOGLE_ANALYTICS_ID`

## 🏗️ Build Optimization

### **Vite Configuration (vite.config.ts)**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@headlessui/react']
        }
      }
    }
  },
  
  // Development optimizations
  server: {
    port: 5173,
    host: true
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    host: true
  }
})
```

### **Package.json Scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "deploy": "npm run build && netlify deploy --prod"
  }
}
```

### **Performance Optimizations**

1. **Code Splitting**
   ```typescript
   // Lazy load pages
   const OrderPage = lazy(() => import('./pages/OrderPage'));
   const MarketingPage = lazy(() => import('./pages/MarketingPage'));
   ```

2. **Image Optimization**
   ```typescript
   // Use modern formats
   <img src="image.webp" alt="..." loading="lazy" />
   ```

3. **Bundle Analysis**
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   npm run build
   # Check dist/stats.html for bundle size analysis
   ```

## 📊 Monitoring & Analytics

### **Netlify Analytics**

1. **Enable Analytics**
   ```
   Site Dashboard → Analytics → Enable Analytics
   ```

2. **Key Metrics to Monitor**
   - **Page Views**: Track popular pages
   - **Unique Visitors**: User engagement
   - **Bandwidth Usage**: Hosting costs
   - **Top Pages**: Most visited content
   - **Referrers**: Traffic sources

### **Google Analytics (Optional)**

1. **Setup GA4**
   ```typescript
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

2. **Track Events**
   ```typescript
   // Track order completion
   gtag('event', 'purchase', {
     transaction_id: orderId,
     value: totalAmount,
     currency: 'MXN'
   });
   ```

### **Error Monitoring**

1. **Netlify Function Logs**
   ```
   Netlify Dashboard → Functions → [Function Name] → View Logs
   ```

2. **Browser Console Monitoring**
   ```typescript
   // Global error handler
   window.addEventListener('error', (event) => {
     console.error('Global error:', event.error);
     // Send to monitoring service
   });
   ```

3. **Performance Monitoring**
   ```typescript
   // Web Vitals tracking
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## 🔧 Troubleshooting

### **Common Deployment Issues**

#### **1. Build Failures**

**Symptoms**: Deployment fails during build
```bash
# Check build locally first
npm run build

# Common fixes:
- Fix TypeScript errors
- Update Node.js version in netlify.toml
- Check for missing dependencies
```

**Solution**:
```toml
# netlify.toml
[build]
  node_version = "18"
  command = "npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18.17.0"
```

#### **2. Environment Variable Issues**

**Symptoms**: App works locally but fails in production
```bash
# Debug steps:
1. Check Netlify environment variables
2. Verify variable names (VITE_ prefix for client-side)
3. Check variable scoping (production vs all deploys)
4. Redeploy after adding variables
```

#### **3. Function Deployment Issues**

**Symptoms**: Netlify functions return 404 or 500 errors
```bash
# Check function syntax:
netlify functions:list
netlify functions:logs [function-name]

# Common fixes:
- Ensure .mjs extension for ES modules
- Check function export format
- Verify environment variables for functions
```

#### **4. Domain/SSL Issues**

**Symptoms**: Domain not working or SSL errors
```bash
# Check DNS propagation:
dig yapanow.com
nslookup yapanow.com

# Verify SSL certificate:
openssl s_client -servername yapanow.com -connect yapanow.com:443
```

### **Performance Issues**

#### **Slow Loading Times**

1. **Check Bundle Size**
   ```bash
   npm run build
   # Look for large files in dist/
   ```

2. **Optimize Images**
   ```bash
   # Compress images before deployment
   # Use WebP format when possible
   # Implement lazy loading
   ```

3. **Enable Compression**
   ```toml
   # netlify.toml
   [[headers]]
     for = "/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000"
   ```

## 🔄 Rollback Procedures

### **Immediate Rollback (Emergency)**

1. **Netlify Dashboard Rollback**
   ```
   Site Dashboard → Deploys → [Previous Deploy] → Publish Deploy
   ```

2. **Git Revert and Redeploy**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   # Auto-deploys reverted version
   ```

3. **Manual Override**
   ```bash
   # Deploy specific commit
   git checkout [previous-commit-hash]
   netlify deploy --prod
   ```

### **Planned Rollback**

1. **Staging Deployment**
   ```bash
   # Deploy to staging first
   netlify deploy --alias staging
   # Test thoroughly
   # Deploy to production when ready
   netlify deploy --prod
   ```

2. **Branch-based Deployment**
   ```bash
   # Create rollback branch
   git checkout -b rollback-v1.2.0
   git cherry-pick [stable-commit]
   git push origin rollback-v1.2.0
   # Deploy from branch in Netlify
   ```

## 📋 Deployment Checklist

### **Pre-Deployment**
- [ ] **Code Review**: All changes reviewed and approved
- [ ] **Local Testing**: All features work locally
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **Lint Check**: `npm run lint` passes
- [ ] **Type Check**: `npx tsc --noEmit` passes
- [ ] **Environment Variables**: All required variables configured

### **Deployment**
- [ ] **Backup**: Current version backed up/tagged
- [ ] **Deploy**: Changes pushed to main branch
- [ ] **Build Status**: Netlify build completes successfully
- [ ] **DNS**: Domain resolves correctly
- [ ] **SSL**: HTTPS certificate active

### **Post-Deployment**
- [ ] **Smoke Test**: Critical paths work on production
- [ ] **Function Test**: All Netlify functions respond
- [ ] **Performance**: Page load times acceptable
- [ ] **Analytics**: Tracking working correctly
- [ ] **Monitoring**: Error monitoring active
- [ ] **Documentation**: Deployment notes updated

## 🎯 Deployment Best Practices

### **Version Management**
```bash
# Tag releases
git tag v1.0.0
git push origin v1.0.0

# Semantic versioning
1.0.0 - Major release
1.1.0 - Minor features
1.1.1 - Bug fixes
```

### **Branch Strategy**
```
main        - Production deployments
develop     - Integration branch
feature/*   - Feature development
hotfix/*    - Emergency fixes
```

### **Security Practices**
- [ ] **HTTPS Only**: Force SSL redirect
- [ ] **Security Headers**: CSP, HSTS configured
- [ ] **API Keys**: Rotate regularly
- [ ] **Dependencies**: Keep updated
- [ ] **Audit**: Regular security audits

---

## 🎉 Deployment Complete!

Your YapaNow platform is now live and ready to serve customers! 🚀

**Production URL**: `https://yapanow.netlify.app`

For ongoing maintenance, monitor:
- Performance metrics
- Error logs  
- User feedback
- Security updates

Need help? Check our [troubleshooting guide](#troubleshooting) or contact the development team.