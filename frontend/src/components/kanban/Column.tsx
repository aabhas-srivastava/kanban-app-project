'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Column as ColumnType, Card as CardType } from '@/types';
import CardItem from './CardItem';
import AddCard from './AddCard';
import { useBoardRole } from '@/hooks/useBoardRole';
import { Board } from '@/types';

interface Props {
  column: ColumnType;
  onCardClick: (card: CardType) => void;
  board: Board;
}

export default function Column({ column, onCardClick, board }: Props) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const queryClient = useQueryClient();
  const { canEdit } = useBoardRole(board);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  // Rename state
  const [renameOpen, setRenameOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);

  const renameMutation = useMutation({
    mutationFn: () => api.patch(`/columns/${column.id}`, { title: newTitle.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', column.boardId] });
      setRenameOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/columns/${column.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', column.boardId] });
    },
  });

  return (
    <>
      <Paper
        ref={setNodeRef}
        elevation={0}
        sx={{
          width: 280,
          minWidth: 280,
          bgcolor: '#f4f4f4',
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 200px)',
          border: '1px solid #eee',
        }}
      >
        {/* Column header */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{ flexGrow: 1, color: '#111', fontWeight: 600 }}
          >
            {column.title}
          </Typography>
          {canEdit && (
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: '#888', '&:hover': { color: '#111' } }}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <SortableContext
            items={column.cards?.map((c) => c.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {column.cards?.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onClick={() => onCardClick(card)}
              />
            ))}
          </SortableContext>
        </Box>

        {canEdit && <AddCard columnId={column.id} />}
      </Paper>

      {/* Column actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setNewTitle(column.title);
            setRenameOpen(true);
            setAnchorEl(null);
          }}
        >
          Rename list
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchorEl(null);
            if (confirm(`Delete "${column.title}" and all its cards? This cannot be undone.`)) {
              deleteMutation.mutate();
            }
          }}
        >
          Delete list
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename list</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="List title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTitle.trim()) renameMutation.mutate();
            }}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => renameMutation.mutate()}
            disabled={!newTitle.trim() || renameMutation.isPending}
          >
            {renameMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
