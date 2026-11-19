import React from 'react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('MAKH AND MORE ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E6E1D6] rounded-2xl p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-[#0F3D2E] mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-[#55635C] mb-6 leading-relaxed">
              We ran into an unexpected error loading this page. Your cart and preferences are safe.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-lg bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#0A2B20] transition-colors cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
