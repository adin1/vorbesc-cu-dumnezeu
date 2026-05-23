import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GdprService } from './gdpr.service';

@Controller('gdpr')
@UseGuards(JwtAuthGuard)
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  export(@CurrentUser() user: { id: string }) {
    return this.gdprService.exportUserData(user.id);
  }

  @Delete('delete-account')
  deleteAccount(@CurrentUser() user: { id: string }) {
    return this.gdprService.deleteAccount(user.id);
  }
}
