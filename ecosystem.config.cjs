module.exports = {
  apps: [
    {
      name: 'digilist-api',
      script: './dist/main.js',
      cwd: '/var/www/digilist-api',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        API_PORT: 4000,
        API_HOST: '0.0.0.0',
        API_BASE_URL: 'https://api.digilist.no',

        // Database
        DATABASE_URL: 'postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod',
        REDIS_URL: 'redis://localhost:6379',

        // Security
        JWT_SECRET: 'KutE420F/gCO223OFVT4IVzradATSXo8oM21xctbM8k=',
        JWT_REFRESH_SECRET: '5uR724rLfZI5nyM8B7P0rxsE7l4JiX9jfnGM/ehU12I=',
        CSRF_SECRET: 'JWX6DvlLLlFOsLDsYoCbLV2ulTRDnrRMXJxYPDmfV9I=',
        SESSION_SECRET: 'SEDyZdLnauGKjtvedLPhxf/IDkQVE8DftujaYuno7KE=',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',

        // CORS
        CORS_ORIGIN: 'https://web.digilist.no,https://backoffice.digilist.no,https://minside.digilist.no,https://saas-admin.digilist.no,https://tenant-admin.digilist.no,https://web-test.digilist.no',

        // Tenant
        VITE_TENANT_ID: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',

        // Storage
        STORAGE_BASE_URL: '/storage',

        // Logging
        LOG_LEVEL: 'info',
        LOG_FORMAT: 'json',
      },
      error_file: '/root/.pm2/logs/digilist-api-error.log',
      out_file: '/root/.pm2/logs/digilist-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
