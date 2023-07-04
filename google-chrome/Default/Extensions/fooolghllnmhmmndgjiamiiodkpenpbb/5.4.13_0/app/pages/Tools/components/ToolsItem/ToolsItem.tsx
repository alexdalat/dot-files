import { HTMLAttributes } from 'react';
import { SvgIcon } from '@common/components/SvgIcon';
import chevronIcon from '@icons/24/chevron-right.svg';
import { Link, ILink } from '@nordpass/ui';
import './ToolsItem.scss';

interface IToolsListItemProps extends Pick<HTMLAttributes<HTMLDivElement>, 'className'>, Partial<ILink> {
  title: string;
  description?: string;
  iconPath: string;
}

export const ToolsItem = ({
  title,
  description,
  iconPath,
  ...linkProps
}: IToolsListItemProps) => (
  <Link
    className="rounded-2 h-80px flex items-center px-2 py-3 hover:bg-primary-accent-1"
    contentClassName="tools-item"
    iconPosition="right"
    {...linkProps}
  >
    <img
      alt="tool-icon"
      className="mr-4 item-image-32px"
      width={34}
      height={34}
      src={iconPath}
    />

    <div className="flex-col w-full leading-none">
      <div className="flex items-center color-primary tools-item__title">
        <span>{title}</span>
      </div>

      <span className="text-grey-dark text-micro tools-item__description color-primary-accent-1">
        {description}
      </span>
    </div>

    <SvgIcon
      width={24}
      height={24}
      src={chevronIcon}
      className="nordpass-svg ml-2 color-primary-accent-1"
    />

  </Link>
);
