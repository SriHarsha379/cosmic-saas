import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message = 'Something went wrong', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="p-4 bg-red-500/10 rounded-full">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-gray-400 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white transition-all duration-300"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
