import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  private async checkAccess(boardId: string, userId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this board');
    return membership;
  }

  async create(userId: string, dto: CreateCommentDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: dto.cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    const membership = await this.checkAccess(card.column.boardId, userId);

    // VIEWERs cannot post comments
    if (membership.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot add comments');
    }

    if (!dto.text) {
      throw new BadRequestException('Comment text is required');
    }

    const comment = await this.prisma.comment.create({
      data: {
        cardId: card.id,
        userId,
        text: dto.text,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.activity.create({
      data: {
        boardId: card.column.boardId,
        cardId: card.id,
        userId,
        action: 'COMMENT_ADDED',
        meta: { text: dto.text },
      },
    });

    return comment;
  }

  async findByCard(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    await this.checkAccess(card.column.boardId, userId);

    return this.prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { card: { include: { column: true } } },
    });
    if (!comment) throw new NotFoundException('Comment not found');

    const membership = await this.checkAccess(
      comment.card.column.boardId,
      userId,
    );

    // Only author or Owner can delete
    if (comment.userId !== userId && membership.role !== Role.OWNER) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
