import { TranslationsProvider } from '@extension/app/context/TranslationsProvider';
import { ErrorBoundary } from '@extension/app/components/ErrorBoundary';
import { Provider } from 'react-redux';
import { proxyStore } from '@extension/browser/standalone/proxyStore';
import { Popup } from './Popup';

export const App = () => (
  <ErrorBoundary>
    <TranslationsProvider>
      <Provider store={proxyStore}>
        <Popup />
      </Provider>
    </TranslationsProvider>
  </ErrorBoundary>
);
