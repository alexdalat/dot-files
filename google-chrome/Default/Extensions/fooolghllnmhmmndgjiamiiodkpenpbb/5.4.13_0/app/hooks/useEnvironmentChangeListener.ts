import { StorageApi } from '@extension/browser/storageApi';
import { ListenerType, Storage } from '@extension/common/constants';
import { createListener } from '@extension/app/api/createListener';
import { useEffect } from 'react';
import { addEnvironmentClassNameToHtmlElement } from '@common/utils/environmentUtils';

export const useEnvironmentChangeListener = () => {
  (async () => {
    const { environment } = await StorageApi.get({ [Storage.Environment]: null });
    addEnvironmentClassNameToHtmlElement(environment);
  })();

  const handleEnvironmentChange = (changes: Record<string, any>) => {
    if (changes[Storage.Environment]) {
      const environment = changes[Storage.Environment].newValue;
      addEnvironmentClassNameToHtmlElement(environment);
    }
  };

  useEffect(() => createListener(handleEnvironmentChange, ListenerType.StorageChange), []);
};
