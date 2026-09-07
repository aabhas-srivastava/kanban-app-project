'use client';

import { useState } from 'react';
import { Button, TextField, Box, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function AddColumn({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post('/columns', { boardId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
      setTitle('');
      setOpen(false);
    },
  });

  if (!open) {
    return (
      <Paper sx={{ width: 300, minWidth: 300, p: 1.5, bgcolor: 'rgba(255,255,255,0.3)' }}>
        <Button startIcon={<AddIcon />} fullWidth onClick={() => setOpen(true)} sx={{ justifyContent: 'flex-start' }}>
          Add another list
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: 300, minWidth: 300, p: 1.5 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Enter list title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" size="small" onClick={() => mutation.mutate()} disabled={!title || mutation.isPending}>
          Add list
        </Button>
        <Button size="small" onClick={() => setOpen(false)}>Cancel</Button>
      </Box>
    </Paper>
  );
}