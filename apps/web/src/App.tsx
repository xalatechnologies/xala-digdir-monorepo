import React from 'react';
import { 
  Button, 
  Fieldset, 
  Select, 
  Textfield, 
  Heading, 
  Alert
} from '@xala/ds';
import { DesignsystemetProvider, type DsSize } from '@xala/ds';
import { DEFAULT_THEME, THEMES, type ThemeId } from '@xala/ds-themes';

export function App() {
  const [theme, setTheme] = React.useState<ThemeId>(DEFAULT_THEME);
  const [scheme, setScheme] = React.useState<'auto' | 'light' | 'dark'>('auto');
  const [size, setSize] = React.useState<DsSize>('md');
  const themeOptions = Object.keys(THEMES) as ThemeId[];

  return (
    <DesignsystemetProvider theme={theme} colorScheme={scheme} size={size}>
      <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
        <Heading level={1}>
          Xala + Designsystemet (Vite Monorepo)
        </Heading>

        <Fieldset style={{ marginBottom: 32 }}>
          <Heading level={2}>Branding & display</Heading>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label htmlFor="theme-select">Theme</label>
              <Select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeId)}
              >
                {themeOptions.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="scheme-select">Color scheme</label>
              <Select
                id="scheme-select"
                value={scheme}
                onChange={(e) => setScheme(e.target.value as any)}
              >
                <option value="auto">auto</option>
                <option value="light">light</option>
                <option value="dark">dark</option>
              </Select>
            </div>

            <div>
              <label htmlFor="size-select">Size</label>
              <Select
                id="size-select"
                value={size}
                onChange={(e) => setSize(e.target.value as DsSize)}
              >
                <option value="sm">sm</option>
                <option value="md">md</option>
                <option value="lg">lg</option>
              </Select>
            </div>

            <Textfield label="Example field" placeholder="Type something…" />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button>Primary action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button asChild>
                <a href="https://designsystemet.no/no/" target="_blank" rel="noreferrer">
                  DS docs
                </a>
              </Button>
            </div>
          </div>
        </Fieldset>

        <Fieldset style={{ marginBottom: 32 }}>
          <Heading level={2}>Components</Heading>
          <div style={{ display: 'grid', gap: 16 }}>
            <Alert>
              This is an info alert showing the theme is working!
            </Alert>
          </div>
        </Fieldset>

        <p style={{ marginTop: 24, opacity: 0.8 }}>
          Note: This repo uses Digdir Designsystemet themes. Theme switching is managed by the provider.
        </p>
      </div>
    </DesignsystemetProvider>
  );
}
