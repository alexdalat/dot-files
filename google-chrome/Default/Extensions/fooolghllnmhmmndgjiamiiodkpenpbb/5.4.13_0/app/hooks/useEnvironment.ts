import { Storage } from '@extension/common/constants';
import { useEffect, useState } from 'react';
import { Environment } from '@common/constants/environment';
import { StorageApi } from '@extension/browser/storageApi';

export const useEnvironment = () => {
  const [environment, setEnvironment] = useState<Environment>(Environment.Production);

  useEffect(() => {
    StorageApi.get({ [Storage.Environment]: Environment.Production })
      .then(({ environment }) => setEnvironment(environment));
  }, []);

  return environment;
};
