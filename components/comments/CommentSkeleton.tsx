import { Loader2 } from 'lucide-react';

export const CommentSkeleton = ({ count = 1 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="animate-pulse space-y-4 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 mb-4"
        >
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-700 rounded w-4/6" />
            <div className="h-4 bg-gray-700 rounded w-3/6" />
          </div>
          <div className="flex space-x-4 pt-2">
            <div className="h-4 w-16 bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </>
  );
};

export const CommentSkeletonSingle = () => (
  <div className="animate-pulse space-y-4 p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-gray-700" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-700 rounded" />
        <div className="h-3 w-24 bg-gray-700 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded w-5/6" />
      <div className="h-4 bg-gray-700 rounded w-4/6" />
    </div>
    <div className="flex space-x-4 pt-2">
      <div className="h-4 w-16 bg-gray-700 rounded" />
      <div className="h-4 w-16 bg-gray-700 rounded" />
    </div>
  </div>
);
