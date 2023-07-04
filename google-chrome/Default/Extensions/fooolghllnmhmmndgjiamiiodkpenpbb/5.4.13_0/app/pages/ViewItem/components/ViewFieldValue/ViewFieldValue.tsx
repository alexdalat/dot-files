import { ReactNode } from 'react';
import launchIcon from '@icons/24/launch.svg';
import copyIcon from '@icons/24/copy-ext.svg';
import showIcon from '@icons/24/show.svg';
import hideIcon from '@icons/24/hide.svg';
import { ActionType } from '@extension/app/pages/ViewItem/constants/constants/ActionType';
import { IconButton } from '../IconButton/IconButton';
import './ViewFieldValue.scss';

interface IAction extends Record<string, any> {
  action: ActionType;
  actionMessage: ReactNode;
  actionId: string;
}

interface IViewFieldValue {
  value: ReactNode;
  actions?: Array<IAction>;
}

const ACTION_ICON = {
  [ActionType.Copy]: copyIcon,
  [ActionType.Show]: showIcon,
  [ActionType.Hide]: hideIcon,
  [ActionType.Launch]: launchIcon,
};

export const ViewFieldValue = ({ value, actions }: IViewFieldValue) => (
  <div className="view-field-value flex">
    <div
      className="flex rounded-1 justify-between transition-colors duration-250 ease-out items-center hover:bg-primary hover:border-primary-accent-3"
      data-testid="value-container"
    >
      <span className="truncate selectable">{value}</span>
      {actions ? (
        <div className="view-field-value__actions flex" data-testid="field-action">
          {actions.map(({ action, actionMessage, actionId, ...rest }) => (
            <IconButton
              icon={ACTION_ICON[action]}
              key={actionId}
              tooltipText={actionMessage}
              tooltipId={actionId}
              {...rest}
            />
          ))}
        </div>
      ) : null}
    </div>
  </div>
);
