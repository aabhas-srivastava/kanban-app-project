'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Board } from '@/types';
import CreateBoardDialog from './CreateBoardDialog';
import Loading from '@/components/common/Loading';

export default function BoardsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const { data } = await api.get<Board[]>('/boards');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/boards/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>My Boards</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Create Board
        </Button>
      </Box>

      <Grid container spacing={3}>
        {boards?.map((board) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={board.id}>
            <Card
              sx={{ height: '100%', cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 6 } }}
              onClick={() => router.push(`/boards/${board.id}`)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{board.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {board.description || 'No description'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this board?')) deleteMutation.mutate(board.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CreateBoardDialog open={openCreate} onClose={() => setOpenCreate(false)} />
    </Box>
  );
}