interface ProfileTabsProps {
  activeTab: 'posts' | 'about';
  onTabChange: (tab: 'posts' | 'about') => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('posts')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'posts'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => onTabChange('about')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'about'
              ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          About
        </button>
      </nav>
    </div>
  );
}
