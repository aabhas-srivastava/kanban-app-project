'use client';

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateBoardDialog({ open, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post('/boards', { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setTitle('');
      setDescription('');
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Board</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth label="Board Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" required />
        <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={3} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={!title || mutation.isPending}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}