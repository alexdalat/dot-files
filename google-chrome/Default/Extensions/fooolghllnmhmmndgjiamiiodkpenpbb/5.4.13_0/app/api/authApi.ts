import { sendMetric } from '@common/utils/sendMetric';
import { Metric, MetricType } from '@common/constants/metrics';
import { api } from './index';

export const lockApp = () => {
  sendMetric(api, Metric.AppLock, MetricType.Intent);
  api.account.accountLockAll().catch(() => sendMetric(api, Metric.AppLock, MetricType.Error));
};
