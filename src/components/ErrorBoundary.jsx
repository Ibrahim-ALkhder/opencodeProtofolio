import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f4f6] px-4 text-center">
          <h1 className="text-6xl font-bold text-textPrimary">Oops</h1>
          <p className="mt-4 text-lg text-textSecondary">
            Something went wrong.
          </p>
          <p className="mt-1 text-sm text-textSecondary/60">
            {this.state.error?.message}
          </p>
          <Link
            to="/"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-8 rounded-full bg-textPrimary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Go Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
