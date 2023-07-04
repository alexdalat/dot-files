import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { APP_ID } from '@common/constants';
import { watchDialogHeight } from '@common/services/watchDialogHeight';
import { ExtensionAction } from '@common/constants/action';
import { App } from './App';
import '@extension/common/style';
import './reportProblem.scss';

watchDialogHeight(ExtensionAction.SetReportProblemHeight);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById(APP_ID)!);
root.render(<StrictMode><App /></StrictMode>);
