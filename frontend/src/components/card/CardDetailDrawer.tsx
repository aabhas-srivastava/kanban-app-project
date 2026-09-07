'use client';

import { useState, useEffect } from 'react';
import {
  Drawer, Box, Typography, TextField, Button, IconButton, Divider,
  List, ListItem, ListItemText, Chip, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, Comment, Activity } from '@/types';
import { useBoardRole } from '@/hooks/useBoardRole';
import { Board } from '@/types';

interface Props {
  card: Card | null;
  open: boolean;
  onClose: () => void;
  board: Board;
}

export default function CardDetailDrawer({ card, open, onClose, board }: Props) {
  const queryClient = useQueryClient();
  const { canEdit } = useBoardRole(board);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
    }
  }, [card]);

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', card?.id],
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(`/comments/card/${card!.id}`);
      return data;
    },
    enabled: !!card && open,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['card-activity', card?.id],
    queryFn: async () => {
      const { data } = await api.get<Activity[]>(`/activity/card/${card!.id}`);
      return data;
    },
    enabled: !!card && open,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/cards/${card!.id}`, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: () =>
      api.post('/comments', { cardId: card!.id, text: commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', card!.id] });
      queryClient.invalidateQueries({ queryKey: ['card-activity', card!.id] });
      setCommentText('');
    },
  });

  if (!card) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}
    >
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Card Details</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          disabled={!canEdit}
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          disabled={!canEdit}
        />

        {canEdit && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            Save Changes
          </Button>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Comments */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Comments
        </Typography>

        {canEdit && (
          <Box display="flex" gap={1} mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => addCommentMutation.mutate()}
              disabled={!commentText || addCommentMutation.isPending}
            >
              Add
            </Button>
          </Box>
        )}

        {commentsLoading ? (
          <CircularProgress size={24} />
        ) : (
          <List dense>
            {comments.map((c) => (
              <ListItem key={c.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600}>
                      {c.user?.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        {c.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            {comments.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No comments yet
              </Typography>
            )}
          </List>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Activity */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Activity
        </Typography>
        <List dense>
          {activities.map((a) => (
            <ListItem key={a.id} sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>{a.user?.name}</strong> {a.action.replace('_', ' ').toLowerCase()}
                  </Typography>
                }
                secondary={new Date(a.createdAt).toLocaleString()}
              />
            </ListItem>
          ))}
          {activities.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No activity yet
            </Typography>
          )}
        </List>
      </Box>
    </Drawer>
  );
}