import { ReactNode, useState } from 'react';
import { IButton } from '@nordpass/ui';
import { SVG } from '@nord/ui';
import { useHandleActionClick } from '@common/hooks/useHandleActionClick';
import { Tooltip } from '@common/components/Tooltip/Tooltip';

interface IActionButton extends Partial<IButton> {
  icon: string;
  tooltipText?: ReactNode;
  tooltipId?: string;
  className?: string;
  callbackTooltipText?: ReactNode;
}

export const IconButton = ({
  icon,
  tooltipText,
  tooltipId,
  className,
  callbackTooltipText,
  onClick,
}: IActionButton) => {
  const [tooltipTextValue, setTooltipTextValue] = useState(tooltipText);
  const handleActionClick = useHandleActionClick(onClick, tooltipText, setTooltipTextValue, callbackTooltipText);

  return (
    <>
      {tooltipId && (
        <Tooltip showOnHover id={tooltipId}>
          {tooltipTextValue}
        </Tooltip>
      )}
      <div className={className}>
        <button
          data-testid="icon-button"
          type="button"
          className="flex items-center icon-button"
          onClick={handleActionClick}
          {...{ [`data-tip-${tooltipId}`]: true }}
        >
          <SVG
            noLazy
            src={icon}
            width={24}
            height={24}
            data-testid="icon"
          />
        </button>
      </div>
    </>
  );
};
