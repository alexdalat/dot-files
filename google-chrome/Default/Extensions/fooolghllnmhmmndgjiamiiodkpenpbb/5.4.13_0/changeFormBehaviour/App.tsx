import { TranslationsProvider } from '@extension/app/context/TranslationsProvider';
import { ErrorBoundary } from '@extension/app/components/ErrorBoundary';
import { useAppThemeChangeListener } from '@extension/app/hooks/useAppThemeChangeListener';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { useNordPassUI } from '@nordpass/ui';
import { useEnvironmentChangeListener } from '@extension/app/hooks/useEnvironmentChangeListener';
import { Body } from '@extension/changeFormBehaviour/components/Body';
import { TChangeFormBehaviourType } from '@common/constants';

export const App = () => {
  useAppThemeChangeListener();
  useEnvironmentChangeListener();
  const { isDarkTheme } = useAppTheme();
  useNordPassUI(isDarkTheme ? 'dark' : 'light');
  const params = new URLSearchParams(window.location.search);
  const changedTo = params.get('type') as TChangeFormBehaviourType;

  return (
    <ErrorBoundary>
      <TranslationsProvider>
        <Body changedTo={changedTo} />
      </TranslationsProvider>
    </ErrorBoundary>
  );
};
