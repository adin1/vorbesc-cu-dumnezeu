import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateJournalDto, UpdateJournalDto } from './dto';
import { JournalService } from './journal.service';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.journalService.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateJournalDto) {
    return this.journalService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    return this.journalService.update(user.id, id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.journalService.delete(user.id, id);
  }

  @Get('export')
  exportData(@CurrentUser() user: { id: string }) {
    return this.journalService.export(user.id);
  }
}
