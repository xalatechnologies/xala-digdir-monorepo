/**
 * PM2 Ecosystem Configuration - PRODUCTION
 * 
 * This configuration manages all Digilist Platform applications in production.
 * Secrets are loaded from /etc/digilist/<app>/production.env (root-owned, 0600)
 * 
 * Deploy: pm2 start ecosystem.production.config.js
 * Reload: pm2 reload ecosystem.production.config.js (zero-downtime)
 * Stop: pm2 stop ecosystem.production.config.js
 */

module.exports = {
  apps: [
    // ==========================================================================
    // BACKEND API
    // ==========================================================================
    {
      name: 'api-production',
      script: 'dist/main.js',
      cwd: '/var/www/digilist/api',
      instances: 4, // More instances for production
      exec_mode: 'cluster',
      env_file: '/etc/digilist/api/production.env',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/digilist/api-production-error.log',
      out_file: '/var/log/digilist/api-production-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G', // Higher limit for production
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Production-specific settings
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // Graceful shutdown
      wait_ready: true,
      
      // Monitoring
      monitoring: true,
    },

    // ==========================================================================
    // FRONTEND APPLICATIONS (Build Process)
    // ==========================================================================
    // Note: These are build processes. Actual serving is done by Nginx.
    // These entries are used during deployment to build the apps.

    // Web App (Public Website)
    {
      name: 'web-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/web',
      env_file: '/etc/digilist/web/production.env',
      autorestart: false,
      watch: false,
    },

    // MinSide App (User Portal)
    {
      name: 'dashboard-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/dashboard',
      env_file: '/etc/digilist/dashboard/production.env',
      autorestart: false,
      watch: false,
    },

    // Backoffice App (Admin Portal)
    {
      name: 'backoffice-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/backoffice',
      env_file: '/etc/digilist/backoffice/production.env',
      autorestart: false,
      watch: false,
    },

    // Tenant Admin App
    {
      name: 'tenant-admin-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/tenant-admin',
      env_file: '/etc/digilist/tenant-admin/production.env',
      autorestart: false,
      watch: false,
    },

    // SaaS Admin App
    {
      name: 'saas-admin-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/saas-admin',
      env_file: '/etc/digilist/saas-admin/production.env',
      autorestart: false,
      watch: false,
    },

    // Monitoring App
    {
      name: 'monitoring-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/monitoring',
      env_file: '/etc/digilist/monitoring/production.env',
      autorestart: false,
      watch: false,
    },

    // Docs & Learning App
    {
      name: 'docs-learning-production-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/docs-learning',
      env_file: '/etc/digilist/docs-learning/production.env',
      autorestart: false,
      watch: false,
    },
  ],
};
