'use client';

import { useState } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Select, FormControl,
  InputLabel, List, ListItem, ListItemText, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Board, BoardMember, Role } from '@/types';
import { useBoardRole } from '@/hooks/useBoardRole';

interface Props {
  board: Board;
  open: boolean;
  onClose: () => void;
}

export default function MembersPanel({ board, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const { isOwner } = useBoardRole(board);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', board.id],
    queryFn: async () => {
      const { data } = await api.get<BoardMember[]>(`/boards/${board.id}/members`);
      return data;
    },
    enabled: open,
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.post(`/boards/${board.id}/members`, { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', board.id] });
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      setEmail('');
      setRole('MEMBER');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, newRole }: { memberId: string; newRole: Role }) =>
      api.patch(`/boards/${board.id}/members/${memberId}`, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', board.id] });
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) =>
      api.delete(`/boards/${board.id}/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', board.id] });
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Board Members</DialogTitle>
      <DialogContent>
        {isOwner && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              size="small"
              label="Email to invite"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <MenuItem value="MEMBER">Member</MenuItem>
                <MenuItem value="VIEWER">Viewer</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => inviteMutation.mutate()}
              disabled={!email || inviteMutation.isPending}
            >
              Invite
            </Button>
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {members.map((member) => (
              <ListItem
                key={member.id}
                secondaryAction={
                  isOwner && member.role !== 'OWNER' ? (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 110 }}>
                        <Select
                          value={member.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              memberId: member.id,
                              newRole: e.target.value as Role,
                            })
                          }
                        >
                          <MenuItem value="MEMBER">Member</MenuItem>
                          <MenuItem value="VIEWER">Viewer</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => {
                          if (confirm('Remove this member?')) {
                            removeMutation.mutate(member.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : null
                }
              >
                <ListItemText
                  primary={member.user?.name}
                  secondary={member.user?.email}
                />
                <Chip
                  label={member.role}
                  size="small"
                  color={
                    member.role === 'OWNER'
                      ? 'primary'
                      : member.role === 'MEMBER'
                      ? 'success'
                      : 'default'
                  }
                  sx={{ mr: 6 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
