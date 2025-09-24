import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In future: send to logging service
    // console.error('ErrorBoundary caught', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6">Something went wrong</h1>
          <p className="text-white/60 max-w-xl mb-8">An unexpected error occurred while rendering this page. You can try again or return to the home screen.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button onClick={this.handleRetry} className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm font-medium">Retry</button>
            <a href="/" className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-sm font-medium shadow hover:opacity-90 transition">Go Home</a>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-8 text-left bg-white/5 p-4 rounded-lg text-xs max-w-2xl overflow-auto">{this.state.error.message}</pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
