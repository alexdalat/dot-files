import { ViewItemHeader } from '@extension/app/pages/ViewItem/components/ViewItemHeader/ViewItemHeader';
import { memo, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { PendingSharesContext } from '@extension/app/context/PendingSharesContext/PendingSharesContext';

export const ViewPendingItem = memo(() => {
  const navigate = useNavigate();
  const { email } = useParams<Record<'email', string>>();
  const pendingShares = useContext(PendingSharesContext);
  const [item, setItem] = useState(null);

  useEffect(() => {
    const decodedEmail = decodeURIComponent(email);
    setItem(pendingShares.find(shares => shares.uuid === decodedEmail));
  }, [pendingShares, email]);

  if (!item) {
    return null;
  }

  return (
    <div className="h-full flex flex-col justify-center page-slide-in pb-8">
      <ViewItemHeader item={item} onClose={() => navigate(-1)} />
      <div className="max-w-650px flex-1 overflow-y-auto mx-auto p-4 flex flex-col justify-center">
        <div className="items-center mb-4 flex flex-col">
          <p className="text-base leading-normal break-word w-full text-center mt-3 color-primary">
            <FormattedMessage
              id="sharedItemsCountMessage"
              values={{ email: item.email, items: item.items }}
            />
          </p>
          <p className="text-micro leading-normal text-center color-primary-accent-1 mt-3">
            <FormattedMessage
              id="pendingItemsMessageBeforeLogin"
              values={{ email: item.email, items: item.items }}
            />
          </p>
        </div>
      </div>
    </div>
  );
});
