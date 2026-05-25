import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateSocialActivityDto, SocialExportQueryDto } from './social.dto';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Public()
  @Get('config')
  getConfig() {
    return this.socialService.getHubConfig();
  }

  @Public()
  @Post('activity')
  createActivity(@Body() dto: CreateSocialActivityDto) {
    return this.socialService.logActivity(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/dashboard')
  getGrowthDashboard() {
    return this.socialService.getGrowthDashboard();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportGrowthCsv(
    @Query() query: SocialExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.socialService.exportGrowthCsv(query.source, query.from, query.to);
    const filename = `social-growth-export-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return csv;
  }

  @UseGuards(JwtAuthGuard)
  @Post('activity/me')
  createActivityForCurrentUser(
    @CurrentUser() user: { sub: string },
    @Body() dto: Omit<CreateSocialActivityDto, 'userId'>,
  ) {
    return this.socialService.logActivity({ ...dto, userId: user.sub });
  }
}
