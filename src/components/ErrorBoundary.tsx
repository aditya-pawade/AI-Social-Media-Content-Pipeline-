import React, { Component, ErrorInfo, ReactNode } from "react";
import { toast } from "sonner";

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    toast.error(`Application Error: ${error.message}`);
  }

  public render() {
    if (this.state.hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-lg max-w-md w-full border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-red-500 text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              An unexpected error occurred in the application.
            </p>
            <pre className="bg-neutral-100 dark:bg-neutral-950 p-3 rounded text-xs text-red-400 overflow-auto max-h-32 mb-4 whitespace-pre-wrap break-all">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 rounded font-medium hover:opacity-90 transition-opacity"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
