import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAcquisitionDto } from './dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAcquisition(dto: CreateAcquisitionDto) {
    return this.prisma.userAcquisition.create({
      data: {
        userId: dto.userId,
        source: dto.source,
        medium: dto.medium,
        campaign: dto.campaign,
        landingPage: dto.landingPage,
        referrer: dto.referrer,
        firstVisitAt: dto.firstVisitAt ? new Date(dto.firstVisitAt) : new Date(),
      },
    });
  }
}