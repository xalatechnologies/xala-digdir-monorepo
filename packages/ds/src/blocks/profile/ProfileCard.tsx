/**
 * ProfileCard Block
 * Display user profile information
 */
import { Card, Heading, Paragraph, Button, Avatar } from '@digdir/designsystemet-react';

export interface ProfileCardData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  memberSince?: string;
}

export interface ProfileCardProps {
  profile: ProfileCardData;
  onEdit?: () => void;
  compact?: boolean;
  'data-testid'?: string;
}

export function ProfileCard({ profile, onEdit, compact = false, 'data-testid': testId = 'profile-card' }: ProfileCardProps) {
  return (
    <Card data-testid={testId} style={{ padding: 'var(--ds-spacing-6)', border: '1px solid var(--ds-color-neutral-border-default)' }}>
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-5)', alignItems: compact ? 'center' : 'flex-start', flexDirection: compact ? 'row' : 'column' }}>
        <Avatar aria-label={profile.name} data-size={compact ? 'md' : 'lg'} style={{ backgroundColor: 'var(--ds-color-brand-1-surface-default)', color: 'var(--ds-color-brand-1-text-default)' }}>
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} /> : profile.name.charAt(0).toUpperCase()}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Heading level={3} data-size={compact ? 'sm' : 'md'} style={{ margin: 0 }}>{profile.name}</Heading>
          {profile.role && <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{profile.role}</Paragraph>}
          <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>{profile.email}</Paragraph>
          {profile.phone && <Paragraph data-size="sm" style={{ margin: 0 }}>{profile.phone}</Paragraph>}
          {profile.memberSince && !compact && <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>Medlem siden {new Date(profile.memberSince).toLocaleDateString('no-NO')}</Paragraph>}
        </div>
        {onEdit && <Button type="button" variant="secondary" data-size="sm" onClick={onEdit}>Rediger</Button>}
      </div>
    </Card>
  );
}

export interface QuickStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function QuickStat({ label, value, icon }: QuickStatProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-background-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
      {icon}
      <Paragraph data-size="lg" style={{ margin: 0, fontWeight: '600' }}>{value}</Paragraph>
      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>{label}</Paragraph>
    </div>
  );
}
