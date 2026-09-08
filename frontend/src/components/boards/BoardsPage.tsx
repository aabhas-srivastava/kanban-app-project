'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Board } from '@/types';
import CreateBoardDialog from './CreateBoardDialog';
import { getUser } from '@/lib/auth';

export default function BoardsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const currentUser = getUser();

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

  const isOwnerOfBoard = (board: Board) =>
    board.members?.some(
      (m) => m.userId === currentUser?.id && m.role === 'OWNER',
    );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <CircularProgress size={28} sx={{ color: '#111' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Boards
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          New Board
        </Button>
      </Box>

      {(!boards || boards.length === 0) && (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            border: '1px dashed #ddd',
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            No boards yet. Create your first one.
          </Typography>
        </Box>
      )}

      <Grid container spacing={2.5}>
        {boards?.map((board) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={board.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: '#111',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => router.push(`/boards/${board.id}`)}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {board.title}
                  </Typography>

                  {isOwnerOfBoard(board) && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this board?')) {
                          deleteMutation.mutate(board.id);
                        }
                      }}
                      sx={{ color: '#999', '&:hover': { color: '#111' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {board.description || 'No description'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CreateBoardDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />
    </Box>
  );
}