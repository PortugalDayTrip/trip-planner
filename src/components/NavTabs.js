import React from "react";
import styled from "styled-components";
import { colors } from "../theme";

const TabsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: ${colors.secondary};
  border-radius: 0.75rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 8px ${colors.border};
  @media (max-width: 600px) {
    gap: 0.25rem;
    padding: 0.25rem;
  }
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.8rem 0.5rem;
  background: ${({ active }) => (active ? colors.card : "transparent")};
  color: ${({ active }) => (active ? colors.primary : colors.muted)};
  border: none;
  border-radius: 0.5rem;
  font-size: 1.07rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  box-shadow: ${({ active }) => (active ? `0 2px 12px ${colors.highlight}` : "none")};
  @media (max-width: 600px) {
    font-size: 0.9rem;
    padding: 0.5rem 0.25rem;
  }
  &:hover {
    color: ${colors.primary};
    background: ${colors.highlight};
  }
`;

export default function NavTabs({ tabs, activeTab, onTabChange }) {
  return (
    <TabsBar>
      {tabs.map((tab, idx) => (
        <Tab
          key={tab.key}
          active={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </Tab>
      ))}
    </TabsBar>
  );
}
