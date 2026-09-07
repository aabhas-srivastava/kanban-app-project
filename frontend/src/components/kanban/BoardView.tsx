'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Board, Card } from '@/types';
import ColumnComponent from './Column';
import CardItem from './CardItem';
import AddColumn from './AddColumn';
import CardDetailDrawer from '@/components/card/CardDetailDrawer';
import { useBoardRole } from '@/hooks/useBoardRole';

interface Props {
  board: Board;
}

export default function BoardView({ board }: Props) {
  const queryClient = useQueryClient();
  const { canEdit } = useBoardRole(board);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const moveMutation = useMutation({
    mutationFn: ({ cardId, columnId, position }: { cardId: string; columnId: string; position: number }) =>
      api.patch(`/cards/${cardId}/move`, { columnId, position }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', board.id] }),
  });

  const findColumn = (id: string) =>
    board.columns?.find((col) => col.id === id || col.cards?.some((c) => c.id === id));

  const handleDragStart = (event: DragStartEvent) => {
    if (!canEdit) return;
    const card = board.columns?.flatMap((c) => c.cards || []).find((c) => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || !canEdit) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn) return;

    const overCards = [...(overColumn.cards || [])];
    const overIndex = overCards.findIndex((c) => c.id === overId);

    let newPosition = 1000;
    if (overIndex >= 0) {
      newPosition = overCards[overIndex].position;
    } else if (overCards.length > 0) {
      newPosition = overCards[overCards.length - 1].position + 1000;
    }

    moveMutation.mutate({
      cardId: activeId,
      columnId: overColumn.id,
      position: newPosition,
    });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflow: 'auto',
            pb: 2,
            minHeight: 'calc(100vh - 180px)',
            bgcolor: '#0079BF',
            p: 2,
            borderRadius: 2,
          }}
        >
          {board.columns
            ?.sort((a, b) => a.position - b.position)
            .map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onCardClick={(card) => setSelectedCard(card)}
                canEdit={canEdit}
              />
            ))}
          {canEdit && <AddColumn boardId={board.id} />}
        </Box>

        <DragOverlay>
          {activeCard ? <CardItem card={activeCard} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <CardDetailDrawer
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        board={board}
      />
    </>
  );
}