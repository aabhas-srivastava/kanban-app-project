import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    console.log('===== JWT VALIDATE STARTED =====');
    console.log('Full payload:', payload);
    console.log('payload.sub =', payload?.sub);

    const user = await this.prisma.user.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });

    console.log('User found in DB →', user);

    if (!user) {
      console.log('❌ USER NOT FOUND IN DATABASE');
      throw new UnauthorizedException('User not found');
    }

    console.log('✅ User validated successfully');
    return user;
  }
}
