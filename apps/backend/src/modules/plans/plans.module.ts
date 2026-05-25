import { Module } from '@nestjs/common';
import { MonetizationModule } from '../monetization/monetization.module';
import { SocialModule } from '../social/social.module';
import { PrismaService } from '../../database/prisma.service';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [MonetizationModule, SocialModule],
  controllers: [PlansController],
  providers: [PlansService, PrismaService],
})
export class PlansModule {}
