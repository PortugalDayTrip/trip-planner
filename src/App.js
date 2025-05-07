import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Planner from "./components/Planner";
import { colors } from "../src/theme";
import NavTabs from "./components/NavTabs";
import MapView from "./components/MapView";
import ExportShare from "./components/ExportShare";
import Onboarding from "./components/Onboarding";
import Discover from "./components/Discover";
import PackingListPanel from "./components/PackingListPanel";
import { activitiesByCity as initialCityActivities } from "./data/activitiesByCity";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    background: ${colors.background};
    color: ${colors.text};
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
`;

const Header = styled.header`
  width: 100%;
  background: linear-gradient(90deg, ${colors.primary} 70%, ${colors.accent} 100%);
  color: #fff;
  padding: 1.2rem 0 1rem 0;
  box-shadow: 0 2px 12px rgba(42, 110, 187, 0.08);
  margin-bottom: 2rem;
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 2.1rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 1px;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: ${colors.card};
  border-radius: 1.25rem;
  box-shadow: 0 4px 32px ${colors.border};
`;

function App() {
  const [activeTab, setActiveTab] = React.useState("planner");
  const [days, setDays] = React.useState(() => {
    try {
      const data = localStorage.getItem("itinerary_days");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  const [profile, setProfile] = React.useState(() => {
    try {
      const data = localStorage.getItem("user_profile");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  // Merge static and persisted activities
  const initializeCityActivities = () => {
    const storedStr = localStorage.getItem("cityActivities");
    if (!storedStr) return initialCityActivities;
    let stored = {};
    try { stored = JSON.parse(storedStr); } catch { stored = {}; }
    const merged = {};
    Object.entries(initialCityActivities).forEach(([city, staticList]) => {
      const storedList = Array.isArray(stored[city]) ? stored[city] : [];
      const map = {};
      staticList.forEach(a => { map[a.title] = a; });
      storedList.forEach(a => { map[a.title] = a; });
      merged[city] = Object.values(map);
    });
    // include any extra cities from stored
    Object.entries(stored).forEach(([city, acts]) => {
      if (!merged[city]) merged[city] = acts;
    });
    return merged;
  };
  const [cityActivities, setCityActivities] = React.useState(initializeCityActivities);
  React.useEffect(() => {
    localStorage.setItem("cityActivities", JSON.stringify(cityActivities));
  }, [cityActivities]);

  const handleAddActivityToStore = (city, activity) => {
    setCityActivities(prev => ({
      ...prev,
      [city]: prev[city] ? [...prev[city], activity] : [activity]
    }));
  };

  // Keep days in sync with Planner changes
  const handleDaysChange = (newDays) => {
    setDays(newDays);
    localStorage.setItem("itinerary_days", JSON.stringify(newDays));
  };

  // Onboarding completion handler
  const handleOnboarding = (p) => {
    setProfile(p);
    localStorage.setItem("user_profile", JSON.stringify(p));
  };

  // Add sight from Discover to first day
  const handleAddSight = (activity) => {
    // save to central store
    handleAddActivityToStore(activity.city, activity);
    let newDays = days.length > 0 ? [...days] : [{ label: "Day 1", slots: { morning: [], lunch: [], afternoon: [], dinner: [], evening: [] } }];
    if (!newDays[0].slots) {
      newDays[0].slots = { morning: [], lunch: [], afternoon: [], dinner: [], evening: [] };
    }
    newDays[0].slots.morning = [...(newDays[0].slots.morning || []), { title: activity.title, desc: activity.desc, lat: activity.lat, lng: activity.lng }];
    handleDaysChange(newDays);
    setActiveTab("planner");
  };

  // Add activity from map click
  const handleAddActivityFromMap = (activity) => {
    let newDays = days.length > 0 ? [...days] : [{ label: "Day 1", slots: { morning: [], lunch: [], afternoon: [], dinner: [], evening: [] } }];
    if (!newDays[0].slots) {
      newDays[0].slots = { morning: [], lunch: [], afternoon: [], dinner: [], evening: [] };
    }
    newDays[0].slots.morning = [...(newDays[0].slots.morning || []), activity];
    handleDaysChange(newDays);
    setActiveTab("planner");
  };

  const tabs = [
    { key: "planner", label: "Itinerary" },
    { key: "discover", label: "Discover" },
    { key: "map", label: "Map" },
    { key: "packing", label: "Packing List" },
    { key: "export", label: "Export & Share" }
  ];

  return (
    <>
      <GlobalStyle />
      <Header>
        <AppTitle>PortugalDayTrip Travel Planner</AppTitle>
      </Header>
      <Wrapper>
        {!profile && <Onboarding onComplete={handleOnboarding} />}
        {profile && (
          <>
            <NavTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === "planner" && (
              <Planner
                days={days}
                setDays={handleDaysChange}
                activitiesByCity={cityActivities}
                startDate={profile?.startDate}
              />
            )}
            {activeTab === "discover" && <Discover onAdd={handleAddSight} activitiesByCity={cityActivities} addActivityToStore={handleAddActivityToStore} />}
            {activeTab === "map" && <MapView days={days} onAddActivity={handleAddActivityFromMap} />}
            {activeTab === "packing" && <PackingListPanel />}
            {activeTab === "export" && <ExportShare days={days} />}
          </>
        )}
      </Wrapper>
    </>
  );
}

export default App;
