import { LogoIconByTheme, IconType } from '@extension/app/components/LogoIconByTheme';
import { FormattedMessage } from 'react-intl';

export const AppOutdated = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-primary">
    <div
      className="is-popup flex flex-col h-screen text-center color-primary leading-normal text-small font-medium overflow-y-auto relative"
    >
      <div className="mb-4 mt-20">
        <LogoIconByTheme type={IconType.Warning} />
      </div>
      <div className="flex-1 p-8 w-full max-w-500px mx-auto flex flex-col">
        <h3 className="text-h3 leading-normal tracking-tight font-bold mb-4">
          <FormattedMessage id="updateRequired" />
        </h3>
        <p className="text-small leading-normal mb-12">
          <FormattedMessage id="updateNordPassToStart" />
        </p>
      </div>
    </div>
  </div>
);
