import { useEffect, useState } from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { ListenerType, Storage } from '@extension/common/constants';
import { StorageApi } from '@extension/browser/storageApi';
import { createListener } from '@extension/app/api/createListener';
import { useIsMountedRef } from '@common/hooks/useIsMountedRef';
import { FullscreenLoader } from '@common/components/FullScreenLoader/FullscreenLoader';

export const ApproveExtension = () => {
  const [approveCode, setApproveCode] = useState<string | null>(null);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    (async () => {
      const result = await StorageApi.get({ [Storage.ApproveCode]: null });

      if (isMountedRef.current) {
        setApproveCode(result[Storage.ApproveCode]);
      }
    })();

    const handleApproveCodeChange = async (changes: Record<string, any>) => {
      if (changes[Storage.ApproveCode]) {
        if (isMountedRef.current) {
          setApproveCode(changes[Storage.ApproveCode].newValue);
        }
      }
    };
    return createListener(handleApproveCodeChange, ListenerType.StorageChange);
  }, [isMountedRef]);

  if (!approveCode) {
    return <FullscreenLoader />;
  }

  return (
    <div className="flex flex-col justify-center items-center leading-normal text-small font-medium h-screen bg-primary">
      <div className="text-lead font-bold mb-6 text-center max-w-500px color-primary">
        <FormattedMessage id="pairingCode" />
      </div>
      <div className="text-center">
        <div className="inline-block relative text-h3" data-testid="approve-code">
          {approveCode.split('').map((key: string, index: number) => (
            <span key={index} className={cx('text-teal text-28px line-h-42px', index < approveCode.split('').length - 1 && 'mr-14px')}>
              {key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
