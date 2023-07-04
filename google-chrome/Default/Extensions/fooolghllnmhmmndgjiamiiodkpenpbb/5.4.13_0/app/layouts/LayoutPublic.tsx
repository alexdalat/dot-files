import { ReactNode, useContext } from 'react';
import cx from 'classnames';
import { ExtensionContext } from '@extension/app/context/ExtensionContext';
import { LogoIconByTheme } from '@extension/app/components/LogoIconByTheme';

interface ILayoutPublic {
  simpleLayout?: boolean;
  children?: ReactNode;
}

export const LayoutPublic = ({ children, simpleLayout }: ILayoutPublic) => {
  const { isPopup } = useContext(ExtensionContext) ?? {};

  return (
    <div className="flex flex-col justify-center items-center color-primary leading-normal text-small font-medium h-screen bg-primary">
      <div
        className={cx(
          'is-popup flex flex-col h-screen text-center font-medium overflow-y-auto relative',
          !isPopup && 'rounded-1 shadow-3',
          !process.env.SAFARI && 'page-slide-in', // in safari popup, this animation neither look nor perform good
        )}
      >
        {!simpleLayout && (
          <div className="mb-4 mt-20">
            <LogoIconByTheme />
          </div>
        )}
        <div className={cx('flex-1 w-full max-w-500px mx-auto', !simpleLayout && 'p-8')}>{children}</div>
      </div>
    </div>
  );
};
