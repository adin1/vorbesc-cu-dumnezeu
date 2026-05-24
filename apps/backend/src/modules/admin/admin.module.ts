import { Module } from '@nestjs/common';
import { MonetizationModule } from '../monetization/monetization.module';
import { PrismaService } from '../../database/prisma.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [MonetizationModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
