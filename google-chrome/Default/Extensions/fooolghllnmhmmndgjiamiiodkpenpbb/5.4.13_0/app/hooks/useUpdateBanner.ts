import { noOp } from '@common/constants/function';

interface IUseUpdateBanner {
  isBannerVisible: boolean;
  disableBanner: () => void;
  handleSeen: () => void;
}

export const useUpdateBanner = (): IUseUpdateBanner => ({
  isBannerVisible: false,
  disableBanner: noOp,
  handleSeen: noOp,
});
