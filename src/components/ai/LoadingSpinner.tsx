interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-400"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          🤖
        </div>
      </div>
      {message && (
        <p className="mt-6 text-slate-200 font-medium text-center max-w-md">
          {message}
        </p>
      )}
    </div>
  );
}
