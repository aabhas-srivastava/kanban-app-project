'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Board } from '@/types';

interface Props {
  board: Board;
  open: boolean;
  onClose: () => void;
}

export default function EditBoardDialog({ board, open, onClose }: Props) {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Sync with latest board data when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(board.title);
      setDescription(board.description || '');
      setError('');
    }
  }, [open, board]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/boards/${board.id}`, {
        title: title.trim(),
        description: description.trim() || null,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      setError(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        err.response?.data?.message || err.message || 'Failed to update board.',
      );
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Board</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Board Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title.trim()}
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
