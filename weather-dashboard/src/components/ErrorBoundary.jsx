// ErrorBoundary — last line of defence: if any component throws,
// the user sees a friendly glass card with a reset action instead
// of a white screen. (Data-fetch errors are handled inline; this
// covers unexpected render-time failures.)
import React from 'react';
import Icon from './icons';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unexpected error' };
  }

  componentDidCatch(error, info) {
    // In production you'd forward this to Sentry/Datadog here.
    console.error('[SkyCast] Unhandled UI error:', error, info?.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card max-w-md p-8 text-center" role="alert">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
            <Icon.Alert size={24} />
          </span>
          <h1 className="text-lg font-bold">Something broke in the interface</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Don’t worry — your saved cities are safe. Try resetting the view.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Reset dashboard
          </button>
        </div>
      </div>
    );
  }
}
