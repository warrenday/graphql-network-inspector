import React, { useState } from "react";
import classes from "./Tabs.module.css";

export type Tab = {
  title: string;
  component: () => React.ReactNode;
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
    <div className={classes.container}>
      <div className={classes.tabs}>
        {leftContent && leftContent}
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`${classes.tab} ${i === activeTab && classes.tabActive}`}
            onClick={() => setActiveTab(i)}
          >
            <h2 className={classes.tabTitle}>{tab.title}</h2>
          </button>
        ))}
      </div>
      <div className={`${classes.tabContent} scroll`}>
        {tabs[activeTab].component()}
      </div>
    </div>
  );
};
