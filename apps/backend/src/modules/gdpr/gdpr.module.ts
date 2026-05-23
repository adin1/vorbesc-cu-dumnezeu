import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  controllers: [GdprController],
  providers: [GdprService, PrismaService],
})
export class GdprModule {}
