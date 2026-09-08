'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, Comment, Activity, BoardMember } from '@/types';
import { useBoardRole } from '@/hooks/useBoardRole';
import { Board } from '@/types';

interface Props {
  card: Card | null;
  open: boolean;
  onClose: () => void;
  board: Board;
}

export default function CardDetailDrawer({ card, open, onClose, board }: Props) {
  const queryClient = useQueryClient();
  const { canEdit, isOwner } = useBoardRole(board);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [assignUserId, setAssignUserId] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate ? card.dueDate.slice(0, 10) : '');
      setLabels(card.labels ?? []);
    }
  }, [card]);

  // ── Comments ──────────────────────────────────────────────────────────────
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', card?.id],
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(`/comments/card/${card!.id}`);
      return data;
    },
    enabled: !!card && open,
  });

  // ── Activity ──────────────────────────────────────────────────────────────
  const { data: activities = [] } = useQuery({
    queryKey: ['card-activity', card?.id],
    queryFn: async () => {
      const { data } = await api.get<Activity[]>(`/activity/card/${card!.id}`);
      return data;
    },
    enabled: !!card && open,
  });

  // ── Assignees ─────────────────────────────────────────────────────────────
  const { data: assignees = [], isLoading: assigneesLoading } = useQuery({
    queryKey: ['assignees', card?.id],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; userId: string; user: { id: string; name: string; email: string } }[]>(
        `/cards/${card!.id}/assignees`,
      );
      return data;
    },
    enabled: !!card && open,
  });

  // ── Board members for the assignee dropdown ───────────────────────────────
  const { data: members = [] } = useQuery({
    queryKey: ['members', board.id],
    queryFn: async () => {
      const { data } = await api.get<BoardMember[]>(`/boards/${board.id}/members`);
      return data;
    },
    enabled: open,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/cards/${card!.id}`, {
        title,
        description: description || null,
        dueDate: dueDate || null,
        labels,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      onClose();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (archive: boolean) =>
      api.patch(`/cards/${card!.id}`, { isArchived: archive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/cards/${card!.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: () =>
      api.post('/comments', { cardId: card!.id, text: commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', card!.id] });
      queryClient.invalidateQueries({ queryKey: ['card-activity', card!.id] });
      setCommentText('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', card!.id] });
    },
  });

  const addAssigneeMutation = useMutation({
    mutationFn: (userId: string) =>
      api.post(`/cards/${card!.id}/assignees`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignees', card!.id] });
      queryClient.invalidateQueries({ queryKey: ['card-activity', card!.id] });
      setAssignUserId('');
    },
  });

  const removeAssigneeMutation = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/cards/${card!.id}/assignees/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignees', card!.id] });
      queryClient.invalidateQueries({ queryKey: ['card-activity', card!.id] });
    },
  });

  // ── Label helpers ─────────────────────────────────────────────────────────
  const addLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels((prev) => [...prev, trimmed]);
    }
    setLabelInput('');
  };

  const removeLabel = (label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  };

  // ── Assignee dropdown options (members not yet assigned) ──────────────────
  const assignedUserIds = new Set(assignees.map((a) => a.userId));
  const unassignedMembers = members.filter((m) => !assignedUserIds.has(m.userId));

  if (!card) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 500 } } } }}
    >
      <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Card Details</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canEdit && (
              <>
                <Tooltip title={card.isArchived ? 'Unarchive card' : 'Archive card'}>
                  <IconButton
                    size="small"
                    onClick={() => archiveMutation.mutate(!card.isArchived)}
                    disabled={archiveMutation.isPending}
                  >
                    {card.isArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete card">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm('Delete this card? This cannot be undone.')) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>
        </Box>

        {card.isArchived && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fff8e1', borderRadius: 1, border: '1px solid #ffe082' }}>
            <Typography variant="body2" color="warning.dark">
              This card is archived and hidden from the board.
            </Typography>
          </Box>
        )}

        {/* Title & Description */}
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          disabled={!canEdit}
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
          disabled={!canEdit}
        />

        {/* Due Date */}
        <TextField
          fullWidth
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          margin="normal"
          disabled={!canEdit}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {/* Labels */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Labels</Typography>
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ mb: 1, flexWrap: 'wrap' }}>
            {labels.map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                onDelete={canEdit ? () => removeLabel(label) : undefined}
                sx={{ bgcolor: '#111', color: '#fff', mb: 0.5 }}
              />
            ))}
            {labels.length === 0 && (
              <Typography variant="body2" color="text.secondary">No labels</Typography>
            )}
          </Stack>
          {canEdit && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add a label..."
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="outlined" size="small" onClick={addLabel} disabled={!labelInput.trim()}>
                Add
              </Button>
            </Box>
          )}
        </Box>

        {canEdit && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !title.trim()}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Assignees */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Assignees
        </Typography>

        {assigneesLoading ? (
          <CircularProgress size={20} />
        ) : (
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            {assignees.map((a) => (
              <Chip
                key={a.id}
                label={a.user.name}
                size="small"
                variant="outlined"
                onDelete={canEdit ? () => removeAssigneeMutation.mutate(a.userId) : undefined}
              />
            ))}
            {assignees.length === 0 && (
              <Typography variant="body2" color="text.secondary">No assignees</Typography>
            )}
          </Stack>
        )}

        {canEdit && unassignedMembers.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ flexGrow: 1 }}>
              <InputLabel>Assign member</InputLabel>
              <Select
                value={assignUserId}
                label="Assign member"
                onChange={(e) => setAssignUserId(e.target.value)}
              >
                {unassignedMembers.map((m) => (
                  <MenuItem key={m.userId} value={m.userId}>
                    {m.user?.name} ({m.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => addAssigneeMutation.mutate(assignUserId)}
              disabled={!assignUserId || addAssigneeMutation.isPending}
            >
              Assign
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Comments */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Comments
        </Typography>

        {canEdit && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                  e.preventDefault();
                  addCommentMutation.mutate();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => addCommentMutation.mutate()}
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              Add
            </Button>
          </Box>
        )}

        {commentsLoading ? (
          <CircularProgress size={24} />
        ) : (
          <List dense>
            {comments.map((c) => (
              <ListItem
                key={c.id}
                alignItems="flex-start"
                sx={{ px: 0 }}
                secondaryAction={
                  (isOwner || c.userId === (members.find((m) => m.role === 'OWNER')?.userId)) && canEdit ? (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => deleteCommentMutation.mutate(c.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : undefined
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.user?.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary" sx={{ display: 'block' }}>
                        {c.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            {comments.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No comments yet
              </Typography>
            )}
          </List>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Activity */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
          Activity
        </Typography>
        <List dense>
          {activities.map((a) => (
            <ListItem key={a.id} sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>{a.user?.name}</strong>{' '}
                    {a.action.replace(/_/g, ' ').toLowerCase()}
                  </Typography>
                }
                secondary={new Date(a.createdAt).toLocaleString()}
              />
            </ListItem>
          ))}
          {activities.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No activity yet
            </Typography>
          )}
        </List>
      </Box>
    </Drawer>
  );
}
