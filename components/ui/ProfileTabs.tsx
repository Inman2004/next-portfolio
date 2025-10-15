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
    <div className="border-b border-zinc-200 dark:border-zinc-700 mb-8">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
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
