import { TranslationsProvider } from '@extension/app/context/TranslationsProvider';
import { ErrorBoundary } from '@extension/app/components/ErrorBoundary';
import { Popup } from './Popup';

export const App = () => (
  <ErrorBoundary>
    <TranslationsProvider>
      <Popup />
    </TranslationsProvider>
  </ErrorBoundary>
);
