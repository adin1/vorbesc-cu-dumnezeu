import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SpiritualGuideController } from './spiritual-guide.controller';
import { SpiritualGuideService } from './spiritual-guide.service';

@Module({
  controllers: [SpiritualGuideController],
  providers: [SpiritualGuideService, PrismaService],
})
export class SpiritualGuideModule {}
