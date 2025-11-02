import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { AuthPayloadDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authPayload: AuthPayloadDto) {
    const findUser = await this.prisma.user.findUnique({
      where: { correo: authPayload.correo },
    });
    if (!findUser) {
      return { message: 'Usuario no encontrado', code: 10 };
    }
    if (findUser.password === authPayload.password) {
      const { password, ...user } = findUser;
      return this.jwtService.sign(user);
    }
  }
}
