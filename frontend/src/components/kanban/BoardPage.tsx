'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Avatar, AppBar, Toolbar, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Board } from '@/types';
import BoardView from './BoardView';
import Loading from '@/components/common/Loading';
import { getUser } from '@/lib/auth';
import MembersPanel from '@/components/boards/MembersPanel';
import { useBoardRole } from '@/hooks/useBoardRole';

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const user = getUser();
  const [membersOpen, setMembersOpen] = useState(false);

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const { data } = await api.get<Board>(`/boards/${boardId}`);
      return data;
    },
  });

  const { isOwner } = useBoardRole(board);

  if (isLoading) return <Loading />;
  if (!board) return <Typography>Board not found</Typography>;

  return (
    <Box>
      {/* Blue Header */}
      <AppBar position="static" sx={{ bgcolor: '#026AA7', mb: 3, borderRadius: 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {board.title}
          </Typography>

          {isOwner && (
            <Button
              color="inherit"
              startIcon={<PeopleIcon />}
              onClick={() => setMembersOpen(true)}
              sx={{ mr: 2 }}
            >
              Members
            </Button>
          )}

          <Avatar sx={{ bgcolor: 'white', color: '#026AA7', width: 36, height: 36, fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
        </Toolbar>
      </AppBar>

      <BoardView board={board} />

      <MembersPanel
        board={board}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      />
    </Box>
  );
}