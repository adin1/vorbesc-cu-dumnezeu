import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { SpiritualGuideModule } from './modules/spiritual-guide/spiritual-guide.module';
import { JournalModule } from './modules/journal/journal.module';
import { PrayersModule } from './modules/prayers/prayers.module';
import { PlansModule } from './modules/plans/plans.module';
import { CommunityModule } from './modules/community/community.module';
import { GdprModule } from './modules/gdpr/gdpr.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AdminModule } from './modules/admin/admin.module';
import { MonetizationModule } from './modules/monetization/monetization.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaService } from './database/prisma.service';
import { CommonModule } from './common/common.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    CommonModule,
    AuthModule,
    AiModule,
    SpiritualGuideModule,
    JournalModule,
    PrayersModule,
    PlansModule,
    CommunityModule,
    GdprModule,
    NotificationsModule,
    ProfileModule,
    AdminModule,
    MonetizationModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
