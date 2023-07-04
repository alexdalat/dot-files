import { useContext } from 'react';
import { AuthContext } from '@extension/app/context/AuthContext';

export const useUserStatus = () => {
  const { subscriptionData } = useContext(AuthContext);
  const isPremium = subscriptionData?.isPremium;
  const isBusiness = subscriptionData?.isBusiness;
  const isFreeUser = !(isPremium || isBusiness);
  const isTrial = subscriptionData?.isTrial;
  const isTrialAvailable = subscriptionData?.isTrialAvailable;

  return {
    isFreeUser,
    isTrialAvailable,
    isTrial,
    isPremium,
    isBusiness,
  };
};
