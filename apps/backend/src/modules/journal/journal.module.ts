import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  controllers: [JournalController],
  providers: [JournalService, PrismaService],
})
export class JournalModule {}
