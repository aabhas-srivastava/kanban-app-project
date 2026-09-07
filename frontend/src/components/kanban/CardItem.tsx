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

  // Simple color mapping for labels
  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      UI: '#61BD4F',
      Frontend: '#F2D600',
      Backend: '#FF9F1A',
      Bug: '#EB5A46',
      Feature: '#C377E0',
    };
    return colors[label] || '#0079BF';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        mb: 1,
        cursor: 'grab',
        borderRadius: 1.5,
        boxShadow: '0 1px 0 rgba(9,30,66,.25)',
        '&:hover': { bgcolor: '#f4f5f7' },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Labels */}
        {card.labels?.length > 0 && (
          <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {card.labels.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: getLabelColor(label),
                  color: '#fff',
                  borderRadius: 1,
                }}
              />
            ))}
          </Box>
        )}

        <Typography
          variant="body2"
          color="#172B4D"
          sx={{ fontWeight: 500 }}
        >
          {card.title}
        </Typography>

        {card.dueDate && (
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              mt: 1,
              px: 0.8,
              py: 0.2,
              bgcolor: '#f4f5f7',
              borderRadius: 1,
              color: '#5e6c84',
            }}
          >
            Due: {new Date(card.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}