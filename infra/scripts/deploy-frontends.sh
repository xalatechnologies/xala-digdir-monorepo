#!/bin/bash
set -e

# Deploy Frontend Applications to Test Environment
# This script deploys backoffice, minside, and web apps with cache clearing

SERVER="root@72.61.23.56"
APPS=("backoffice" "minside" "web")

echo "🚀 Deploying Frontend Applications to Test Environment"
echo "========================================================"

# Deploy each app
for APP in "${APPS[@]}"; do
    echo ""
    echo "📦 Deploying $APP..."
    
    # Check if dist folder exists
    if [ ! -d "apps/$APP/dist" ]; then
        echo "❌ Error: apps/$APP/dist not found. Run 'pnpm -F @xala/$APP build' first."
        exit 1
    fi
    
    # Determine target directory
    case $APP in
        "backoffice")
            TARGET="/var/www/backoffice-test.digilist.no"
            ;;
        "minside")
            TARGET="/var/www/minside-test.digilist.no"
            ;;
        "web")
            TARGET="/var/www/web-test.digilist.no"
            ;;
    esac
    
    # Deploy with rsync
    echo "   Syncing files to $TARGET..."
    rsync -avz --delete "apps/$APP/dist/" "$SERVER:$TARGET/"
    
    echo "   ✅ $APP deployed"
done

echo ""
echo "🔄 Clearing caches and restarting services..."

# Clear Nginx cache and reload
ssh $SERVER "rm -rf /var/cache/nginx/* && nginx -s reload"
echo "   ✅ Nginx cache cleared and reloaded"

# Restart PM2 processes (API)
ssh $SERVER "pm2 restart all"
echo "   ✅ PM2 processes restarted"

echo ""
echo "✅ Deployment Complete!"
echo "========================================================"
echo "🌐 URLs:"
echo "   - Backoffice: https://backoffice-test.digilist.no"
echo "   - Minside:    https://minside-test.digilist.no"
echo "   - Web:        https://web-test.digilist.no"
echo ""
echo "⚠️  Remember to hard refresh (Cmd+Shift+R) in your browser!"
