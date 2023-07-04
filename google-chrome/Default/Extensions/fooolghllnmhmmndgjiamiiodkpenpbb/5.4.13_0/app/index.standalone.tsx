import { proxyStore } from '@extension/browser/standalone/proxyStore';
import { listenForUserActivity } from '@common/services/listenForUserActivity/listenForUserActivity';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@extension/common/style';
import './index.scss';
import { initPopup } from './utils/initPopup';

proxyStore.ready().then(() => {
  initPopup();
  listenForUserActivity();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(document.getElementById('app')!);
  root.render(<App />);
});
