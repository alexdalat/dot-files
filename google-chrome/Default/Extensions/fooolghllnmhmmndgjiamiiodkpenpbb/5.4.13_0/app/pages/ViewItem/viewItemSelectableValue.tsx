import cx from 'classnames';

interface IViewItemSelectableValue {
  value: string | JSX.Element;
  className: string;
}

export const ViewItemSelectableValue = ({ value, className }: IViewItemSelectableValue) => (
  <span className={cx(className, 'selectable')}>
    {value}
  </span>
);
