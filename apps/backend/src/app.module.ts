import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { JournalModule } from './modules/journal/journal.module';
import { PrayersModule } from './modules/prayers/prayers.module';
import { PlansModule } from './modules/plans/plans.module';
import { CommunityModule } from './modules/community/community.module';
import { GdprModule } from './modules/gdpr/gdpr.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PrismaService } from './database/prisma.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    CommonModule,
    AuthModule,
    AiModule,
    JournalModule,
    PrayersModule,
    PlansModule,
    CommunityModule,
    GdprModule,
    NotificationsModule,
    ProfileModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
