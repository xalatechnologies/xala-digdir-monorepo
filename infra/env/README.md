# Environment Variables

This directory contains environment variable templates for all environments.

## Files

- `.env.example` - General template for all environments
- `.env.development.example` - Local development template
- `.env.staging.example` - Staging environment template
- `.env.production.example` - Production environment template
- `.env.docker.dev` - Docker development environment

## Usage

### Local Development

```bash
# Copy template
cp infra/env/.env.development.example .env

# Edit with your values
nano .env

# Never commit .env file
```

### Docker Development

```bash
# Already configured in infra/env/.env.docker.dev
# Used automatically by docker-compose.dev.yml
```

### Staging/Production

**DO NOT create .env files for staging/production in the repository.**

Instead, use the secrets management system:

1. Create encrypted secrets in `infra/secrets/staging/` or `infra/secrets/production/`
2. Deploy using CI/CD or deployment scripts
3. Secrets are decrypted and placed on VPS at deploy time

See [infra/docs/SECRETS_MANAGEMENT.md](../docs/SECRETS_MANAGEMENT.md) for details.

## Security

✅ **DO:**
- Use `.env.example` templates
- Encrypt secrets with `age`
- Store encrypted files in `infra/secrets/`
- Use strong secrets (48+ characters)

❌ **DON'T:**
- Commit `.env` files
- Commit plaintext secrets
- Share secrets via Slack/email
- Use same secrets for staging and production
