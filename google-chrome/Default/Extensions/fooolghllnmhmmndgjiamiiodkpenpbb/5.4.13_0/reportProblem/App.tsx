import { TranslationsProvider } from '@extension/app/context/TranslationsProvider';
import { ErrorBoundary } from '@extension/app/components/ErrorBoundary';
import { useAppThemeChangeListener } from '@extension/app/hooks/useAppThemeChangeListener';
import { Success } from '@extension/reportProblem/components/Success';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { useNordPassUI } from '@nordpass/ui';
import { useEnvironmentChangeListener } from '@extension/app/hooks/useEnvironmentChangeListener';

export const App = () => {
  useAppThemeChangeListener();
  useEnvironmentChangeListener();
  const { isDarkTheme } = useAppTheme();
  useNordPassUI(isDarkTheme ? 'dark' : 'light');
  const params = new URLSearchParams(window.location.search);
  const isEnjoying = !!params.get('isEnjoying');

  return (
    <ErrorBoundary>
      <TranslationsProvider>
        <Success isEnjoying={isEnjoying} />
      </TranslationsProvider>
    </ErrorBoundary>
  );
};
