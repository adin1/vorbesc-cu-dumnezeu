import { Module } from '@nestjs/common';
import { MonetizationModule } from '../monetization/monetization.module';
import { PrismaService } from '../../database/prisma.service';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [MonetizationModule],
  controllers: [PlansController],
  providers: [PlansService, PrismaService],
})
export class PlansModule {}
