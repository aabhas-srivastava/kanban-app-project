import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Boards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // ==================== BOARD CRUD ====================

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  create(@Request() req: any, @Body() dto: CreateBoardDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards of current user' })
  findAll(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single board with columns and cards' })
  findOne(@Request() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update board (Owner only)' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board (Owner only)' })
  remove(@Request() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.remove(id, req.user.id);
  }

  // ==================== MEMBERSHIP / ROLES ====================

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member (Owner only)' })
  inviteMember(
    @Request() req: any,
    @Param('id') boardId: string,
    @Body() dto: InviteMemberDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.inviteMember(boardId, req.user.id, dto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a board' })
  getMembers(@Request() req: any, @Param('id') boardId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.getMembers(boardId, req.user.id);
  }

  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Change member role (Owner only)' })
  updateMemberRole(
    @Request() req: any,
    @Param('id') boardId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.boardsService.updateMemberRole(
      boardId,
      memberId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.id,
      dto,
    );
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove a member (Owner only)' })
  removeMember(
    @Request() req: any,
    @Param('id') boardId: string,
    @Param('memberId') memberId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.boardsService.removeMember(boardId, memberId, req.user.id);
  }
}
