'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Card as CardType } from '@/types';

interface Props {
  card: CardType;
  onClick: () => void;
}

export default function CardItem({ card, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        mb: 1.2,
        cursor: 'grab',
        borderRadius: 1.5,
        border: '1px solid #eaeaea',
        boxShadow: 'none',
        '&:hover': {
          borderColor: '#ccc',
          bgcolor: '#fafafa',
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {card.labels?.length > 0 && (
          <Box sx={{ mb: 1, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
            {card.labels.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  bgcolor: '#111',
                  color: '#fff',
                  borderRadius: 1,
                }}
              />
            ))}
          </Box>
        )}

        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111' }}>
          {card.title}
        </Typography>

        {card.dueDate && (
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              mt: 1,
              color: '#888',
            }}
          >
            Due {new Date(card.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}