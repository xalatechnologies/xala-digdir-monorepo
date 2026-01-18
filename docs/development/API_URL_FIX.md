# 🔧 **QUICK FIX - USE LOCAL API**

The apps are pointing to production API. Here's how to use your local API:

## ⚡ **Option 1: Update .env Files (Recommended)**

Create `.env.local` in each app:

```bash
# Web
echo "VITE_API_URL=http://localhost:3001" > apps/web/.env.local

# Backoffice  
echo "VITE_API_URL=http://localhost:3001" > apps/backoffice/.env.local

# Min Side
echo "VITE_API_URL=http://localhost:3001" > apps/minside/.env.local

# SaaS Admin
echo "VITE_API_URL=http://localhost:3001" > apps/saas-admin/.env.local

# Tenant Admin
echo "VITE_API_URL=http://localhost:3001" > apps/tenant-admin/.env.local
```

Then rebuild:
```bash
pnpm build
docker-compose restart web backoffice minside saas-admin tenant-admin
```

## ⚡ **Option 2: Start Local API & Use Production Frontend**

The frontends are connecting to `api.digilist.no`. If you want to use them as-is:

1. Make sure your production API is running
2. Or deploy the API to production
3. Or use the local development servers instead of Docker

## 🚀 **Recommended: Local Dev Setup**

Instead of Docker, run everything locally:

```bash
# Terminal 1: Start API
cd apps/api
pnpm dev

# Terminal 2: Start Web
cd apps/web  
pnpm dev

# Terminal 3: Start Backoffice
cd apps/backoffice
pnpm dev
```

This way they'll auto-connect to localhost:3001

**Which option do you prefer?**
