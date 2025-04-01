export const GameCardSkeleton = () => (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-300 dark:bg-gray-600" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
      </div>
    </div>
  );