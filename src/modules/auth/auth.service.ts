import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RefreshToken) private rtRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  private getAccessTokenPayload(user: User) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId, // ensure user.entity has tenantId prop or relation
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = this.getAccessTokenPayload(user);
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });

    // generate a secure random refresh token string (not JWT necessarily)
    const rawRefresh = randomBytes(48).toString('hex');
    const hashed = await bcrypt.hash(rawRefresh, 10);
    const expiresAt = new Date(Date.now() + this.parseMs(process.env.JWT_REFRESH_EXPIRES || '7d'));

    const rt = this.rtRepo.create({
      user,
      userId: user.id,
      tokenHash: hashed,
      expiresAt,
      revoked: false,
    });
    await this.rtRepo.save(rt);

    return {
      access_token,
      refresh_token: rawRefresh, // send raw to client once
      expires_in: process.env.JWT_ACCESS_EXPIRES || '15m',
    };
  }

  // parse values like "7d", "15m" -> milliseconds
  private parseMs(value: string): number {
    // simple parser: supports m (minutes), h, d, s
    const m = /^(\d+)(ms|s|m|h|d)$/.exec(value);
    if (!m) {
      // fallback to days number
      return Number(value) || 7 * 24 * 60 * 60 * 1000;
    }
    const n = Number(m[1]);
    switch (m[2]) {
      case 'ms': return n;
      case 's': return n * 1000;
      case 'm': return n * 60 * 1000;
      case 'h': return n * 60 * 60 * 1000;
      case 'd': return n * 24 * 60 * 60 * 1000;
      default: return n;
    }
  }

  async refresh(refresh_token: string) {
    // find candidate tokens (non-revoked, not expired)
    const tokens = await this.rtRepo.find({
      where: { revoked: false },
      relations: ['user'],
    });

    // find matching by comparing hash (inefficient linear scan if many tokens; optimize by storing token id in client)
    let matched: RefreshToken | undefined;
    for (const t of tokens) {
      const ok = await bcrypt.compare(refresh_token, t.tokenHash);
      if (ok) {
        matched = t;
        break;
      }
    }
    if (!matched) throw new UnauthorizedException('Invalid refresh token');

    if (matched.expiresAt.getTime() < Date.now() || matched.revoked) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    // rotate: revoke old token and issue a new one
    matched.revoked = true;
    await this.rtRepo.save(matched);

    const user = matched.user;
    const payload = this.getAccessTokenPayload(user);
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });

    const newRaw = randomBytes(48).toString('hex');
    const newHash = await bcrypt.hash(newRaw, 10);
    const expiresAt = new Date(Date.now() + this.parseMs(process.env.JWT_REFRESH_EXPIRES || '7d'));

    const newRt = this.rtRepo.create({
      user,
      userId: user.id,
      tokenHash: newHash,
      expiresAt,
      revoked: false,
    });
    await this.rtRepo.save(newRt);

    return {
      access_token,
      refresh_token: newRaw,
      expires_in: process.env.JWT_ACCESS_EXPIRES || '15m',
    };
  }

  // optional: logout/revoke all tokens for a user
  async revokeAll(userId: string) {
    await this.rtRepo.update({ userId }, { revoked: true });
  }
}
