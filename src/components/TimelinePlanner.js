import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { colors } from "../theme";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { dayTemplatesByCity } from "../data/dayTemplatesByCity";
import { LoadScript, GoogleMap, DirectionsService, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';

// Get API key from environment
const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

if (!mapsApiKey) {
  console.error('Google Maps API key is missing. Please add it to your .env file.');
}

// Helper: Haversine distance between two lat/lng

// Helper: Haversine distance between two lat/lng
function getDistance(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return 0;
  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aVal = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1-aVal));
  return R * c;
}

// Day accent colors and helper to pick by index
const DAY_COLORS = [colors.primary, colors.accent || colors.muted, "#f59e42", "#2ec4b6", "#e63946", "#6a4c93"];
function getColorForDay(idx) {
  return DAY_COLORS[idx % DAY_COLORS.length];
}

const TimelineWrapper = styled.div`
  /* Flexible container for itinerary columns */
  flex: 1 1 280px;
  min-width: 280px;
  margin-bottom: 2.5rem;
  border-left: 4px solid ${props => props.color};
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  @media (max-width: 768px) {
    flex: 1 1 100%;
    min-width: 100%;
  }
`;
const ExpandBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.primary};
  font-size: 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
`;
const ToggleButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.primary};
  color: ${colors.primary};
  padding: 0.3rem 0.6rem;
  margin: 0 0.3rem;
  border-radius: 0.4rem;
  cursor: pointer;
  &:focus { outline: none; }
  &.active {
    background: ${colors.primary};
    color: #fff;
  }
`;
const DayHeader = styled.div`
  margin-bottom: 1.1rem;
  font-size: 1.18rem;
  font-weight: 700;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  gap: 1.5rem;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
`;
const CitySelect = styled.select`
  margin-right: 1.2rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid ${colors.border};
  font-size: 1rem;
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
  }
`;
const Slot = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;
const SlotLabel = styled.div`
  font-size: 1.03rem;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 0.7rem;
`;
const ActivityCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  transition: transform 0.1s, box-shadow 0.1s;
  &:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.12); }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;
const Img = styled.img`
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 0.5rem;
`;
const Title = styled.div`
  font-size: 1.07rem;
  font-weight: 600;
  color: ${colors.text};
`;
const Desc = styled.div`
  color: ${colors.muted};
  font-size: 0.97rem;
`;
const RemoveBtn = styled.button`
  margin-left: auto;
  background: #fff;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  border-radius: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.13s, color 0.13s;
  &:hover {
    background: ${colors.primary};
    color: #fff;
  }
`;
const AddBtn = styled.button`
  background: ${colors.accent};
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  font-size: 1.02rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  margin-top: 0.7rem;
  cursor: pointer;
  transition: background 0.13s;
  &:hover { background: ${colors.primary}; }
`;
const DeleteDayBtn = styled.button`
  margin-left: auto;
  background: #fff;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};
  border-radius: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.13s, color 0.13s;
  &:hover {
    background: ${colors.primary};
    color: #fff;
  }
`;
const OptimizeBtn = styled.button`
  margin-left: 0.8rem;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 0.98rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.13s;
  &:hover { background: ${colors.accent}; }
`;
const ActivitySelect = styled.select`
  margin-bottom: 0.4rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid ${colors.border};
  font-size: 1rem;
  width: 100%;
`;
const TitleInput = styled.input`
  font-size: 1.07rem;
  font-weight: 600;
  color: ${colors.text};
  padding: 0.4rem;
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const DescInput = styled.input`
  color: ${colors.muted};
  font-size: 0.97rem;
  padding: 0.4rem;
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const InfoBox = styled.div`
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid ${colors.border};
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  padding: 0.5rem 0.7rem;
  margin-top: 0.3rem;
  margin-bottom: 0.2rem;
  width: 100%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.5rem 0.5rem;
  }
  ul {
    padding-left: 1rem;
    margin: 0;
    list-style-position: inside;
    white-space: normal;
    word-break: break-word;
  }
  button {
    white-space: normal;
    word-break: break-word;
  }
`;
const TemplateSelect = styled.select`
  margin-left: 0.5rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid ${colors.border};
  font-size: 1rem;
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
  }
`;
const DayRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const Main = styled.div`
  display: flex;
  align-items: flex-start;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const LeftColumn = styled.div`
  flex: 1;
`;
const RightColumn = styled.div`
  flex: 0 0 320px;
  width: 100%;
  max-width: 320px;
  margin-left: 24px;
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  box-shadow: 0 1px 5px rgba(0,0,0,0.1);
  padding: 18px;
  min-height: 200px;
  word-break: break-word;
  white-space: normal;
  overflow-x: hidden;
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 1rem;
    max-width: 100%;
  }
`;
const SectionTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: ${colors.primary};
  word-break: break-word;
`;
const SubTitle = styled.div`
  margin: 8px 0 4px;
  font-weight: 600;
  word-break: break-word;
`;
const RightInfo = styled.div`
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 0.95rem;
  font-style: italic;
  color: ${colors.muted};
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 1rem;
  }
`;
const MapBtn = styled.button`
  background: ${colors.primary};
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.6rem;
  font-size: 0.95rem;
  cursor: pointer;
  &:hover { background: ${colors.accent}; }
`;
const DateLabel = styled.span`
  font-size: 0.9rem;
  color: ${colors.muted};
  margin-left: 0.5rem;
`;
const DateInput = styled.input`
  font-size: 0.9rem;
  color: ${colors.text};
  border: 1px solid ${colors.border};
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
  margin-left: 0.5rem;
`;

const TIME_SLOTS = [
  { key: "morning", label: "Morning" },
  { key: "lunch", label: "Lunch" },
  { key: "afternoon", label: "Afternoon" },
  { key: "dinner", label: "Dinner" },
  { key: "evening", label: "Evening" }
];

const CITIES = ["Lisbon", "Porto", "Faro", "Coimbra", "Évora", "Braga", "Sintra", "Aveiro"];

const LIBRARIES = ['places'];

const CITY_COORDS = {
  Lisbon: { lat: 38.7223, lon: -9.1393 },
  Porto: { lat: 41.1496, lon: -8.6109 },
  Faro: { lat: 37.0194, lon: -7.9304 },
  Coimbra: { lat: 40.2033, lon: -8.4103 },
  Évora: { lat: 38.5667, lon: -7.9 },
  Braga: { lat: 41.5454, lon: -8.4265 },
  Sintra: { lat: 38.8029, lon: -9.3817 },
  Aveiro: { lat: 40.6405, lon: -8.6538 },
};

const weatherDescriptions = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Depositing rime fog',51:'Light drizzle',53:'Moderate drizzle',55:'Dense drizzle',56:'Light freezing drizzle',57:'Dense freezing drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',66:'Light freezing rain',67:'Heavy freezing rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',77:'Snow grains',80:'Slight rain showers',81:'Moderate rain showers',82:'Violent rain showers',85:'Slight snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm with slight hail',99:'Thunderstorm with heavy hail'};

function mapWeatherCode(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌦️';
  if (code <= 77) return '🌨️';
  return '⛈️';
}

function mapWeatherText(code) {
  return weatherDescriptions[code] || '';
}

export default function TimelinePlanner({ days, setDays, activitiesByCity, startDate }) {
  // Structure: days = [{ label, slots: { morning: [activities], ... } }]
  // Fallback: migrate old days format (items array) to timeline format
  const migrateDays = (days) => {
    return days.map(day => {
      if (day.slots && day.city) return day;
      return {
        ...day,
        city: day.city || CITIES[0],
        slots: day.slots || { morning: day.items || [], lunch: [], afternoon: [], dinner: [], evening: [] }
      };
    });
  };
  const [timelineDays, setTimelineDays] = React.useState(() => migrateDays(days));
  const [transportModes, setTransportModes] = React.useState(() => timelineDays.map(() => 'driving'));
  const [routeSummaries, setRouteSummaries] = React.useState({});
  const [directions, setDirections] = React.useState({});
  const [expandedDays, setExpandedDays] = React.useState(() => timelineDays.map(() => false));
  const [mapInstances, setMapInstances] = React.useState({});
  const [selectedMarker, setSelectedMarker] = React.useState(null);
  const [markerDetails, setMarkerDetails] = React.useState({});
  const [markerDistances, setMarkerDistances] = React.useState({});
  const [activityDetails, setActivityDetails] = React.useState({});
  const [weather, setWeather] = useState({});
  const [dayDates, setDayDates] = useState([]);
  const handleDateChange = (idx, val) => {
    setDayDates(prev => {
      const nd = [...prev]; nd[idx] = val; return nd;
    });
  };

  React.useEffect(() => {
    setExpandedDays(timelineDays.map(() => false));
  }, [timelineDays.length]);

  // Determine Google Maps API key (env var fallback)
  const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDd0p2mnbP311RYnfei8rnmy__W74hUuPI';
  console.log('Google Maps API key:', mapsApiKey);

  React.useEffect(() => {
    setTimelineDays(migrateDays(days));
  }, [days]);

  // Prepare route points and compute distance/time
  const routePoints = React.useMemo(() => {
    const pts = [];
    timelineDays.forEach(day => {
      Object.values(day.slots).forEach(items => items.forEach(item => {
        if (item.lat != null && item.lng != null) pts.push([item.lat, item.lng]);
      }));
    });
    return pts;
  }, [timelineDays]);
  const totalDist = routePoints.reduce((sum, curr, idx, arr) =>
    idx > 0 ? sum + getDistance({ lat: arr[idx-1][0], lng: arr[idx-1][1] }, { lat: curr[0], lng: curr[1] }) : sum
  , 0);
  const totalTimeMin = Math.round((totalDist / 5) * 60);

  // Save to parent
  const updateDay = (dIdx, newSlots) => {
    const newDays = timelineDays.map((d, idx) => idx === dIdx ? { ...d, slots: newSlots } : d);
    setTimelineDays(newDays);
    setDays(newDays);
    setDirections(prev => ({ ...prev, [dIdx]: null }));
    setRouteSummaries(prev => ({ ...prev, [dIdx]: null }));
  };

  const removeActivity = (dIdx, slotKey, iIdx) => {
    const newSlots = { ...timelineDays[dIdx].slots };
    newSlots[slotKey] = newSlots[slotKey].filter((_, j) => j !== iIdx);
    updateDay(dIdx, newSlots);
  };

  // Remove a day
  const removeDay = (dIdx) => {
    const newDays = timelineDays.filter((_, idx) => idx !== dIdx);
    setTimelineDays(newDays);
    setDays(newDays);
  };

  // Update a field of an activity
  const updateActivity = (dIdx, slotKey, iIdx, field, value) => {
    const slots = { ...timelineDays[dIdx].slots };
    const items = [...slots[slotKey]];
    items[iIdx] = { ...items[iIdx], [field]: value };
    slots[slotKey] = items;
    updateDay(dIdx, slots);
  };

  // For demo: add empty activity
  const addActivity = (dIdx, slotKey) => {
    const newSlots = { ...timelineDays[dIdx].slots };
    newSlots[slotKey] = [...newSlots[slotKey], { title: "New Activity", desc: "", image: "" }];
    updateDay(dIdx, newSlots);
  };

  // Add a new day with empty slots
  const addDay = () => {
    const newDay = {
      label: `Day ${timelineDays.length + 1}`,
      slots: { morning: [], lunch: [], afternoon: [], dinner: [], evening: [] }
    };
    const newTimelineDays = [...timelineDays, newDay];
    setTimelineDays(newTimelineDays);
    setDays(newTimelineDays);
  };

  // Cross-day drag-and-drop
  const handleDragEndCross = (result) => {
  if (!result.destination) return;
  const [srcDayIdx, srcSlot] = result.source.droppableId.split("-");
  const [destDayIdx, destSlot] = result.destination.droppableId.split("-");
  const srcIndex = result.source.index;
  const destIndex = result.destination.index;
  const newTimeline = [...timelineDays];
  // remove from source
  const srcItems = Array.from(newTimeline[srcDayIdx].slots[srcSlot]);
  const [moved] = srcItems.splice(srcIndex, 1);
  // Check validSlots for destination
  const activities = activitiesByCity[newTimeline[destDayIdx].city] || [];
  const activity = activities.find(a => a.title === moved.title);
  if (activity && activity.validSlots && !activity.validSlots.includes(destSlot)) {
    alert('This activity is not available for this time slot.');
    return;
  }
  newTimeline[srcDayIdx].slots[srcSlot] = srcItems;
  // insert into destination
  const destItems = Array.from(newTimeline[destDayIdx].slots[destSlot]);
  destItems.splice(destIndex, 0, moved);
  newTimeline[destDayIdx].slots[destSlot] = destItems;
  setTimelineDays(newTimeline);
  setDays(newTimeline);
};

  const updateCity = (dIdx, city) => {
    const newDays = timelineDays.map((d, idx) => idx === dIdx ? { ...d, city } : d);
    setTimelineDays(newDays);
    setDays(newDays);
  };

  // Add day template for a city
  const addDayTemplate = (city) => {
    const templates = dayTemplatesByCity[city] || [];
    if (!templates.length) return;
    const newTimelineDays = [...timelineDays, ...templates.map(t => ({ ...t, label: `Day ${timelineDays.length + 1}`, city }))];
    setTimelineDays(newTimelineDays);
    setDays(newTimelineDays);
  };

  // Apply a template to an existing day
  const applyTemplate = (dIdx, templateIdx) => {
    const city = timelineDays[dIdx].city;
    const templates = dayTemplatesByCity[city] || [];
    const tmpl = templates[templateIdx];
    if (!tmpl) return;
    const newDays = timelineDays.map((d, idx) =>
      idx === dIdx ? { ...d, slots: tmpl.slots } : d
    );
    setTimelineDays(newDays);
    setDays(newDays);
    // Clear any existing directions and summaries for rerender
    setDirections(prev => ({ ...prev, [dIdx]: null }));
    setRouteSummaries(prev => ({ ...prev, [dIdx]: null }));
  };

  // Optimize activities for a day: minimize travel, fit valid slots
  const optimizeDay = (dIdx) => {
    const day = timelineDays[dIdx];
    const slots = Object.keys(day.slots);
    let activities = [];
    slots.forEach(slotKey => {
      (day.slots[slotKey] || []).forEach(item => {
        const act = (activitiesByCity[day.city] || []).find(a => a.title === item.title);
        if (act && act.validSlots && act.validSlots.includes(slotKey)) {
          activities.push({ ...item, slotKey });
        }
      });
    });
    // Simple greedy: start with morning, then pick next closest valid for next slot
    let ordered = [];
    let used = new Set();
    let prev = null;
    slots.forEach(slotKey => {
      let candidates = activities.filter(a => !used.has(a.title) && (!a.validSlots || a.validSlots.includes(slotKey)));
      if (candidates.length === 0) return;
      let next;
      if (!prev) {
        next = candidates[0];
      } else {
        next = candidates.reduce((min, curr) => {
          const d = getDistance(prev, curr);
          return d < getDistance(prev, min) ? curr : min;
        }, candidates[0]);
      }
      ordered.push({ ...next, slotKey });
      used.add(next.title);
      prev = next;
    });
    // Fill slots
    let newSlots = {};
    slots.forEach(slotKey => {
      newSlots[slotKey] = ordered.filter(a => a.slotKey === slotKey).map(a => ({ ...a }));
    });
    // Suggest fill for empty slots
    slots.forEach(slotKey => {
      if (!newSlots[slotKey] || newSlots[slotKey].length === 0) {
        // Find a valid activity not used yet
        const candidates = (activitiesByCity[day.city] || []).filter(a => (!used.has(a.title)) && (!a.validSlots || a.validSlots.includes(slotKey)));
        if (candidates.length > 0) {
          newSlots[slotKey] = [{ ...candidates[0] }];
          used.add(candidates[0].title);
        }
      }
    });
    const newTimeline = [...timelineDays];
    newTimeline[dIdx] = { ...day, slots: newSlots };
    setTimelineDays(newTimeline);
    setDays(newTimeline);
  };

  // Smart suggestions sidebar
  const getSuggestions = (day) => {
    let suggestions = [];
    const slots = Object.keys(day.slots);
    // Fill gaps
    slots.forEach(slotKey => {
      if (!day.slots[slotKey] || day.slots[slotKey].length === 0) {
        const candidates = (activitiesByCity[day.city] || []).filter(a => a.validSlots && a.validSlots.includes(slotKey));
        if (candidates.length > 0) {
          suggestions.push({ type: 'fill', slotKey, activity: candidates[0] });
        }
      }
    });
    // Warn about conflicts (duplicate activities)
    let seen = new Set();
    slots.forEach(slotKey => {
      (day.slots[slotKey] || []).forEach(item => {
        if (seen.has(item.title)) {
          suggestions.push({ type: 'conflict', slotKey, activity: item });
        }
        seen.add(item.title);
      });
    });
    // Suggest alternatives
    slots.forEach(slotKey => {
      (day.slots[slotKey] || []).forEach(item => {
        const alternatives = (activitiesByCity[day.city] || []).filter(a => a.title !== item.title && a.validSlots && a.validSlots.includes(slotKey));
        if (alternatives.length > 0) {
          suggestions.push({ type: 'alternative', slotKey, activity: item, alternatives });
        }
      });
    });
    return suggestions;
  };

  // Transport mode per day
  const updateMode = (idx, mode) => {
    setTransportModes(m => m.map((v, i) => i === idx ? mode : v));
    setRouteSummaries(s => ({ ...s, [idx]: null }));
    // Clear directions when mode changes to refetch route
    setDirections(prev => ({ ...prev, [idx]: null }));
  };

  // Responsive view toggles (per day): 'both', 'map', 'agenda'
  const [viewModes, setViewModes] = React.useState(() => timelineDays.map(() => 'both'));
  React.useEffect(() => { setViewModes(timelineDays.map(() => 'both')); }, [timelineDays.length]);
  const toggleView = (idx, mode) => setViewModes(vm => vm.map((v,i) => i===idx ? mode : v));

  const toggleExpand = idx => setExpandedDays(ed => ed.map((v,i) => i===idx ? !v : v));

  const handleMarkerClick = (dIdx, mIdx, position, item) => {
    console.log('[TimelinePlanner] handleMarkerClick', { dIdx, mIdx, position, item, map: mapInstances[dIdx] });
    try {
      setSelectedMarker({ dIdx, mIdx, position });
      const map = mapInstances[dIdx];
      const service = new window.google.maps.places.PlacesService(map);
      service.findPlaceFromQuery({ query: item.title, location: position, radius: 50, fields: ['place_id'] }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
          service.getDetails({ placeId: results[0].place_id, fields: ['rating', 'opening_hours', 'photos'] }, (res, st) => {
            if (st === window.google.maps.places.PlacesServiceStatus.OK) {
              setMarkerDetails(prev => ({ ...prev, [`${dIdx}-${mIdx}`]: res }));
            }
          });
          const dm = new window.google.maps.DistanceMatrixService();
          dm.getDistanceMatrix({ origins: [map.getCenter()], destinations: [position], travelMode: window.google.maps.TravelMode.DRIVING, unitSystem: window.google.maps.UnitSystem.METRIC }, (resp, stat) => {
            if (stat === window.google.maps.DistanceMatrixStatus.OK) {
              const driveTime = resp.rows[0].elements[0].duration.text;
              dm.getDistanceMatrix({ origins: [map.getCenter()], destinations: [position], travelMode: window.google.maps.TravelMode.WALKING, unitSystem: window.google.maps.UnitSystem.METRIC }, (resp2, stat2) => {
                if (stat2 === window.google.maps.DistanceMatrixStatus.OK) {
                  const walkTime = resp2.rows[0].elements[0].duration.text;
                  setMarkerDistances(prev => ({ ...prev, [`${dIdx}-${mIdx}`]: { driving: driveTime, walking: walkTime } }));
                }
              });
            }
          });
        }
      });
    } catch(err) {
      console.error('[TimelinePlanner] handleMarkerClick failed', err);
    }
  };

  const fetchActivityDetails = (dIdx, slotKey, iIdx, item) => {
    const key = `${dIdx}-${slotKey}-${iIdx}`;
    if (activityDetails[key]) return;
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('[TimelinePlanner] Places API not loaded');
      return;
    }
    const svc = new window.google.maps.places.PlacesService(document.createElement('div'));
    svc.textSearch({ query: item.title, location: { lat: item.lat, lng: item.lng }, radius: 100 }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        svc.getDetails({
          placeId: results[0].place_id,
          fields: ['formatted_address','website','url','rating','opening_hours','photos']
        }, (res, st) => {
          if (st === window.google.maps.places.PlacesServiceStatus.OK) {
            setActivityDetails(prev => ({ ...prev, [key]: res }));
          }
        });
      } else {
        console.warn('[TimelinePlanner] textSearch status', status);
      }
    });
  };

  // Pre-fetch photos for all activities on load
  React.useEffect(() => {
    // Clear old details so pictures update on activity change
    setActivityDetails({});
    timelineDays.forEach((day, dIdx) =>
      TIME_SLOTS.forEach(slot =>
        (day.slots[slot.key] || []).forEach((item, iIdx) => {
          if (item.lat != null && item.lng != null) {
            fetchActivityDetails(dIdx, slot.key, iIdx, item);
          }
        })
      )
    );
  }, [timelineDays]);

  // Open itinerary in Google Maps for turn-by-turn navigation
  const openMaps = (dIdx) => {
    const day = timelineDays[dIdx];
    const coords = [];
    Object.values(day.slots).forEach(arr => arr.forEach(item => {
      if (item.lat != null && item.lng != null) coords.push(`${item.lat},${item.lng}`);
    }));
    if (coords.length < 2) {
      return alert('Need at least two points to open navigation.');
    }
    const origin = coords[0];
    const destination = coords[coords.length - 1];
    const waypoints = coords.slice(1, -1).join('|');
    const mode = transportModes[dIdx] || 'driving';
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    window.open(url, '_blank');
  };

  // Initialize per-day dates based on first day date or startDate
  React.useEffect(() => {
    const base = dayDates[0] || startDate;
    if (!base || !timelineDays.length) return;
    setDayDates(timelineDays.map((_, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0,10);
    }));
  }, [startDate, dayDates[0], timelineDays]);

  // Fetch weather for each selected date
  React.useEffect(() => {
    if (!dayDates.length || !timelineDays.length) return;
    dayDates.forEach((iso, dIdx) => {
      const coords = CITY_COORDS[timelineDays[dIdx].city];
      if (!coords) return;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${iso}&end_date=${iso}&timezone=Europe/London`)
        .then(res => res.json())
        .then(data => {
          if (data?.daily) {
            const code = data.daily.weathercode[0];
            const max = data.daily.temperature_2m_max[0];
            const min = data.daily.temperature_2m_min[0];
            setWeather(prev => ({ ...prev, [dIdx]: { code, max, min } }));
          }
        });
    });
  }, [dayDates, timelineDays]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={LIBRARIES}
      language="en"
      region="US"
    >
      <DragDropContext onDragEnd={handleDragEndCross}>
        <Main>
          <LeftColumn>
            {timelineDays.map((day, dIdx) => {
              const accent = getColorForDay(dIdx);
              const mode = transportModes[dIdx] || 'driving';
               return (
              <DayRow key={dIdx}>
                <TimelineWrapper color={accent}>
                  {dIdx === 0 ? (
                    <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
                      <label style={{ marginRight: '0.5rem' }}>Date:</label>
                      <DateInput
                        type="date"
                        value={dayDates[0] || ''}
                        onChange={e => handleDateChange(0, e.target.value)}
                      />
                    </div>
                  ) : (
                    dayDates[0] && (
                      <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                        <DateLabel>
                          {(() => {
                            const dt = new Date(dayDates[0]);
                            dt.setDate(dt.getDate() + dIdx);
                            return `${dt.getDate()}/${dt.getMonth() + 1}`;
                          })()}
                        </DateLabel>
                      </div>
                    )
                  )}
                  <DayHeader>
                    <ExpandBtn onClick={() => toggleExpand(dIdx)}>
                      {expandedDays[dIdx] ? '▲ Hide Details' : '▼ Show Details'}
                    </ExpandBtn>
                    <span style={{marginRight:8, fontWeight:600}}>{day.label}</span>
                    <DeleteDayBtn onClick={() => removeDay(dIdx)}>Delete Day</DeleteDayBtn>
                    <CitySelect value={day.city} onChange={e => updateCity(dIdx, e.target.value)}>
                      {CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </CitySelect>
                    <TemplateSelect defaultValue="" onChange={e => applyTemplate(dIdx, e.target.value)}>
                      <option value="" disabled>Templates</option>
                      {(dayTemplatesByCity[day.city] || []).slice(0,5).map((tmpl, idx) => (
                        <option key={idx} value={idx}>{tmpl.label}</option>
                      ))}
                    </TemplateSelect>
                    <OptimizeBtn onClick={() => optimizeDay(dIdx)}>Optimize Day</OptimizeBtn>
                  </DayHeader>
                  {(() => {
                    const itemsArray = Object.values(day.slots)
                      .flat()
                      .filter(i => i.lat != null && i.lng != null);
                    const pts = itemsArray.map(i => ({ lat: i.lat, lng: i.lng }));
                    if (pts.length < 2) return null;
                    const origin = pts[0];
                    const destination = pts[pts.length - 1];
                    const waypts = pts.slice(1, -1).map(p => ({ location: p, stopover: true }));
                    return (
                      <div style={{ margin: '1rem 0' }}>
                        <GoogleMap
                          key={`map-${dIdx}-${mode}`}
                          mapContainerStyle={{ height: 200, width: '100%' }}
                          center={origin}
                          zoom={12}
                          options={{ disableDefaultUI: true }}
                          onLoad={map => setMapInstances(m => ({ ...m, [dIdx]: map }))}
                        >
                          {!directions[dIdx] && (
                            <DirectionsService
                              options={{
                                origin,
                                destination,
                                travelMode: mode.toUpperCase(),
                                waypoints: waypts,
                                ...(mode === 'transit' ? { transitOptions: { departureTime: new Date() } } : {})
                              }}
                              callback={res => {
                                if (res && res.status === 'OK') {
                                  setDirections(prev => ({ ...prev, [dIdx]: res }));
                                  const legs = res.routes[0].legs;
                                  const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
                                  const totalTime = legs.reduce((sum, leg) => sum + leg.duration.value, 0);
                                  setRouteSummaries(prev => ({ ...prev, [dIdx]: { totalDistance, totalTime } }));
                                } else console.error('Directions error:', res);
                              }}
                            />
                          )}
                          {directions[dIdx] && (
                            <DirectionsRenderer directions={directions[dIdx]} options={{ suppressMarkers: false }} />
                          )}
                          {pts.map((pt, mIdx) => {
                            const item = itemsArray[mIdx];
                            return (
                              <Marker key={mIdx} position={pt} onClick={() => handleMarkerClick(dIdx, mIdx, pt, item)} />
                            );
                          })}
                          {selectedMarker && selectedMarker.dIdx === dIdx && (
                            <InfoWindow position={selectedMarker.position} onCloseClick={() => setSelectedMarker(null)}>
                              <div style={{ maxWidth: 200 }}>
                                <b>{itemsArray[selectedMarker.mIdx].title}</b><br/>
                                <span style={{ fontSize: '0.9rem', color: colors.muted }}>
                                  {day.label} — {itemsArray[selectedMarker.mIdx].slot}
                                </span>
                                {markerDetails[`${dIdx}-${selectedMarker.mIdx}`] ? (
                                  <>
                                    {markerDetails[`${dIdx}-${selectedMarker.mIdx}`].rating && <div>⭐ {markerDetails[`${dIdx}-${selectedMarker.mIdx}`].rating}</div>}
                                    {markerDetails[`${dIdx}-${selectedMarker.mIdx}`].opening_hours && <div style={{ fontSize: '0.8rem' }}>{markerDetails[`${dIdx}-${selectedMarker.mIdx}`].opening_hours.weekday_text.join(', ')}</div>}
                                    {markerDetails[`${dIdx}-${selectedMarker.mIdx}`].photos && markerDetails[`${dIdx}-${selectedMarker.mIdx}`].photos.length > 0 && (
                                      <img src={markerDetails[`${dIdx}-${selectedMarker.mIdx}`].photos[0].getUrl({ maxWidth: 150 })} alt='' style={{ width: '100%', marginTop: 4, borderRadius: 4 }} />
                                    )}
                                  </>
                                ) : (
                                  <div style={{ marginTop: 8, fontSize: '0.85rem' }}>Loading details…</div>
                                )}
                                {markerDistances[`${dIdx}-${selectedMarker.mIdx}`] && (
                                  <div style={{ marginTop: 8 }}>
                                    <div>Drive: {markerDistances[`${dIdx}-${selectedMarker.mIdx}`].driving}</div>
                                    <div>Walk: {markerDistances[`${dIdx}-${selectedMarker.mIdx}`].walking}</div>
                                  </div>
                                )}
                              </div>
                            </InfoWindow>
                          )}
                        </GoogleMap>
                        <div style={{ margin: '0.5rem 0' }}>
                          <label>Mode: </label>
                          <select value={mode} onChange={e => updateMode(dIdx, e.target.value)}>
                            <option value="driving">Drive</option>
                            <option value="walking">Walk</option>
                            <option value="transit">Transit</option>
                          </select>
                        </div>
                        <div style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                          {routeSummaries[dIdx]
                            ? `Distance: ${(routeSummaries[dIdx].totalDistance / 1000).toFixed(2)} km, Time: ${Math.round(routeSummaries[dIdx].totalTime / 60)} min`
                            : 'Calculating...'}
                        </div>
                      </div>
                    );
                  })()}
                  {expandedDays[dIdx] && TIME_SLOTS.map(slot => (
                    <Slot key={slot.key}>
                      <SlotLabel>{slot.label}</SlotLabel>
                      <Droppable droppableId={`${dIdx}-${slot.key}`}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {(day.slots[slot.key] || []).map((item, iIdx) => (
                              <Draggable
                                key={`${dIdx}-${slot.key}-${iIdx}`}
                                draggableId={`${dIdx}-${slot.key}-${iIdx}`}
                                index={iIdx}
                              >
                                {(provided) => (
                                  <ActivityCard
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div>
                                      <ActivitySelect
                                        value={item.title}
                                        onChange={e => {
                                          const selected = (activitiesByCity[day.city] || []).find(a => a.title === e.target.value);
                                          if (selected && selected.validSlots && !selected.validSlots.includes(slot.key)) {
                                            alert('This activity is not available for this time slot.');
                                            return;
                                          }
                                          if (selected) {
                                            const slots = { ...timelineDays[dIdx].slots };
                                            const items = [...slots[slot.key]];
                                            items[iIdx] = {
                                              ...items[iIdx],
                                              title: selected.title,
                                              desc: selected.desc,
                                              lat: selected.lat,
                                              lng: selected.lng
                                            };
                                            slots[slot.key] = items;
                                            updateDay(dIdx, slots);
                                          } else {
                                            updateActivity(dIdx, slot.key, iIdx, 'title', e.target.value);
                                          }
                                        }}
                                      >
                                        <option value="">Select activity...</option>
                                        {(activitiesByCity[day.city] || []).map(opt => (
                                          <option key={opt.title} value={opt.title}>{opt.title}</option>
                                        ))}
                                      </ActivitySelect>
                                      <TitleInput
                                        value={item.title}
                                        onChange={e => updateActivity(dIdx, slot.key, iIdx, 'title', e.target.value)}
                                        placeholder="Title"
                                      />
                                      <DescInput
                                        value={item.desc}
                                        onChange={e => updateActivity(dIdx, slot.key, iIdx, 'desc', e.target.value)}
                                        placeholder="Description"
                                      />
                                      <InfoBox style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {activityDetails[`${dIdx}-${slot.key}-${iIdx}`]?.photos ? (
                                          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '0.5rem', width: '100%' }}>
                                            {activityDetails[`${dIdx}-${slot.key}-${iIdx}`].photos.slice(0, 3).map((photo, pIdx) => (
                                              <Img
                                                key={pIdx}
                                                src={photo.getUrl({ maxWidth: 200 })}
                                                alt={`${item.title} photo ${pIdx + 1}`}
                                                style={{ flex: '0 0 auto', width: '100px', height: '80px', objectFit: 'cover', borderRadius: '0.3rem' }}
                                              />
                                            ))}
                                          </div>
                                        ) : (
                                          <div style={{ padding: '1rem', color: colors.muted }}>Loading images…</div>
                                        )}
                                        {item.desc && (
                                          <Desc style={{ marginTop:'0.5rem', color:colors.text }}>{item.desc}</Desc>
                                        )}
                                        {activityDetails[`${dIdx}-${slot.key}-${iIdx}`]?.rating && (
                                          <div style={{ marginTop:'0.4rem', fontSize:'0.95rem' }}>
                                            <b>Rating:</b> ⭐ {activityDetails[`${dIdx}-${slot.key}-${iIdx}`].rating}
                                          </div>
                                        )}
                                        {activityDetails[`${dIdx}-${slot.key}-${iIdx}`]?.website && (
                                          <a
                                            href={activityDetails[`${dIdx}-${slot.key}-${iIdx}`].website}
                                            target="_blank"
                                            rel="noopener"
                                            style={{ marginTop:'0.4rem', color: colors.primary, textDecoration: 'underline' }}
                                          >
                                            Visit Website
                                          </a>
                                        )}
                                      </InfoBox>
                                    </div>
                                    <RemoveBtn onClick={() => removeActivity(dIdx, slot.key, iIdx)}>Remove</RemoveBtn>
                                  </ActivityCard>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      <AddBtn onClick={() => addActivity(dIdx, slot.key)}>+ Add Activity</AddBtn>
                    </Slot>
                  ))}
                </TimelineWrapper>
                <RightColumn>
                  <SectionTitle>Contextual Tips & Data</SectionTitle>
                  <SubTitle>Weather Forecast</SubTitle>
                  {weather[dIdx] ? (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <span role="img" aria-label="weather" style={{ fontSize: '1.2rem', marginRight: 6 }}>
                        {mapWeatherCode(weather[dIdx].code)}
                      </span>
                      {mapWeatherText(weather[dIdx].code)}, High {weather[dIdx].max}°C / Low {weather[dIdx].min}°C
                    </div>
                  ) : (
                    <div>Loading weather...</div>
                  )}
                  <SubTitle>Opening Hours</SubTitle>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {Object.values(day.slots).flat().map((item, idx) => (
                      <li key={idx}>{item.title}: Open 9am–5pm</li>
                    ))}
                  </ul>
                  <SubTitle>Estimated Costs</SubTitle>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {Object.values(day.slots).flat().map((item, idx) => (
                      <li key={idx}>{item.title}: €15</li>
                    ))}
                  </ul>
                  <SectionTitle>Routing & Timing</SectionTitle>
                  <SubTitle>Optimal Sequence</SubTitle>
                  <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>Auto‑arranged to minimize back‑tracking</div>
                  <SubTitle>Live Transit</SubTitle>
                  <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>Bus ~7 min | Train ~15 min</div>
                  <MapBtn onClick={() => openMaps(dIdx)} style={{ marginTop: '0.8rem' }}>
                    Open in Google Maps
                  </MapBtn>
                </RightColumn>
              </DayRow>
              );
            })}
            <AddBtn onClick={() => addDay()}>+ Add Day</AddBtn>
          </LeftColumn>
        </Main>
      </DragDropContext>
    </LoadScript>
  );
}
