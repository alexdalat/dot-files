import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getIsPassword } from '@common/utils/itemTypeGuards';
import { ExtensionContext } from '@extension/app/context/ExtensionContext';
import { IItem } from '@common/interfaces/item';
import { Item } from '../Item/Item';

export const SuggestedItems = ({ items }: Record<'items', Array<IItem>>) => {
  const { domain } = useContext(ExtensionContext);

  const [suggestedItems, setSuggested] = useState([]);
  useEffect(() => {
    if (!domain) return;
    const filtered = items.filter(item => getIsPassword(item) && item?.url?.includes(domain));
    setSuggested(filtered?.length ? filtered : []);
  }, [items, domain]);

  if (!domain || !suggestedItems.length) {
    return null;
  }

  return (
    <>
      <div className="px-4 mb-1 text-micro text-grey-dark">
        <FormattedMessage id="suggestedItems" />
      </div>
      <ul className="mb-2">
        {suggestedItems.map((item: IItem, index: number) => (
          <Item items={suggestedItems} index={index} key={item.uuid} />
        ))}
      </ul>
    </>
  );
};
