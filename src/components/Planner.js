import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../theme";
import TimelinePlanner from "./TimelinePlanner";

const PlannerWrapper = styled.div`
  padding: 1.5rem 0 2rem 0;
`;

function loadDays() {
  try {
    const data = localStorage.getItem("itinerary_days");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDays(days) {
  localStorage.setItem("itinerary_days", JSON.stringify(days));
}

function convertLegacyDays(days) {
  return days.map(day => ({
    label: day.label,
    items: day.items.map(item => ({ title: item.title, time: null })),
  }));
}

export default function Planner({ days, setDays, activitiesByCity, startDate }) {
  // Delegate to TimelinePlanner, passing down activitiesByCity
  return (
    <TimelinePlanner
      days={days}
      setDays={setDays}
      activitiesByCity={activitiesByCity}
      startDate={startDate}
    />
  );
}
