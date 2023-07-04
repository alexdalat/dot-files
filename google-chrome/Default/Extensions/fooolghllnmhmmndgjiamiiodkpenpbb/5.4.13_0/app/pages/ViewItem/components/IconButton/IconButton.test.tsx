import { fireEvent, render } from '@testing-library/react';
import copyIcon from '@icons/24/copy-ext.svg';
import { IconButton } from './IconButton';

const tooltipText = 'Copy';

describe('<IconButton />', () => {
  const setup = (callbackTooltipText: string | null = null, onClick?: any) => render(
    <IconButton
      icon={copyIcon}
      tooltipId="copy"
      tooltipText={tooltipText}
      callbackTooltipText={callbackTooltipText}
      onClick={onClick}
    />,
  );

  it('should display icon', async () => {
    const { findByTestId } = setup();
    const icon = await findByTestId('icon-button');

    expect(icon).toBeVisible();
  });

  it('should not display tooltip', () => {
    const { queryByText } = setup();

    expect(queryByText(tooltipText)).toBeNull();
  });

  it('should display tooltip on hover state', async () => {
    const { findByTestId, findByText, queryByText } = setup();
    const button = await findByTestId('icon-button');

    expect(queryByText(tooltipText)).toBeNull();

    fireEvent.mouseOver(button);
    expect(await findByText(tooltipText)).toBeVisible();
  });

  describe('when button gets clicked', () => {
    describe('and callbackTooltipText is set', () => {
      it('should change tooltip text on click and return to default after timeout', async () => {
        const { findByTestId, findByText } = setup('Copied');
        const button = await findByTestId('icon-button');

        fireEvent.mouseOver(button);
        fireEvent.click(button);

        const clickedTooltip = await findByText('Copied');
        expect(clickedTooltip).toBeVisible();

        const tooltip = await findByText(tooltipText);
        expect(clickedTooltip).not.toBeVisible();
        expect(tooltip).toBeVisible();
      });
    });

    describe('and callbackTooltipText is not set', () => {
      it('should not change tooltip text on click', async () => {
        const { findByTestId, findByText } = setup();
        const button = await findByTestId('icon-button');

        fireEvent.mouseOver(button);
        const tooltip = await findByText(tooltipText);
        expect(tooltip).toBeVisible();

        fireEvent.click(button);
        const clickedTooltip = await findByText(tooltipText);
        expect(clickedTooltip).toBeVisible();
      });
    });

    describe('and onClick is set', () => {
      it('should call onClick function', async () => {
        const onClick = jest.fn();

        const { findByTestId } = setup(null, onClick);
        const button = await findByTestId('icon-button');

        fireEvent.click(button);
        expect(onClick).toBeCalled();
      });
    });

    describe('and onClick is not set', () => {
      it('should not call onClick function', async () => {
        const onClick = jest.fn();

        const { findByTestId } = setup();
        const button = await findByTestId('icon-button');

        fireEvent.click(button);
        expect(onClick).not.toBeCalled();
      });
    });
  });
});
