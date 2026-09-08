import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  private async checkAccess(
    boardId: string,
    userId: string,
    allowedRoles: Role[] = [Role.OWNER, Role.MEMBER],
  ) {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this board');
    }

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(
        'Viewers have read-only access to this board',
      );
    }

    return membership;
  }

  async create(userId: string, dto: CreateCardDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
      include: { board: true },
    });
    if (!column) throw new NotFoundException('Column not found');

    await this.checkAccess(column.boardId, userId);

    if (!dto.title) throw new BadRequestException('Card title is required');

    const last = await this.prisma.card.findFirst({
      where: { columnId: dto.columnId },
      orderBy: { position: 'desc' },
    });

    const position = last ? last.position + 1000 : 1000;

    const card = await this.prisma.card.create({
      data: {
        columnId: column.id,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        labels: dto.labels || [],
        position,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: column.boardId,
        cardId: card.id,
        userId,
        action: 'CARD_CREATED',
        meta: { title: card.title },
      },
    });

    return card;
  }

  async update(cardId: string, userId: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    await this.checkAccess(card.column.boardId, userId);

    const updated = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.column.boardId,
        cardId,
        userId,
        action: 'CARD_UPDATED',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        meta: { changes: JSON.parse(JSON.stringify(dto)) },
      },
    });

    return updated;
  }

  async move(cardId: string, userId: string, dto: MoveCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');
    if (card.isArchived)
      throw new BadRequestException('Cannot move archived card');

    await this.checkAccess(card.column.boardId, userId);

    const targetColumn = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
    });
    if (!targetColumn || targetColumn.boardId !== card.column.boardId) {
      throw new BadRequestException(
        'Target column must belong to the same board',
      );
    }

    const updated = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        columnId: dto.columnId,
        position: dto.position,
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.column.boardId,
        cardId,
        userId,
        action: 'CARD_MOVED',
        meta: {
          fromColumnId: card.columnId,
          toColumnId: dto.columnId,
          position: dto.position,
        },
      },
    });

    return updated;
  }

  async remove(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    await this.checkAccess(card.column.boardId, userId);

    await this.prisma.activity.create({
      data: {
        boardId: card.column.boardId,
        cardId,
        userId,
        action: 'CARD_DELETED',
        meta: { title: card.title },
      },
    });

    return this.prisma.card.delete({ where: { id: cardId } });
  }

  // ── Assignees ───────────────────────────────────────────────────────────────

  async getAssignees(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    // Any board member can view assignees
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: card.column.boardId, userId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this board');

    return this.prisma.cardAssignee.findMany({
      where: { cardId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async addAssignee(cardId: string, userId: string, assignUserId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    await this.checkAccess(card.column.boardId, userId);

    // The person being assigned must also be a board member
    const targetMembership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: card.column.boardId, userId: assignUserId } },
    });
    if (!targetMembership) {
      throw new ForbiddenException('Assigned user is not a member of this board');
    }

    const existing = await this.prisma.cardAssignee.findUnique({
      where: { cardId_userId: { cardId, userId: assignUserId } },
    });
    if (existing) throw new ForbiddenException('User is already assigned to this card');

    const assignee = await this.prisma.cardAssignee.create({
      data: { cardId, userId: assignUserId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.column.boardId,
        cardId,
        userId,
        action: 'CARD_ASSIGNED',
        meta: { assignedUserId: assignUserId },
      },
    });

    return assignee;
  }

  async removeAssignee(cardId: string, userId: string, assignUserId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    await this.checkAccess(card.column.boardId, userId);

    const existing = await this.prisma.cardAssignee.findUnique({
      where: { cardId_userId: { cardId, userId: assignUserId } },
    });
    if (!existing) throw new NotFoundException('Assignee not found');

    await this.prisma.activity.create({
      data: {
        boardId: card.column.boardId,
        cardId,
        userId,
        action: 'CARD_UNASSIGNED',
        meta: { unassignedUserId: assignUserId },
      },
    });

    return this.prisma.cardAssignee.delete({
      where: { cardId_userId: { cardId, userId: assignUserId } },
    });
  }
}
