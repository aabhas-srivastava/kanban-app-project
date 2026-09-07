import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Activity')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('board/:boardId')
  @ApiOperation({ summary: 'Get activity of a board' })
  findByBoard(@Request() req: any, @Param('boardId') boardId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.activityService.findByBoard(boardId, req.user.id);
  }

  @Get('card/:cardId')
  @ApiOperation({ summary: 'Get activity of a card' })
  findByCard(@Request() req: any, @Param('cardId') cardId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.activityService.findByCard(cardId, req.user.id);
  }
}
