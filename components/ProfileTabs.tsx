import { FiGrid, FiBookOpen, FiCode, FiClock } from 'react-icons/fi';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'posts', label: 'Posts', icon: <FiBookOpen className="mr-2" /> },
    { id: 'projects', label: 'Projects', icon: <FiCode className="mr-2" /> },
    { id: 'saved', label: 'Saved', icon: <FiClock className="mr-2" /> },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
