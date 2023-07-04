import { memo } from 'react';
import cx from 'classnames';
import { Search } from './components/Search/Search';
import { HeaderMenu } from './components/HeaderMenu';
import { HeaderShares } from './components/HeaderShares';

import './Header.scss';

interface IHeaderProps {
  isContentScrolled: boolean;
  onMenuOpen: () => void;
}

export const Header = memo(({ isContentScrolled, onMenuOpen }: IHeaderProps) => (
  <div className={cx('header flex flex-col p-4 bg-primary', isContentScrolled && 'border-primary')}>
    <HeaderMenu onMenuOpen={onMenuOpen} />
    <HeaderShares />
    <Search />
  </div>
));
