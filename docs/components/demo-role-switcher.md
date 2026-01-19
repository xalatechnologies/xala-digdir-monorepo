# DemoRoleSwitcher Component

One-click demo login by role for testing and demonstration purposes.

## Overview

The `DemoRoleSwitcher` component provides a dialog with role options for quick demo authentication. Users click a role button to instantly log in as that role - no manual token entry required.

## Usage

```tsx
import { DemoRoleSwitcher } from '@xala/ds';
import type { DemoRoleKey } from '@xala/ds';

function LoginPage() {
  const [open, setOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<DemoRoleKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (key: DemoRoleKey) => {
    setLoadingRole(key);
    try {
      const response = await authService.demoExchange(key);
      window.location.href = response.data.redirectUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <DemoRoleSwitcher
      open={open}
      onClose={() => setOpen(false)}
      onRoleSelect={handleRoleSelect}
      loadingRole={loadingRole}
      error={error}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Whether the dialog is open |
| `onClose` | `() => void` | required | Callback when dialog should close |
| `onRoleSelect` | `(key: DemoRoleKey) => Promise<void>` | required | Callback when role is selected |
| `title` | `string` | `"Demo-innlogging"` | Dialog title |
| `description` | `string` | `"Velg en rolle..."` | Dialog description |
| `cancelText` | `string` | `"Avbryt"` | Cancel button text |
| `options` | `DemoRoleOption[]` | Default 4 roles | Role options to display |
| `loadingRole` | `DemoRoleKey \| null` | `null` | Currently loading role |
| `error` | `string \| null` | `null` | Error message to display |

## Role Options

Default roles:

| Key | Label | Description |
|-----|-------|-------------|
| `admin` | Administrator | Full access to all features |
| `case_handler` | Saksbehandler | Handles bookings and inquiries |
| `org_admin` | Organisasjonsadmin | Manages own organization |
| `org_member` | Organisasjonsmedlem | Regular org member |

## API Endpoint

```
POST /api/auth/demo/exchange
Content-Type: application/json

{
  "key": "admin",
  "returnTo": "/dashboard"
}
```

Response:
```json
{
  "data": {
    "redirectUrl": "/dashboard",
    "expiresAt": "2026-01-20T12:00:00.000Z",
    "user": {
      "id": "...",
      "email": "admin@demo.digilist.no",
      "name": "Demo Admin",
      "role": "admin"
    }
  }
}
```

## SDK Methods

```typescript
// Service method
const response = await authService.demoExchange('admin', '/dashboard');

// React Query hook
const demoLogin = useDemoLogin();
demoLogin.mutate({ key: 'admin' }, {
  onSuccess: (data) => {
    window.location.href = data.data.redirectUrl;
  }
});
```

## Security

- **Disabled in production** unless `DEMO_LOGIN_ENABLED=true`
- Tokens are hashed in database (never stored in plaintext)
- All demo logins are audit logged with `action: 'login'`, `method: 'demo-exchange'`
- Session created with standard JWT + HTTP-only cookies

## Accessibility

- Full keyboard navigation (Arrow keys, Enter, Escape)
- Focus trap within dialog
- ARIA roles and labels
- Loading state feedback with spinner

## Test IDs

- `demo-login-option-admin`
- `demo-login-option-case_handler`
- `demo-login-option-org_admin`
- `demo-login-option-org_member`
- `demo-login-cancel`
