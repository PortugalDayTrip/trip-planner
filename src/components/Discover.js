import React from "react";
import styled from "styled-components";
import { colors } from "../theme";
import { useState, useEffect } from "react";

// Fallback image URL
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515027333344-9c34c377f51e?w=400&h=200&fit=crop';
const FALLBACK_IMAGES = {
  default: 'https://images.unsplash.com/photo-1531403943-332222688857-15952bccc8c7?w=400&h=200&fit=crop',
  travel: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop',
  city: 'https://images.unsplash.com/photo-1562696128-6f803b61c63c?w=400&h=200&fit=crop',
  culture: 'https://images.unsplash.com/photo-1515027333344-9c34c377f51e?w=400&h=200&fit=crop'
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 2rem;
  margin: 2.5rem 0 1.5rem 0;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 1.1rem;
  box-shadow: 0 2px 16px ${colors.border};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const Img = styled.img`
  width: 100%;
  height: 170px;
  object-fit: cover;
  background: #f0f0f0;
  display: block;
`;
const CardBody = styled.div`
  padding: 1.1rem 1.1rem 0.7rem 1.1rem;
  flex: 1;
`;
const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  color: ${colors.primary};
  font-size: 1.15rem;
`;
const Desc = styled.p`
  color: ${colors.muted};
  font-size: 0.99rem;
  margin: 0 0 0.7rem 0;
`;
const Tags = styled.div`
  margin-bottom: 0.7rem;
`;
const Tag = styled.span`
  display: inline-block;
  background: ${colors.highlight};
  color: ${colors.primary};
  border-radius: 0.7rem;
  font-size: 0.93rem;
  padding: 0.23rem 0.9rem;
  margin-right: 0.5rem;
  margin-bottom: 0.2rem;
`;
const AddBtn = styled.button`
  background: ${colors.accent};
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  font-size: 1.02rem;
  font-weight: 600;
  padding: 0.7rem 0;
  width: 100%;
  margin-top: 0.7rem;
  cursor: pointer;
  transition: background 0.13s;
  &:hover { background: ${colors.primary}; }
`;
const TabList = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;
const TabItem = styled.button`
  background: ${({ active }) => active ? colors.primary : "#fff"};
  color: ${({ active }) => active ? "#fff" : colors.text};
  border: 1px solid ${colors.primary};
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: ${colors.primary};
    color: #fff;
  }
`;
const CitySection = styled.div`
  margin-bottom: 3rem;
`;
const CityTitle = styled.h2`
  color: ${colors.primary};
  margin: 2rem 0 1rem;
`;

export default function Discover({ onAdd, activitiesByCity }) {
  const cityList = Object.keys(activitiesByCity);
  const [selectedCity, setSelectedCity] = React.useState(cityList[0] || "");
  const activities = activitiesByCity[selectedCity] || [];

  const [imageErrors, setImageErrors] = useState({});

  // Use Google Maps Static API for images
  useEffect(() => {
    activities.forEach(act => {
      if (act.lat && act.lng) {
        // Construct the static map URL
        const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${act.lat},${act.lng}&zoom=15&size=400x200&maptype=roadmap&markers=color:red%7C${act.lat},${act.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        act.imageUrl = imageUrl;
      }
    });
  }, [activities]);

  useEffect(() => {
    const fetchImages = async () => {
      const errorMap = {};
      for (const act of activities) {
        try {
          const imageUrl = await getImageUrl(act.title);
          errorMap[act.title] = false;
        } catch (error) {
          errorMap[act.title] = true;
        }
      }
      setImageErrors(errorMap);
    };
    fetchImages();
  }, [activities]);

  return (
    <>
      <h2 style={{ color: colors.primary, marginTop: 0 }}>Discover by City</h2>
      <TabList>
        {cityList.map(city => (
          <TabItem
            key={city}
            active={city === selectedCity}
            onClick={() => setSelectedCity(city)}
          >
            {city}
          </TabItem>
        ))}
      </TabList>
      <CitySection>
        <CityTitle>{selectedCity}</CityTitle>
        <Grid>
          {activities.map(act => (
            <Card key={act.title}>
              <Img
                src={act.imageUrl || FALLBACK_IMAGE}
                alt={act.title}
              />
              <CardBody>
                <Title>{act.title}</Title>
                <Desc>{act.desc}</Desc>
                {act.rating && <Desc><b>Rating:</b> ⭐ {act.rating}</Desc>}
                <Desc>
                  <a
                    href={act.website || `https://www.google.com/search?q=${encodeURIComponent(act.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </Desc>
                <AddBtn
                  onClick={() => onAdd({ title: act.title, desc: act.desc, lat: act.lat, lng: act.lng, city: selectedCity, website: act.website, rating: act.rating })}
                >
                  Add to Itinerary
                </AddBtn>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </CitySection>
    </>
  );
}
