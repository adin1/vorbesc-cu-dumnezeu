import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SocialModule } from '../social/social.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [SocialModule],
  controllers: [CommunityController],
  providers: [CommunityService, PrismaService],
})
export class CommunityModule {}
