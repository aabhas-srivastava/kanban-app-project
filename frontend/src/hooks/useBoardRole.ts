'use client';

import { useMemo } from 'react';
import { Board, Role } from '@/types';
import { getUser } from '@/lib/auth';

export function useBoardRole(board?: Board | null) {
  const currentUser = getUser();

  return useMemo(() => {
    if (!board || !currentUser) {
      return { role: null as Role | null, isOwner: false, isMember: false, canEdit: false };
    }

    const membership = board.members?.find((m) => m.userId === currentUser.id);
    const role = membership?.role ?? null;

    return {
      role,
      isOwner: role === 'OWNER',
      isMember: role === 'MEMBER' || role === 'OWNER',
      canEdit: role === 'OWNER' || role === 'MEMBER', // VIEWER cannot edit
    };
  }, [board, currentUser]);
}
