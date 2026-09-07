'use client';

import { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function AddCard({ columnId }: { columnId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post('/cards', { columnId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
      setTitle('');
      setOpen(false);
    },
  });

  if (!open) {
    return (
      <Button startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ justifyContent: 'flex-start', color: 'text.secondary' }}>
        Add a card
      </Button>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Enter a title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        sx={{ mb: 1, bgcolor: 'white' }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" size="small" onClick={() => mutation.mutate()} disabled={!title || mutation.isPending}>
          Add
        </Button>
        <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
      </Box>
    </Box>
  );
}