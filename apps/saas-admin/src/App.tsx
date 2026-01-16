import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignsystemetProvider, ErrorBoundary, Heading, Paragraph } from '@xala/ds';
import { I18nProvider } from '@xala/i18n';

function DashboardPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <Heading level={1} size="lg">SaaS Admin Dashboard</Heading>
      <Paragraph>Welcome to the Digilist SaaS Administration Portal.</Paragraph>
      <Paragraph>This application is used for platform-wide tenant management.</Paragraph>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme="auto" size="md">
        <ErrorBoundary>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
