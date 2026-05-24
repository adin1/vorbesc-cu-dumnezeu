import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MonetizationController } from './monetization.controller';
import { MonetizationService } from './monetization.service';

@Module({
  controllers: [MonetizationController],
  providers: [MonetizationService, PrismaService],
  exports: [MonetizationService],
})
export class MonetizationModule {}