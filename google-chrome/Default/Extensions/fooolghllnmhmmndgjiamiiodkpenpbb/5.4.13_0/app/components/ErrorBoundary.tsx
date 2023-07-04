import { Component, ReactNode } from 'react';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { LogLevel } from '@common/services/loggingFactory/contracts';
import { ErrorScreen } from './ErrorScreen/ErrorScreen';

interface IErrorBoundaryProps {
  children?: ReactNode;
}

interface IErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error) {
    this.setState({ hasError: true });
    logMessage(LogLevel.Error, 'ErrorBoundary:', error);
  }

  public render() {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <ErrorScreen />;
    }

    return children;
  }
}
