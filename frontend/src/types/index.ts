export type Role = 'OWNER' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: Role;
  user?: User;
}

export interface Board {
  id: string;
  title: string;
  description?: string | null;
  isArchived: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members?: BoardMember[];
  columns?: Column[];
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  cards?: Card[];
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  labels: string[];
  position: number;
  isArchived: boolean;
  assignees?: { user: User }[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: User;
}

export interface Activity {
  id: string;
  boardId: string;
  cardId?: string | null;
  userId: string;
  action: string;
  meta?: any;
  createdAt: string;
  user?: User;
  card?: { id: string; title: string };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}