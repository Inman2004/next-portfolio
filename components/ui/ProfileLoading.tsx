export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
          <div className="flex-1 w-full space-y-4">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-12 space-y-6">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-6"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-zinc-200 dark:bg-zinc-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
