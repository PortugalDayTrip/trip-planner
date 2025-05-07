import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../theme';

// Required items for Portugal travel
const REQUIRED_ITEMS = ['Passport','Travel Adapter','Sunscreen','Sunglasses','Comfortable Shoes','Light Jacket','Raincoat','Reusable Water Bottle'];

const Panel = styled.div`
  background: #fff;
  border-radius: 0.7rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.1);
  padding: 1rem;
  margin-bottom: 1rem;
`;
const Title = styled.h5`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: ${colors.primary};
`;
const SubTitle = styled.h6`
  margin: 0.75rem 0 0.5rem;
  font-size: 0.9rem;
  color: ${colors.text};
`;
const ProgressWrapper = styled.div`
  width: 100%;
  background: ${colors.border};
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.8rem;
`;
const ProgressBar = styled.div`
  width: ${props => props.percent}%;
  background: ${colors.primary};
  height: 100%;
  transition: width 0.3s ease;
`;
const InputRow = styled.div`
  display: flex;
  margin-bottom: 0.8rem;
`;
const ItemInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${colors.border};
  border-radius: 0.4rem;
`;
const AddButton = styled.button`
  background: ${colors.primary};
  color: #fff;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 0.4rem;
  margin-left: 0.5rem;
  cursor: pointer;
  &:hover { background: ${colors.accent}; }
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.4rem;
  border-bottom: 1px solid ${colors.border};
  transition: background 0.2s;
  &:hover { background: ${colors.background}; }
`;
const Checkbox = styled.input`
  margin-right: 0.5rem;
`;
const RemoveBtn = styled.button`
  margin-left: auto;
  background: transparent;
  color: ${colors.muted};
  border: none;
  cursor: pointer;
`;

export default function PackingListPanel() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  // Required items progress
  const requiredList = items.filter(i => i.required);
  const requiredDoneCount = requiredList.filter(i => i.done).length;
  const totalRequired = requiredList.length;
  const progressPercent = totalRequired ? (requiredDoneCount / totalRequired) * 100 : 0;

  // Initialize with required items merged
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('packingList') || '[]');
    let merged = [...stored];
    REQUIRED_ITEMS.forEach(text => {
      if (!merged.find(i => i.text === text)) merged.push({ id: `req-${text}`, text, done: false, required: true });
    });
    merged = merged.map(i => ({ ...i, required: REQUIRED_ITEMS.includes(i.text) }));
    setItems(merged);
  }, []);

  const addItem = () => {
    if (!input.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), text: input.trim(), done: false, required: false }]);
    setInput('');
  };

  const toggleDone = id => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const removeItem = id => {
    // only remove optional items
    setItems(prev => prev.filter(item => item.required || item.id !== id));
  };

  return (
    <Panel>
      <Title>Packing Checklist</Title>
      <SubTitle>Required Items ({requiredDoneCount}/{totalRequired})</SubTitle>
      <ProgressWrapper><ProgressBar percent={progressPercent} /></ProgressWrapper>
      <List>
        {items.filter(item => item.required).map(item => (
          <ListItem key={item.id}>
            <Checkbox type="checkbox" checked={item.done} onChange={() => toggleDone(item.id)} />
            <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? colors.muted : colors.text }}>
              {item.text}
            </span>
          </ListItem>
        ))}
      </List>
      <SubTitle>Additional Items</SubTitle>
      <InputRow>
        <ItemInput
          placeholder="Add an item..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <AddButton onClick={addItem}>Add</AddButton>
      </InputRow>
      <List>
        {items.filter(item => !item.required).map(item => (
          <ListItem key={item.id}>
            <Checkbox type="checkbox" checked={item.done} onChange={() => toggleDone(item.id)} />
            <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? colors.muted : colors.text }}>
              {item.text}
            </span>
            <RemoveBtn onClick={() => removeItem(item.id)}>✕</RemoveBtn>
          </ListItem>
        ))}
      </List>
    </Panel>
  );
}
