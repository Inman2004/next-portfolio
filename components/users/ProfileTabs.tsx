interface ProfileTabsProps {
  activeTab: 'posts' | 'about';
  onTabChange: (tab: 'posts' | 'about') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('posts')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'posts'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => onTabChange('about')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'about'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          About
        </button>
      </nav>
    </div>
  );
}
