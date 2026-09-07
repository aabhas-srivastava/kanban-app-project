import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  // ==================== BOARD CRUD ====================

  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: dto.title ?? 'Untitled Board',
        description: dto.description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
        columns: {
          create: [
            { title: 'To Do', position: 1000 },
            { title: 'In Progress', position: 2000 },
            { title: 'Done', position: 3000 },
          ],
        },
      },
      include: {
        members: true,
        columns: {
          include: { cards: true },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: {
        members: {
          some: { userId },
        },
        isArchived: false,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async findOne(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                assignees: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const membership = board.members.find((m) => m.userId === userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }

    return board;
  }

  async update(boardId: string, userId: string, dto: UpdateBoardDto) {
    await this.checkPermission(boardId, userId, [Role.OWNER]);

    return this.prisma.board.update({
      where: { id: boardId },
      data: dto,
    });
  }

  async remove(boardId: string, userId: string) {
    await this.checkPermission(boardId, userId, [Role.OWNER]);

    return this.prisma.board.delete({
      where: { id: boardId },
    });
  }

  // ==================== MEMBERSHIP / ROLES ====================

  async inviteMember(boardId: string, userId: string, dto: InviteMemberDto) {
    // Only Owner can invite
    await this.checkPermission(boardId, userId, [Role.OWNER]);

    const userToInvite = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!userToInvite) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Check if already a member
    const existing = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: userToInvite.id,
        },
      },
    });

    if (existing) {
      throw new ForbiddenException('User is already a member of this board');
    }

    return this.prisma.boardMember.create({
      data: {
        boardId,
        userId: userToInvite.id,
        role: dto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async updateMemberRole(
    boardId: string,
    memberId: string,
    userId: string,
    dto: UpdateMemberRoleDto,
  ) {
    // Only Owner can change roles
    await this.checkPermission(boardId, userId, [Role.OWNER]);

    const member = await this.prisma.boardMember.findFirst({
      where: { id: memberId, boardId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Prevent changing own role if you are the only owner
    if (member.userId === userId && dto.role !== Role.OWNER) {
      throw new ForbiddenException('You cannot remove your own Owner role');
    }

    return this.prisma.boardMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async removeMember(boardId: string, memberId: string, userId: string) {
    // Only Owner can remove members
    await this.checkPermission(boardId, userId, [Role.OWNER]);

    const member = await this.prisma.boardMember.findFirst({
      where: { id: memberId, boardId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.userId === userId) {
      throw new ForbiddenException('You cannot remove yourself');
    }

    return this.prisma.boardMember.delete({
      where: { id: memberId },
    });
  }

  async getMembers(boardId: string, userId: string) {
    // Any member can view the member list
    await this.checkPermission(boardId, userId, [
      Role.OWNER,
      Role.MEMBER,
      Role.VIEWER,
    ]);

    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // ==================== HELPER ====================

  private async checkPermission(
    boardId: string,
    userId: string,
    allowedRoles: Role[],
  ) {
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }

    return membership;
  }
}
