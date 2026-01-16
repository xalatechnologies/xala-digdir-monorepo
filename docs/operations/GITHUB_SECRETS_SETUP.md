# GitHub Secrets Configuration

This document explains how to configure GitHub repository secrets for automated deployment.

## Why GitHub Secrets?

All sensitive configuration is stored securely in GitHub repository settings and injected during deployment. This solves the "configuration is always a problem" issue by:

1. **Centralized Management** - All secrets in one secure place
2. **No Server-Side .env Files** - Configuration is deployed from GitHub
3. **Version Control Safe** - No secrets in git history
4. **Audit Trail** - GitHub logs all secret access
5. **Easy Rotation** - Update secrets in GitHub UI, redeploy

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

## Required Secrets

### SSH Deployment Credentials

```
SSH_PRIVATE_KEY
```
**Value**: Your SSH private key for server access
**How to get it**:
```bash
cat ~/.ssh/id_rsa
# Or generate new key:
ssh-keygen -t ed25519 -C "github-actions-deploy"
```
**Important**: Make sure the corresponding public key is in `~/.ssh/authorized_keys` on the server

```
SERVER_HOST
```
**Value**: `72.61.23.56`
**Description**: Your VPS IP address

```
SERVER_PORT
```
**Value**: `22`
**Description**: SSH port (default is 22)

```
SERVER_USER
```
**Value**: `root`
**Description**: SSH username for deployment

---

### API Environment Variables

```
NODE_ENV
```
**Value**: `production`
**Description**: Runtime environment

```
API_PORT
```
**Value**: `4000`
**Description**: Port for API server

```
DATABASE_URL
```
**Value**: `postgresql://username:password@host:5432/database_name`
**Description**: PostgreSQL connection string
**Example**: `postgresql://digilist_user:secure_password@localhost:5432/digilist_db`

```
JWT_SECRET
```
**Value**: A secure random string (min 32 characters)
**Description**: Secret for signing JWT access tokens
**Generate with**:
```bash
openssl rand -base64 32
```

```
JWT_REFRESH_SECRET
```
**Value**: A different secure random string (min 32 characters)
**Description**: Secret for signing JWT refresh tokens
**Generate with**:
```bash
openssl rand -base64 32
```

```
CSRF_SECRET
```
**Value**: A secure random string (min 32 characters)
**Description**: Secret for CSRF token generation
**Generate with**:
```bash
openssl rand -base64 32
```

```
SESSION_SECRET
```
**Value**: A secure random string (min 32 characters)
**Description**: Secret for session encryption
**Generate with**:
```bash
openssl rand -base64 32
```

```
CORS_ORIGIN
```
**Value**: Comma-separated list of allowed origins
**Example**: `https://web.digilist.no,https://backoffice.digilist.no,https://minside.digilist.no,https://saas-admin.digilist.no,https://tenant-admin.digilist.no`

```
VITE_API_URL
```
**Value**: `https://api.digilist.no`
**Description**: API base URL for frontend apps

```
VITE_WS_URL
```
**Value**: `wss://api.digilist.no/ws/events`
**Description**: WebSocket URL for realtime events

---

## Optional Secrets (Add as needed)

### OAuth Providers

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID
FACEBOOK_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

### Email Service (e.g., SendGrid)

```
SENDGRID_API_KEY
EMAIL_FROM
```

### SMS Service (e.g., Twilio)

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

### Storage (e.g., AWS S3)

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
```

---

## Verification

After adding all secrets:

1. Go to **Actions** tab in your repository
2. Click **Deploy to Production** workflow
3. Click **Run workflow** → **Run workflow**
4. Monitor the deployment

The workflow will:
- ✅ Clean all deployment directories
- ✅ Build all apps
- ✅ Deploy frontend apps
- ✅ Create .env file from secrets
- ✅ Deploy API
- ✅ Restart PM2
- ✅ Verify all URLs

---

## Security Best Practices

1. **Rotate Secrets Regularly** - Update secrets every 90 days
2. **Use Strong Secrets** - Minimum 32 characters, random
3. **Separate Environments** - Use different secrets for staging/production
4. **Limit Access** - Only admins should have access to GitHub secrets
5. **Audit Logs** - Review GitHub Actions logs regularly

---

## Troubleshooting

### Deployment Fails with "Permission Denied"

- Check that `SSH_PRIVATE_KEY` is correct
- Verify public key is in `~/.ssh/authorized_keys` on server
- Ensure `SERVER_USER` has permissions to `/var/www/`

### API Won't Start

- Check `DATABASE_URL` is correct
- Verify database is accessible from server
- Check API logs: `pm2 logs digilist-api`

### Frontend Apps Don't Load

- Verify nginx configuration points to correct directories
- Check file permissions: `ls -la /var/www/digilist/`
- Test direct access to index.html

---

## Current Deployment URLs

After updating nginx configuration:

- **Web**: https://web.digilist.no
- **Backoffice**: https://backoffice.digilist.no
- **Minside**: https://minside.digilist.no
- **SaaS Admin**: https://saas-admin.digilist.no
- **Tenant Admin**: https://tenant-admin.digilist.no
- **API**: https://api.digilist.no

---

## Next Steps

1. Add all secrets to GitHub repository settings
2. Update nginx configuration for new subdomain URLs
3. Push code to `main` branch to trigger deployment
4. Monitor deployment in GitHub Actions
5. Verify all apps are accessible

---

## Questions?

If you encounter issues:
1. Check GitHub Actions logs
2. SSH to server and check PM2 logs: `pm2 logs`
3. Check nginx error logs: `tail -f /var/log/nginx/error.log`
