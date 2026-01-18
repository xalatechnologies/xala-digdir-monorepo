/**
 * PM2 Ecosystem Configuration - STAGING
 * 
 * This configuration manages all Digilist Platform applications in staging.
 * Secrets are loaded from /etc/digilist/<app>/staging.env (root-owned, 0600)
 * 
 * Deploy: pm2 start ecosystem.staging.config.js
 * Reload: pm2 reload ecosystem.staging.config.js
 * Stop: pm2 stop ecosystem.staging.config.js
 */

module.exports = {
  apps: [
    // ==========================================================================
    // BACKEND API
    // ==========================================================================
    {
      name: 'api-staging',
      script: 'dist/main.js',
      cwd: '/var/www/digilist/api',
      instances: 2,
      exec_mode: 'cluster',
      env_file: '/etc/digilist/api/staging.env',
      env: {
        NODE_ENV: 'staging',
        PORT: 4000,
      },
      error_file: '/var/log/digilist/api-staging-error.log',
      out_file: '/var/log/digilist/api-staging-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
    },

    // ==========================================================================
    // FRONTEND APPLICATIONS (Served by Nginx, but PM2 can manage build process)
    // ==========================================================================
    // Note: In production, these are typically served by Nginx.
    // PM2 entries here are for managing the build/deployment process.
    // If you're using a separate web server, you can remove these entries.

    // Web App (Public Website)
    {
      name: 'web-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/web',
      env_file: '/etc/digilist/web/staging.env',
      autorestart: false,
      watch: false,
    },

    // MinSide App (User Portal)
    {
      name: 'minside-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/minside',
      env_file: '/etc/digilist/minside/staging.env',
      autorestart: false,
      watch: false,
    },

    // Backoffice App (Admin Portal)
    {
      name: 'backoffice-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/backoffice',
      env_file: '/etc/digilist/backoffice/staging.env',
      autorestart: false,
      watch: false,
    },

    // Tenant Admin App
    {
      name: 'tenant-admin-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/tenant-admin',
      env_file: '/etc/digilist/tenant-admin/staging.env',
      autorestart: false,
      watch: false,
    },

    // SaaS Admin App
    {
      name: 'saas-admin-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/saas-admin',
      env_file: '/etc/digilist/saas-admin/staging.env',
      autorestart: false,
      watch: false,
    },

    // Monitoring App
    {
      name: 'monitoring-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/monitoring',
      env_file: '/etc/digilist/monitoring/staging.env',
      autorestart: false,
      watch: false,
    },

    // Docs & Learning App
    {
      name: 'docs-learning-staging-build',
      script: 'npm',
      args: 'run build',
      cwd: '/var/www/digilist/docs-learning',
      env_file: '/etc/digilist/docs-learning/staging.env',
      autorestart: false,
      watch: false,
    },
  ],
};
