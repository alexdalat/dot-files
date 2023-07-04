import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { SearchInput } from '@nordpass/ui';
import { ROUTES } from '@extension/common/constants/routes';
import { History } from 'history';
import { debounce } from '@common/utils/debounce';
import { history } from '@extension/app/utils/history';
import { useSearchParam } from '@common/hooks/useSearchParam';

const debouncedSearch = debounce((history: History, searchText: string) => {
  const encodedSearchText = encodeURIComponent(searchText);
  history.push({ pathname: ROUTES.VAULT, search: searchText ? `query=${encodedSearchText}` : '' });
}, 300);

export const Search = () => {
  const { formatMessage } = useIntl();
  const [query, setQuery] = useState('');
  const searchParam = useSearchParam('query', '');
  useEffect(() => {
    setQuery(searchParam);
  }, [searchParam]);

  const onSearchVault = (value: string) => {
    setQuery(value);
    debouncedSearch(history, value);
  };

  return (
    <div className="flex-1 pt-3">
      <SearchInput
        autoComplete="off"
        placeholder={formatMessage({ id: 'search' })}
        value={query}
        onClear={() => onSearchVault('')}
        onChange={event => onSearchVault((event.target as HTMLInputElement).value)}
      />
    </div>
  );
};
