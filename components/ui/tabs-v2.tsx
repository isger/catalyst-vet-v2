'use client'

import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { cn } from "@/lib/utils";
import { useState } from 'react';

export interface Tab {
  name: string;
  value: string;
  count?: string;
}

interface TabsV2Props {
  tabs: Tab[];
  defaultValue?: string;
  onTabChange?: (value: string) => void;
}

export default function TabsV2({ tabs, defaultValue, onTabChange }: TabsV2Props) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value || '');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTab = tabs.find(tab => tab.name === e.target.value);
    if (selectedTab) {
      handleTabChange(selectedTab.value);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={tabs.find((tab) => tab.value === activeTab)?.name || ''}
          onChange={handleSelectChange}
          aria-label="Select a tab"
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white dark:bg-zinc-900 py-2 pr-8 pl-3 text-base text-gray-900 dark:text-gray-100 outline-1 -outline-offset-1 outline-gray-300 dark:outline-zinc-600 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:focus:outline-indigo-500"
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500 dark:fill-gray-400"
        />
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200 dark:border-zinc-700">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                aria-current={tab.value === activeTab ? 'page' : undefined}
                className={cn(
                  tab.value === activeTab
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                  'flex px-1 py-4 text-sm font-medium whitespace-nowrap',
                )}
              >
                {tab.name}
                {tab.count ? (
                  <span
                    className={cn(
                      tab.value === activeTab 
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' 
                        : 'bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-gray-300',
                      'ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block',
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}