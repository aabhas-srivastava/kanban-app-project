import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ColumnsService {
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

  async create(userId: string, dto: CreateColumnDto) {
    if (dto.boardId === undefined) {
      throw new BadRequestException('Board ID is required');
    }

    await this.checkAccess(dto.boardId, userId);

    const last = await this.prisma.column.findFirst({
      where: { boardId: dto.boardId },
      orderBy: { position: 'desc' },
    });

    const position = dto.position ?? (last ? last.position + 1000 : 1000);

    if (dto.title === undefined) {
      throw new BadRequestException('Column title is required');
    }

    return this.prisma.column.create({
      data: {
        boardId: dto.boardId,
        title: dto.title,
        position,
      },
    });
  }

  async update(columnId: string, userId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Column not found');

    await this.checkAccess(column.boardId, userId);

    return this.prisma.column.update({
      where: { id: columnId },
      data: dto,
    });
  }

  async remove(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Column not found');

    await this.checkAccess(column.boardId, userId);

    return this.prisma.column.delete({ where: { id: columnId } });
  }
}
