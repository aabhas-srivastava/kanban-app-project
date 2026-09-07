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
    roles: Role[] = [Role.OWNER, Role.MEMBER],
  ) {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this board');
    if (!roles.includes(membership.role)) {
      throw new ForbiddenException('You do not have permission');
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
}
