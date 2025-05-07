import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function DraggableList({ items, onReorder, renderItem }) {
  function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onReorder(reordered);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, idx) => (
              <Draggable key={item.id || idx} draggableId={String(item.id || idx)} index={idx}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ marginBottom: "0.5rem", ...provided.draggableProps.style }}
                  >
                    {renderItem(item, idx)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
