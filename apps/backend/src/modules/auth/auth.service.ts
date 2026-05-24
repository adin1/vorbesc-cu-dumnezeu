import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: 'USER',
        denomination: dto.denomination ?? 'GENERAL',
      },
    });

    if (dto.acquisition?.source) {
      await this.prisma.userAcquisition.create({
        data: {
          userId: user.id,
          source: dto.acquisition.source,
          medium: dto.acquisition.medium,
          campaign: dto.acquisition.campaign,
          landingPage: dto.acquisition.landingPage,
          referrer: dto.acquisition.referrer,
          firstVisitAt: dto.acquisition.firstVisitAt
            ? new Date(dto.acquisition.firstVisitAt)
            : new Date(),
        },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Bine ai venit',
        body: 'Contul tau este activ. Poti incepe onboarding-ul spiritual.',
      },
    });

    this.dashboardCache.invalidateUser(user.id);

    const token = await this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async signToken(userId: string, email: string, role: string) {
    return this.jwtService.signAsync({ sub: userId, email, role });
  }

  private sanitizeUser(user: { passwordHash: string } & Record<string, unknown>) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
