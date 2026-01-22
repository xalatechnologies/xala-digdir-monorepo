# GitHub Secrets Configuration Guide

**Repository:** xala-digdir-monorepo  
**Date:** January 18, 2026

---

## 📍 Quick Access

Go to: **https://github.com/xalatechnologies/xala-digdir-monorepo/settings/secrets/actions**

---

## 🔑 Required Secrets

### 1. AGE_SECRET_KEY ⚠️ CRITICAL

**Purpose:** Decrypt encrypted secrets during CI/CD deployment

**Value to copy:**
```
# created: 2026-01-18T14:39:16+01:00
# public key: age1u55ptsh8wpy8d4kglqxf5tyxnvaqr0v0a4qe4c6qg5x8sfnt5a4sqwqs5t
AGE-SECRET-KEY-1HD78DZXP5GDY5CLFYP0KG06AAGKLK07N8CM57HUDPQKQ5N5VASYSTTV0ND
```

**Steps:**
1. Click **"New repository secret"**
2. Name: `AGE_SECRET_KEY`
3. Value: Paste the ENTIRE content above (all 3 lines)
4. Click **"Add secret"**

---

### 2. SSH_PRIVATE_KEY (For VPS Deployment)

**Purpose:** SSH access to VPS for deployment

#### Option A: Use Existing SSH Key

If you already have an SSH key for the VPS:

```bash
cat ~/.ssh/id_ed25519
# or
cat ~/.ssh/id_rsa
```

#### Option B: Generate New Deployment Key

```bash
# Generate new key
ssh-keygen -t ed25519 -C "github-actions@digilist.no" -f ~/.ssh/digilist_deploy

# Display private key
cat ~/.ssh/digilist_deploy

# Display public key (to add to VPS later)
cat ~/.ssh/digilist_deploy.pub
```

**Steps:**
1. Click **"New repository secret"**
2. Name: `SSH_PRIVATE_KEY`
3. Value: Paste the entire private key content
4. Click **"Add secret"**

**Note:** You'll need to add the public key to your VPS:
```bash
# On VPS (when ready)
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
```

---

### 3. VPS_HOST

**Purpose:** VPS hostname or IP address

**Example values:**
- `staging.digilist.no` (if using domain)
- `123.45.67.89` (if using IP)

**Steps:**
1. Click **"New repository secret"**
2. Name: `VPS_HOST`
3. Value: Your VPS hostname or IP
4. Click **"Add secret"**

---

### 4. VPS_USER

**Purpose:** SSH user for deployment (non-root)

**Recommended value:** `digilist`

**Steps:**
1. Click **"New repository secret"**
2. Name: `VPS_USER`
3. Value: `digilist`
4. Click **"Add secret"**

---

### 5. VPS_ROOT_USER

**Purpose:** Root user for uploading secrets to `/etc/digilist/`

**Recommended value:** `root`

**Steps:**
1. Click **"New repository secret"**
2. Name: `VPS_ROOT_USER`
3. Value: `root`
4. Click **"Add secret"**

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] `AGE_SECRET_KEY` - Contains entire age.key content (3 lines)
- [ ] `SSH_PRIVATE_KEY` - Contains entire SSH private key
- [ ] `VPS_HOST` - Contains VPS hostname or IP
- [ ] `VPS_USER` - Contains deployment user (e.g., `digilist`)
- [ ] `VPS_ROOT_USER` - Contains root user (e.g., `root`)

---

## 🔒 Security Notes

1. **Never share these secrets** via Slack, email, or any other channel
2. **GitHub masks secrets** in workflow logs automatically
3. **Secrets are encrypted** at rest by GitHub
4. **Only repository admins** can view/edit secrets
5. **Rotate secrets** every 90 days minimum

---

## 🧪 Testing

After adding secrets, test by:

1. Pushing a commit to `develop` branch
2. Check GitHub Actions workflow
3. Verify secrets are accessible (they'll be masked as `***`)

---

## 📚 Related Documentation

- `NEXT_STEPS.md` - Complete setup guide
- `infra/SETUP_GUIDE.md` - Infrastructure setup
- `infra/docs/SECRETS_MANAGEMENT.md` - Secrets management details

---

**Status:** Ready to configure  
**Last Updated:** January 18, 2026
