import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { APP_ID } from '@common/constants';
import { App } from './App';
import '@extension/common/style';
import './autofillSwitcher.scss';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById(APP_ID)!);
root.render(<StrictMode><App /></StrictMode>);
