#!/bin/bash
# =============================================================================
# Deployment Script for Xala Apps to Hostinger VPS (Test Environment)
# Usage: ./scripts/deploy.sh [web|backoffice|minside|saas-admin|tenant-admin|all]
#
# Directory Structure on Server:
# /var/www/
#   ├── digilist/
#   │   ├── main/           → https://digilist.no (landing page)
#   │   ├── web/            → https://web-test.digilist.no
#   │   ├── backoffice/     → https://backoffice-test.digilist.no
#   │   ├── minside/        → https://minside-test.digilist.no
#   │   ├── saas-admin/     → https://saas-admin.digilist.no
#   │   └── tenant-admin/   → https://tenant-admin.digilist.no
#   └── digilist-api/       → https://api.digilist.no
#
# IMPORTANT: Apps deploy to /var/www/digilist/{web,backoffice,minside,saas-admin,tenant-admin}
#            NOT to /var/www/{web-test,backoffice-test,minside-test,saas-admin-test,tenant-admin-test}
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print status (define early)
print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load deployment configuration
if [ -f "$SCRIPT_DIR/deploy-config.sh" ]; then
    source "$SCRIPT_DIR/deploy-config.sh"
else
    print_error "deploy-config.sh not found!"
    echo "Please copy deploy-config.example.sh to deploy-config.sh and update values."
    exit 1
fi

# Load credentials from .env.production
if [ -f "$PROJECT_ROOT/.env.production" ]; then
    print_status "Loading credentials from .env.production..."

    # Export SSH credentials
    export HOSTINGER_HOST=$(grep -E "^SERVER_HOST=" "$PROJECT_ROOT/.env.production" | cut -d '=' -f2)
    export HOSTINGER_PORT=$(grep -E "^SERVER_PORT=" "$PROJECT_ROOT/.env.production" | cut -d '=' -f2)
    export HOSTINGER_USER=$(grep -E "^SERVER_USER=" "$PROJECT_ROOT/.env.production" | cut -d '=' -f2)

    # Verify credentials are loaded
    if [ -z "$HOSTINGER_HOST" ] || [ -z "$HOSTINGER_PORT" ] || [ -z "$HOSTINGER_USER" ]; then
        print_error "Failed to load SSH credentials from .env.production"
        echo "Required variables: SERVER_HOST, SERVER_PORT, SERVER_USER"
        exit 1
    fi

    print_success "Loaded SSH credentials: $HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PORT"
else
    print_error ".env.production not found!"
    echo "Please create .env.production with SSH credentials (SERVER_HOST, SERVER_PORT, SERVER_USER)"
    exit 1
fi

# =============================================================================
# Safety Checks - Run before any deployment
# =============================================================================

# Check for duplicate Vite config files (prevents config conflicts)
check_duplicate_configs() {
    print_status "Checking for duplicate Vite configs..."
    
    for app in web backoffice minside saas-admin tenant-admin; do
        local js_config="$PROJECT_ROOT/apps/$app/vite.config.js"
        local ts_config="$PROJECT_ROOT/apps/$app/vite.config.ts"
        
        if [ -f "$js_config" ] && [ -f "$ts_config" ]; then
            print_warning "Duplicate configs found in $app - removing stale .js file"
            rm "$js_config"
        fi
    done
    
    print_success "Config check passed"
}

# Ensure theme CSS files exist in public folders
ensure_theme_files() {
    print_status "Ensuring theme CSS files are in public folders..."
    
    local theme_src="$PROJECT_ROOT/packages/ds-themes"
    
    for app in web backoffice minside saas-admin tenant-admin; do
        local theme_dir="$PROJECT_ROOT/apps/$app/public/themes"
        mkdir -p "$theme_dir"
        
        # Copy main theme
        if [ -f "$theme_src/generated/digilist.css" ]; then
            cp "$theme_src/generated/digilist.css" "$theme_dir/"
        else
            print_error "Missing: $theme_src/generated/digilist.css"
            exit 1
        fi
        
        # Copy extensions
        if [ -f "$theme_src/themes/digilist-extensions.css" ]; then
            cp "$theme_src/themes/digilist-extensions.css" "$theme_dir/"
        else
            print_warning "Missing: $theme_src/themes/digilist-extensions.css"
        fi
    done
    
    print_success "Theme files copied to all apps"
}

# Clear build caches to ensure fresh build
clear_caches() {
    print_status "Clearing build caches..."
    
    rm -rf "$PROJECT_ROOT/.turbo"
    rm -rf "$PROJECT_ROOT/node_modules/.cache"
    
    for app in web backoffice minside saas-admin tenant-admin; do
        rm -rf "$PROJECT_ROOT/apps/$app/.turbo"
        rm -rf "$PROJECT_ROOT/apps/$app/node_modules/.vite"
        rm -rf "$PROJECT_ROOT/apps/$app/dist"
    done
    
    print_success "Caches cleared"
}

# Validate build output for circular dependency warnings
validate_build() {
    local app_name=$1
    local build_output=$2
    
    if echo "$build_output" | grep -qi "circular"; then
        print_error "Circular chunk dependency detected in $app_name!"
        print_error "Please check vite.config.ts manualChunks configuration."
        exit 1
    fi
}

# =============================================================================
# Build Functions
# =============================================================================

# Function to build an app
build_app() {
    local app_name=$1
    print_status "Building $app_name..."
    
    cd "$PROJECT_ROOT"
    
    # Create production env file
    create_prod_env "$app_name"
    
    # Build the app and capture output
    local build_output
    build_output=$(pnpm --filter "@xala/$app_name" build 2>&1)
    echo "$build_output"
    
    # Validate no circular dependencies
    validate_build "$app_name" "$build_output"
    
    print_success "$app_name built successfully!"
}

# Function to create production .env file
create_prod_env() {
    local app_name=$1
    local env_file="$PROJECT_ROOT/apps/$app_name/.env.production"
    
    print_status "Creating production environment for $app_name..."
    
    cat > "$env_file" << EOF
# Production Environment - Auto-generated by deploy.sh
VITE_API_URL=${VITE_API_URL}
VITE_WS_URL=${VITE_WS_URL}
VITE_TENANT_ID=${VITE_TENANT_ID}
EOF
    
    print_success "Created $env_file"
}

# =============================================================================
# Server Cleanup Functions
# =============================================================================

# Function to clean deployment directories on server
clean_server_deployment() {
    local remote_path=$1
    local app_name=$2

    print_status "Cleaning server deployment directory for $app_name..."
    print_warning "This will DELETE ALL FILES in $remote_path (except database)"

    # Delete all files in the deployment directory
    ssh -p "$HOSTINGER_PORT" "$HOSTINGER_USER@$HOSTINGER_HOST" \
        "rm -rf $remote_path/* && mkdir -p $remote_path"

    print_success "Server directory cleaned: $remote_path"
}

# Function to clean all caches on server
clean_server_caches() {
    print_status "Cleaning all caches on server..."

    # Clean node_modules cache, .turbo cache, and build artifacts
    ssh -p "$HOSTINGER_PORT" "$HOSTINGER_USER@$HOSTINGER_HOST" << 'EOF'
        # Clean API cache
        if [ -d "/var/www/digilist-api" ]; then
            echo "Cleaning API cache..."
            rm -rf /var/www/digilist-api/.turbo
            rm -rf /var/www/digilist-api/node_modules/.cache
        fi

        # Clean frontend app caches
        for app in web backoffice minside saas-admin tenant-admin; do
            app_path="/var/www/digilist/$app"
            if [ -d "$app_path" ]; then
                echo "Cleaning $app cache..."
                rm -rf "$app_path/.turbo"
                rm -rf "$app_path/.vite"
                rm -rf "$app_path/node_modules/.cache"
            fi
        done

        echo "Server caches cleared!"
EOF

    print_success "All server caches cleaned"
}

# Function to deploy an app
deploy_app() {
    local app_name=$1
    local dist_path=$2
    local remote_path=$3
    local subdomain=$4

    print_status "Deploying $app_name to $subdomain.$DOMAIN_BASE..."

    # Check if dist directory exists
    if [ ! -d "$PROJECT_ROOT/$dist_path" ]; then
        print_error "Build directory not found: $dist_path"
        print_warning "Run 'pnpm build' first or use deploy.sh which builds automatically."
        exit 1
    fi

    # Clean server deployment directory first
    clean_server_deployment "$remote_path" "$app_name"

    # Sync files with rsync (fresh deployment)
    rsync -avz \
        -e "ssh -p $HOSTINGER_PORT" \
        "$PROJECT_ROOT/$dist_path/" \
        "$HOSTINGER_USER@$HOSTINGER_HOST:$remote_path/"

    print_success "$app_name deployed to https://$subdomain.$DOMAIN_BASE"
}

# Function to deploy web app
deploy_web() {
    build_app "web"
    deploy_app "web" "$WEB_DIST" "$WEB_REMOTE_PATH" "$WEB_SUBDOMAIN"
}

# Function to deploy backoffice app
deploy_backoffice() {
    build_app "backoffice"
    deploy_app "backoffice" "$BACKOFFICE_DIST" "$BACKOFFICE_REMOTE_PATH" "$BACKOFFICE_SUBDOMAIN"
}

# Function to deploy minside app
deploy_minside() {
    build_app "minside"
    deploy_app "minside" "$MINSIDE_DIST" "$MINSIDE_REMOTE_PATH" "$MINSIDE_SUBDOMAIN"
}

# Function to deploy saas-admin app
deploy_saas_admin() {
    build_app "saas-admin"
    deploy_app "saas-admin" "$SAAS_ADMIN_DIST" "$SAAS_ADMIN_REMOTE_PATH" "$SAAS_ADMIN_SUBDOMAIN"
}

# Function to deploy tenant-admin app
deploy_tenant_admin() {
    build_app "tenant-admin"
    deploy_app "tenant-admin" "$TENANT_ADMIN_DIST" "$TENANT_ADMIN_REMOTE_PATH" "$TENANT_ADMIN_SUBDOMAIN"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [web|backoffice|minside|saas-admin|tenant-admin|all]"
    echo ""
    echo "Commands:"
    echo "  web           Build and deploy web app (web-test.digilist.no)"
    echo "  backoffice    Build and deploy backoffice app (backoffice-test.digilist.no)"
    echo "  minside       Build and deploy minside app (minside-test.digilist.no)"
    echo "  saas-admin    Build and deploy saas-admin app (saas-admin.digilist.no)"
    echo "  tenant-admin  Build and deploy tenant-admin app (tenant-admin.digilist.no)"
    echo "  all           Build and deploy all apps"
    echo ""
    echo "Prerequisites:"
    echo "  1. Edit scripts/deploy-config.sh with your Hostinger details"
    echo "  2. Ensure SSH key is added to Hostinger server"
    echo "  3. Create A records for subdomains pointing to server IP"
}

# Main execution
main() {
    local target=${1:-""}
    
    if [ -z "$target" ]; then
        show_usage
        exit 1
    fi
    
    print_status "Starting deployment..."
    print_status "Target: $target"
    echo ""
    
    # Run safety checks BEFORE any build/deploy
    print_status "Running pre-flight checks..."
    check_duplicate_configs
    ensure_theme_files
    clear_caches
    echo ""
    
    case "$target" in
        web)
            deploy_web
            ;;
        backoffice)
            deploy_backoffice
            ;;
        minside)
            deploy_minside
            ;;
        saas-admin)
            deploy_saas_admin
            ;;
        tenant-admin)
            deploy_tenant_admin
            ;;
        all)
            deploy_web
            deploy_backoffice
            deploy_minside
            deploy_saas_admin
            deploy_tenant_admin
            ;;
        *)
            print_error "Unknown target: $target"
            show_usage
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment complete!"
    echo ""

    # Verify deployments
    print_status "Verifying deployments..."
    verify_deployments "$target"

    echo ""
    echo "Next steps:"
    echo "  1. Check the sites in your browser:"
    echo "     - https://$WEB_SUBDOMAIN.$DOMAIN_BASE"
    echo "     - https://$BACKOFFICE_SUBDOMAIN.$DOMAIN_BASE"
    echo "     - https://$MINSIDE_SUBDOMAIN.$DOMAIN_BASE"
    echo "     - https://$SAAS_ADMIN_SUBDOMAIN.$DOMAIN_BASE"
    echo "     - https://$TENANT_ADMIN_SUBDOMAIN.$DOMAIN_BASE"
    echo ""
    echo "  2. If SSL not configured, run: ./scripts/setup-ssl.sh"
}

# Function to verify deployments
verify_deployments() {
    local target=$1
    local failed=0

    case "$target" in
        web)
            check_url "https://$WEB_SUBDOMAIN.$DOMAIN_BASE" "Web Test" || ((failed++))
            ;;
        backoffice)
            check_url "https://$BACKOFFICE_SUBDOMAIN.$DOMAIN_BASE" "Backoffice Test" || ((failed++))
            ;;
        minside)
            check_url "https://$MINSIDE_SUBDOMAIN.$DOMAIN_BASE" "Minside Test" || ((failed++))
            ;;
        saas-admin)
            check_url "https://$SAAS_ADMIN_SUBDOMAIN.$DOMAIN_BASE" "SaaS Admin" || ((failed++))
            ;;
        tenant-admin)
            check_url "https://$TENANT_ADMIN_SUBDOMAIN.$DOMAIN_BASE" "Tenant Admin" || ((failed++))
            ;;
        all)
            check_url "https://$WEB_SUBDOMAIN.$DOMAIN_BASE" "Web Test" || ((failed++))
            check_url "https://$BACKOFFICE_SUBDOMAIN.$DOMAIN_BASE" "Backoffice Test" || ((failed++))
            check_url "https://$MINSIDE_SUBDOMAIN.$DOMAIN_BASE" "Minside Test" || ((failed++))
            check_url "https://$SAAS_ADMIN_SUBDOMAIN.$DOMAIN_BASE" "SaaS Admin" || ((failed++))
            check_url "https://$TENANT_ADMIN_SUBDOMAIN.$DOMAIN_BASE" "Tenant Admin" || ((failed++))
            ;;
    esac

    if [ $failed -eq 0 ]; then
        print_success "All deployed sites are accessible!"
    else
        print_warning "$failed site(s) failed verification - check manually"
    fi
}

# Function to check if URL is accessible
check_url() {
    local url=$1
    local name=$2

    if curl -s -f -I "$url" > /dev/null 2>&1; then
        print_success "$name is accessible at $url"
        return 0
    else
        print_error "$name is NOT accessible at $url"
        return 1
    fi
}

main "$@"
