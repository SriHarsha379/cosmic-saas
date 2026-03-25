export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClass} border-2 border-white/10 border-t-purple-500 rounded-full animate-spin`}
      />
    </div>
  );
}
