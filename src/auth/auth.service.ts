import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayloadDto } from './dto/auth.dto';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(authPayload: AuthPayloadDto) {
    try {
      const { correo, password } = authPayload;

      const findUser = await this.prisma.user.findFirst({
        where: { correo: correo },
      });
      if (!findUser) {
        return { message: 'Usuario no encontrado', code: 11 };
      }
      const passwordMatch = await bcrypt.compare(password, findUser.password);
      if (!passwordMatch) {
        return { message: 'Credenciales erróneas.', code: 13 };
      }

      const { password: _, ...user } = findUser;

      const token = this.jwtService.sign({
        id: user.id,
        correo: user.correo,
        rol: user.rol,
      });
      return { message: 'Autenticación exitosa', code: 0, token, user };
    } catch (error) {
      console.error('Error al validar usuario:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }

  async signupUser(signupDto: SignupDto) {
    const {
      nombre,
      apellido,
      dni,
      telefono,
      direccion,
      fechaNac,
      correo,
      password,
    } = signupDto;
    const dniExists = await this.prisma.persona.findUnique({
      where: { dni }
    });
    const emailExists = await this.prisma.user.findUnique({
      where: { correo },
    });
    if (dniExists) {
      return {message: 'El dni ya existe', code: 9};
      }
    if (emailExists) {
      return { message: 'El correo ya está registrado', code: 12 };
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newPersona = await this.prisma.persona.create({
        data: {
          nombre,
          apellido,
          dni,
          telefono: telefono || null,
          direccion: direccion || null,
          fechaNac: fechaNac ? new Date(fechaNac) : null,
        },
      });
      const newUser = await this.prisma.user.create({
        data: {
          correo,
          password: await hashedPassword,
          personaId: newPersona.id,
        },
      });
      return { message: 'Usuario registrado con éxito', code: 10 };
    } catch (error) {
      console.error('Error:', error);
      return { message: 'Error interno del servidor', code: 500 };
    }
  }
}
