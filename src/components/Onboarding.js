import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../theme";

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(42,110,187,0.12);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 8px 40px rgba(42,110,187,0.22);
  padding: 2.5rem 2rem 2rem 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
`;
const Title = styled.h2`
  color: ${colors.primary};
  margin-bottom: 1.2rem;
`;
const Subtitle = styled.p`
  color: ${colors.muted};
  margin-bottom: 2rem;
`;
const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  margin-bottom: 1.3rem;
  border: 1.5px solid ${colors.border};
  border-radius: 0.6rem;
  font-size: 1rem;
  outline: none;
  &:focus { border-color: ${colors.primary}; background: ${colors.highlight}; }
`;
const Label = styled.label`
  display: block;
  text-align: left;
  color: ${colors.text};
  font-weight: 500;
  margin-bottom: 0.3rem;
`;
const Button = styled.button`
  width: 100%;
  background: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 0.6rem;
  padding: 1rem 0;
  font-size: 1.08rem;
  font-weight: 700;
  margin-top: 0.7rem;
  cursor: pointer;
  transition: background 0.14s;
  &:hover { background: ${colors.accent}; }
`;
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.3rem;
`;
const Chip = styled.button`
  background: ${({ selected }) => (selected ? colors.primary : colors.secondary)};
  color: ${({ selected }) => (selected ? "#fff" : colors.text)};
  border: 1.5px solid ${colors.primary};
  border-radius: 1.2rem;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  &:hover { background: ${colors.accent}; color: #fff; }
`;

const INTERESTS = [
  "History & Culture",
  "Beaches",
  "Nature & Hiking",
  "Food & Wine",
  "Nightlife",
  "Family-Friendly",
  "Hidden Gems",
  "Museums & Art",
  "Shopping",
  "Adventure Sports"
];

export default function Onboarding({ onComplete }) {
  const [name, setName] = useState("");
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState("");
  const [interests, setInterests] = useState([]);
  const [pace, setPace] = useState("Balanced");

  const toggleInterest = (interest) => {
    setInterests(interests.includes(interest)
      ? interests.filter(i => i !== interest)
      : [...interests, interest]);
  };

  function handleSubmit(e) {
    e.preventDefault();
    onComplete({ name, days, interests, pace, startDate });
  }

  return (
    <Overlay>
      <Card>
        <Title>Welcome to Portugal Planner!</Title>
        <Subtitle>Let’s personalize your trip. Your answers help us suggest the best places and experiences.</Subtitle>
        <form onSubmit={handleSubmit}>
          <Label>Your Name (optional)</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex" />
          <Label>Trip Length (days)</Label>
          <Input type="number" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} />
          <Label>Trip Start Date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Label>What are your interests?</Label>
          <Chips>
            {INTERESTS.map(interest => (
              <Chip key={interest} type="button" selected={interests.includes(interest)} onClick={() => toggleInterest(interest)}>
                {interest}
              </Chip>
            ))}
          </Chips>
          <Label>Preferred Travel Pace</Label>
          <Chips>
            {["Relaxed", "Balanced", "Busy"].map(p => (
              <Chip key={p} type="button" selected={pace === p} onClick={() => setPace(p)}>{p}</Chip>
            ))}
          </Chips>
          <Button type="submit">Start Planning</Button>
        </form>
      </Card>
    </Overlay>
  );
}
