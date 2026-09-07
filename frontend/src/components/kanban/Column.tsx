'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, Paper } from '@mui/material';
import { Column as ColumnType, Card as CardType } from '@/types';
import CardItem from './CardItem';
import AddCard from './AddCard';

interface Props {
  column: ColumnType;
  onCardClick: (card: CardType) => void;
  canEdit: boolean;
}

export default function Column({ column, onCardClick, canEdit }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <Paper
      ref={setNodeRef}
      elevation={0}
      sx={{
        width: 280,
        minWidth: 280,
        bgcolor: '#EBECF0',
        p: 1.5,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ px: 1, mb: 1.5, color: '#172B4D', fontWeight: 700 }}
      >
        {column.title}
      </Typography>

      <Box sx={{ overflowY: 'auto', flexGrow: 1, minHeight: 20 }}>
        <SortableContext
          items={column.cards?.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {column.cards?.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </Box>

      {canEdit && <AddCard columnId={column.id} />}
    </Paper>
  );
}