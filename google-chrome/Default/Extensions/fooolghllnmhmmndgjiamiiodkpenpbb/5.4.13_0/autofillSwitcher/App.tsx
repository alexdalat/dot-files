import { TranslationsProvider } from '@extension/app/context/TranslationsProvider';
import { ErrorBoundary } from '@extension/app/components/ErrorBoundary';
import { useAppThemeChangeListener } from '@extension/app/hooks/useAppThemeChangeListener';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { useNordPassUI } from '@nordpass/ui';
import { useEnvironmentChangeListener } from '@extension/app/hooks/useEnvironmentChangeListener';
import { DialogBody } from './components/DialogBody';

export const App = () => {
  useAppThemeChangeListener();
  useEnvironmentChangeListener();

  const { isDarkTheme } = useAppTheme();
  useNordPassUI(isDarkTheme ? 'dark' : 'light');

  return (
    <ErrorBoundary>
      <TranslationsProvider>
        <DialogBody />
      </TranslationsProvider>
    </ErrorBoundary>
  );
};
