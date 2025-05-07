import React, { useState, useRef, useEffect } from "react";
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import styled from "styled-components";
import { colors } from "../theme";

const Sidebar = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 260px;
  height: 100%;
  background: #fff;
  border-radius: 1rem 0 0 1rem;
  box-shadow: 2px 0 18px rgba(42,110,187,0.11);
  z-index: 1001;
  padding: 1.2rem 1rem 1rem 1rem;
  overflow-y: auto;
  @media (max-width: 600px) {
    position: relative;
    width: 100%;
    height: auto;
    border-radius: 1rem;
    box-shadow: none;
    margin-bottom: 1rem;
  }
`;
const Activity = styled.div`
  margin-bottom: 1.1rem;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid ${colors.border};
`;
const DayLabel = styled.div`
  font-weight: 700;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
`;
const AddBtn = styled.button`
  background: ${colors.accent};
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  font-size: 1.02rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.13s;
  &:hover { background: ${colors.primary}; }
`;

const DAY_COLORS = [colors.primary, colors.accent, "#f59e42", "#2ec4b6", "#e63946", "#6a4c93"];

function getColorForDay(idx) {
  return DAY_COLORS[idx % DAY_COLORS.length];
}

const CITY_COORDS = {
  Lisbon: { lat: 38.7223, lon: -9.1393 },
  Porto: { lat: 41.1496, lon: -8.6109 },
  Faro: { lat: 37.0194, lon: -7.9304 },
  Coimbra: { lat: 40.2033, lon: -8.4103 },
  Évora: { lat: 38.5667, lon: -7.9 },
  Braga: { lat: 41.5454, lon: -8.4265 },
  Sintra: { lat: 38.8029, lon: -9.3817 },
  Aveiro: { lat: 40.6405, lon: -8.6538 }
};

// Map style to disable business POIs
const mapStyles = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] }
];

export default function MapView({ days, onAddActivity }) {
  const cityMarkers = days.map((day, idx) => {
    const c = CITY_COORDS[day.city];
    return c ? { position: { lat: c.lat, lng: c.lon }, label: `${idx+1}`, city: day.city } : null;
  }).filter(Boolean);

  const [selected, setSelected] = useState(null);
  const [map, setMap] = useState(null);

  return (
    <LoadScript googleMapsApiKey="AIzaSyDd0p2mnbP311RYnfei8rnmy__W74hUuPI" libraries={["places"]}>
      <div style={{ position: "relative", height: 500, margin: "2rem 0", borderRadius: "1rem", overflow: "hidden" }}>
        <Sidebar>
          <h3 style={{ color: colors.primary, marginTop: 0 }}>All Activities</h3>
          {days.map((day, dIdx) => (
            <div key={dIdx}>
              <DayLabel style={{ color: getColorForDay(dIdx) }}>{day.label}</DayLabel>
              {Object.entries(day.slots || { morning: day.items || [] }).map(([slot, items]) => (
                <div key={slot} style={{ marginBottom: "0.4rem" }}>
                  <span style={{ fontWeight: 500, color: colors.muted }}>{slot.charAt(0).toUpperCase() + slot.slice(1)}:</span>
                  {items.length === 0 && <span style={{ color: colors.border, marginLeft: 8 }}>—</span>}
                  {items.map((item, iIdx) => (
                    <Activity key={iIdx}>
                      <span style={{ fontWeight: 500 }}>{item.title}</span>
                      {item.lat && item.lng && (
                        <span style={{ color: colors.primary, marginLeft: 6, fontSize: "0.95em" }}>📍</span>
                      )}
                    </Activity>
                  ))}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "1.5rem", fontSize: "0.98em", color: colors.muted }}>
            <b>Tip:</b> Click anywhere on the map to add a new activity!
          </div>
        </Sidebar>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onLoad={mapInstance => {
            setMap(mapInstance);
            const bounds = new window.google.maps.LatLngBounds();
            cityMarkers.forEach(m => bounds.extend(m.position));
            mapInstance.fitBounds(bounds);
          }}
          options={{ styles: mapStyles }}
          onClick={e => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const title = prompt("Enter activity title:");
            if (title) onAddActivity({ title, lat, lng });
          }}
        >
          {cityMarkers.map((m, i) => (
            <Marker key={i} position={m.position} label={m.label} onClick={() => setSelected(m)} />
          ))}
          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              options={{ maxWidth: 300 }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ maxWidth: '100%', maxHeight: '80vh', overflowY: 'auto', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                <b>{selected.city}</b><br />
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  );
}
