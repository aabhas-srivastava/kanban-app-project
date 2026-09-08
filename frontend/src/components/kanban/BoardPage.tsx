'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Board } from '@/types';
import BoardView from './BoardView';
import EditBoardDialog from '@/components/boards/EditBoardDialog';
import MembersPanel from '@/components/boards/MembersPanel';
import { useBoardRole } from '@/hooks/useBoardRole';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;

  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const { data } = await api.get<Board>(`/boards/${boardId}`);
      return data;
    },
  });

  const { isOwner } = useBoardRole(board);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <CircularProgress size={28} sx={{ color: '#111' }} />
      </Box>
    );
  }

  if (!board) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 10 }}>
        Board not found
      </Typography>
    );
  }

  return (
    <Box>
      {/* Board header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {board.title}
          </Typography>
          {board.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {board.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<GroupIcon />}
            onClick={() => setMembersOpen(true)}
          >
            Members ({board.members?.length ?? 0})
          </Button>

          {isOwner && (
            <Tooltip title="Edit board">
              <IconButton
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ border: '1px solid #ddd' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <BoardView board={board} />

      {/* Dialogs */}
      {isOwner && (
        <EditBoardDialog
          board={board}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}

      <MembersPanel
        board={board}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      />
    </Box>
  );
}
