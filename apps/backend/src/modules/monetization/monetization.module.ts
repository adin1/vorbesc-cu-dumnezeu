import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocialModule } from '../social/social.module';
import { MonetizationController } from './monetization.controller';
import { MonetizationService } from './monetization.service';

@Module({
  imports: [SocialModule],
  controllers: [MonetizationController],
  providers: [MonetizationService, PrismaService],
  exports: [MonetizationService],
})
export class MonetizationModule {}