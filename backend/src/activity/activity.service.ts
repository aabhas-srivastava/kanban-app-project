import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  private async checkAccess(boardId: string, userId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this board');
    return membership;
  }

  async findByBoard(boardId: string, userId: string) {
    await this.checkAccess(boardId, userId);

    return this.prisma.activity.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
        card: { select: { id: true, title: true } },
      },
    });
  }

  async findByCard(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) return [];

    await this.checkAccess(card.column.boardId, userId);

    return this.prisma.activity.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
