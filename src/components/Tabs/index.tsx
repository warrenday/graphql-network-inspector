import React, { useState } from "react";
import cx from "classnames";

export type Tab = {
  title: string;
  component: React.ReactNode;
};

export type TabsProps = {
  tabs: Tab[];
  leftContent?: React.ReactNode;
  defaultActiveTab?: number;
};

export const Tabs = (props: TabsProps) => {
  const { tabs, leftContent, defaultActiveTab = 0 } = props;
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex border-b border-gray-600">
        {leftContent && leftContent}
        {tabs.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={i}
              className={cx("px-4 py-2 bg-none", {
                "bg-gray-700": isActive,
                "text-gray-400": !isActive,
              })}
              onClick={() => setActiveTab(i)}
            >
              <h2 className="font-bold">{tab.title}</h2>
            </button>
          );
        })}
      </div>
      <div className="scroll">{tabs[activeTab].component}</div>
    </div>
  );
};
