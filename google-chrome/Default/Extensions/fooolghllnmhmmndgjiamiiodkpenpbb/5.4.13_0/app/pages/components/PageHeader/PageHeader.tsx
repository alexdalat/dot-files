import { SvgIcon } from '@common/components/SvgIcon';
import { Link } from '@nordpass/ui';
import arrowLeftIcon from '@icons/24/arrow-left.svg';
import { ReactElement } from 'react';
import { useNavigate } from 'react-router';

import './PageHeader.scss';

interface IPageHeaderProps {
  title?: ReactElement;
}

export const PageHeader = ({ title }: IPageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="py-4 px-4 flex bg-primary">
      <Link className="flex items-center" onClick={() => navigate(-1)}>
        <SvgIcon
          width={24}
          height={24}
          src={arrowLeftIcon}
          className="nordpass-svg color-primary-accent-1 hover:color-primary-accent-13"
        />
      </Link>
      <h3 className="header__heading text-gray-darkest text-lead font-bolder line-h-24px truncate color-primary">
        {title}
      </h3>
    </div>
  );
};
