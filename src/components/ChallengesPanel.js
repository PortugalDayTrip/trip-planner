import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../theme';

const Panel = styled.div`
  background: #fff;
  border-radius: 0.7rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  padding: 1rem;
  margin-bottom: 1rem;
`;
const BadgeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;
const BadgeCard = styled.div`
  background: ${props => (props.earned ? colors.primary : colors.border)};
  color: ${props => (props.earned ? '#fff' : colors.muted)};
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;
const ClueList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const ClueItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  & input {
    margin-right: 0.5rem;
  }
`;

const HIDDEN_GEMS = [
  { id: 1, clue: 'Find the street mural of the sardine' },
  { id: 2, clue: 'Locate the oldest bookstore in the city' },
  { id: 3, clue: 'Spot the tile fountain near the cathedral' }
];

export default function ChallengesPanel({ timelineDays }) {
  const [found, setFound] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('foundGems') || '{}');
    setFound(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('foundGems', JSON.stringify(found));
  }, [found]);

  // Count "viewpoint" visits for badge
  const viewpointCount = timelineDays.reduce((count, day) => {
    Object.values(day.slots).flat().forEach(item => {
      if (item.title.toLowerCase().includes('viewpoint')) count++;
    });
    return count;
  }, 0);
  const target = 5;
  const earnedViewpoint = viewpointCount >= target;

  return (
    <Panel>
      <h5 style={{ margin: '0 0 0.5rem' }}>Badges & Challenges</h5>
      <BadgeGrid>
        <BadgeCard earned={earnedViewpoint}>
          {earnedViewpoint ? '🏆' : '🔒'} Viewpoint Explorer ({viewpointCount}/{target})
        </BadgeCard>
      </BadgeGrid>
      <hr style={{ margin: '0.8rem 0' }} />
      <h6>Hidden-Gem Scavenger Hunt</h6>
      <ClueList>
        {HIDDEN_GEMS.map(gem => (
          <ClueItem key={gem.id}>
            <input
              type="checkbox"
              checked={!!found[gem.id]}
              onChange={() => setFound(prev => ({ ...prev, [gem.id]: !prev[gem.id] }))}
            />
            <span style={{ textDecoration: found[gem.id] ? 'line-through' : 'none' }}>
              {gem.clue}
            </span>
          </ClueItem>
        ))}
      </ClueList>
      {Object.values(found).every(v => v) && (
        <div style={{ marginTop: '0.6rem', color: colors.accent }}>
          🎉 All hidden gems found! Enjoy your reward.
        </div>
      )}
    </Panel>
  );
}
