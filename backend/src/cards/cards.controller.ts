import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Cards')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a card' })
  create(@Request() req: any, @Body() dto: CreateCardDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a card' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.update(id, req.user.id, dto);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move a card' })
  move(@Request() req: any, @Param('id') id: string, @Body() dto: MoveCardDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.move(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a card' })
  remove(@Request() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.remove(id, req.user.id);
  }

  // ── Assignees ──────────────────────────────────────────────────────────────

  @Get(':id/assignees')
  @ApiOperation({ summary: 'Get assignees of a card' })
  getAssignees(@Request() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.getAssignees(id, req.user.id);
  }

  @Post(':id/assignees')
  @ApiOperation({ summary: 'Assign a member to a card' })
  addAssignee(
    @Request() req: any,
    @Param('id') id: string,
    @Body('userId') assignUserId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.addAssignee(id, req.user.id, assignUserId);
  }

  @Delete(':id/assignees/:userId')
  @ApiOperation({ summary: 'Remove an assignee from a card' })
  removeAssignee(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') assignUserId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.cardsService.removeAssignee(id, req.user.id, assignUserId);
  }
}
