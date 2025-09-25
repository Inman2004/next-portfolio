export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
        <div className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
        <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4"></div>
      </div>
    </div>
  );
}
