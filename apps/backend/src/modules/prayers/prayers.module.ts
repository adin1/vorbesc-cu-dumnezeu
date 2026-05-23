import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PrayersController } from './prayers.controller';
import { PrayersService } from './prayers.service';

@Module({
  controllers: [PrayersController],
  providers: [PrayersService, PrismaService],
})
export class PrayersModule {}
