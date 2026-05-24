import { Module } from '@nestjs/common';
import { MonetizationModule } from '../monetization/monetization.module';
import { PrismaService } from '../../database/prisma.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [MonetizationModule],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
})
export class ProfileModule {}
