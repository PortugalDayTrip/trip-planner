import React from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import html2canvas from 'html2canvas';
import styled from 'styled-components';

// Convert image URL to Data URL
const toDataURL = url => fetch(url)
  .then(res => res.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  }));

// Toolbar and action button styles
const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 2rem 0;
`;
const ActionButton = styled.button`
  background: ${props => props.bg};
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${props => props.hoverBg}; }
`;

export default function ExportShare({ days }) {
  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const margin = 20;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    for (let idx = 0; idx < days.length; idx++) {
      const day = days[idx];
      if (!day) continue;
      if (idx > 0) doc.addPage();
      let y = margin;
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${idx + 1}: ${day.label}`, margin, y);
      y += 8;
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
      y += 10;
      // Schedule Table Header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Time', margin, y);
      doc.text('Activity', margin + 40, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      // Schedule Items
      const slots = day.slots || { morning: day.items || [] };
      for (const [slotKey, items] of Object.entries(slots)) {
        if (!items.length) continue;
        const defaultTime = slotKey === 'morning' ? '09:00' : slotKey === 'afternoon' ? '14:00' : '18:00';
        for (const item of items) {
          const time = item.time || defaultTime;
          doc.text(time, margin, y);
          doc.text(item.title, margin + 40, y);
          y += 6;
        }
        y += 4;
      }
      // Map Image
      const coords = [];
      Object.values(slots).forEach(arr => arr.forEach(i => i.lat && i.lng && coords.push(`${i.lat},${i.lng}`)));
      if (coords.length) {
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x200&path=color:0x4285F4|weight:3|${coords.join('|')}&markers=color:red|${coords.join('|')}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`;
        const imgData = await toDataURL(mapUrl);
        doc.addImage(imgData, 'PNG', margin, y, width, 50);
        y += 54;
      }
      // Details Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Details:', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      if (day.city) { doc.text(`• City: ${day.city}`, margin, y); y += 6; }
      if (day.weather) { doc.text(`• Weather: ${day.weather.description} (${day.weather.min}–${day.weather.max}°C)`, margin, y); y += 6; }
      if (day.travel) { doc.text(`• Transport: ${day.travel.mode} (${day.travel.distance} km, ${day.travel.duration} mins)`, margin, y); y += 6; }
    }
    doc.save('enhanced-itinerary.pdf');
  };

  const exportExcel = () => {
    // Define columns
    const header = ['Day', 'City', 'Weather', 'Transport', 'Distance', 'Duration', 'Slot', 'Activity', 'Notes'];
    const rows = [];
    days.forEach(day => {
      if (!day) return;
      const weatherText = day.weather ? `${day.weather.description} (${day.weather.min}°C - ${day.weather.max}°C)` : '';
      const mode = day.travel?.mode || '';
      const dist = day.travel?.distance ? `${day.travel.distance} km` : '';
      const dur = day.travel?.duration ? `${day.travel.duration} mins` : '';
      const slots = day.slots || { morning: day.items || [] };
      Object.entries(slots).forEach(([slotKey, items]) => {
        if (!items?.length) return;
        items.forEach(item => {
          rows.push({
            Day: day.label,
            City: day.city,
            Weather: weatherText,
            Transport: mode,
            Distance: dist,
            Duration: dur,
            Slot: slotKey.charAt(0).toUpperCase() + slotKey.slice(1),
            Activity: item.title || '',
            Notes: item.notes || ''
          });
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows, { header });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Itinerary');
    XLSX.writeFile(wb, 'itinerary.xlsx');
  };

  const shareViaEmail = () => {
    let body = "Portugal Trip Itinerary%0D%0A%0D%0A";
    
    days.forEach(day => {
      if (!day) return;
      
      body += `${day.label}%0D%0A`;
      
      // Handle both old and new format
      const slots = day.slots || { morning: day.items || [] };
      Object.entries(slots).forEach(([slot, items]) => {
        if (!items || !Array.isArray(items)) return;
        
        items.forEach(item => {
          if (!item || !item.title) return;
          body += `- ${item.title}%0D%0A`;
        });
        body += "%0D%0A";
      });
    });
    
    window.location.href = `mailto:?subject=Portugal Trip Itinerary&body=${encodeURIComponent(body)}`;
  };

  // Generate shareable link to invite collaborators
  const copyShareLink = () => {
    const encoded = btoa(JSON.stringify(days));
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert('Share link copied to clipboard!'));
  };

  // Export a 'story mode' image of the itinerary
  const exportStoryImage = () => {
    let el = document.getElementById('itinerary-wrapper');
    if (!el) {
      console.warn('itinerary-wrapper not found, capturing full page instead.');
      el = document.body;
    }
    html2canvas(el).then(canvas => {
      const link = document.createElement('a');
      link.download = 'itinerary-story.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <Toolbar role="toolbar">
      <ActionButton bg="#2563eb" hoverBg="#1e40af" onClick={exportPDF}>Export PDF</ActionButton>
      <ActionButton bg="#22c55e" hoverBg="#15803d" onClick={exportExcel}>Export Excel</ActionButton>
      <ActionButton bg="#f59e42" hoverBg="#d97706" onClick={shareViaEmail}>Share via Email</ActionButton>
      <ActionButton bg="#fb7185" hoverBg="#be123c" onClick={copyShareLink}>Copy Share Link</ActionButton>
      <ActionButton bg="#8b5cf6" hoverBg="#6d28d9" onClick={exportStoryImage}>Export Story Image</ActionButton>
    </Toolbar>
  );
}
