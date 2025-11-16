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

  async validateUser(authPayload: AuthPayloadDto, isSocial = false) {
  try {
    const { correo, password } = authPayload;

    // Buscar el usuario por correo
    const findUser = await this.prisma.user.findFirst({
      where: { correo },
      include: { persona: true }, // opcional: incluye datos de la persona
    });

    if (!findUser) {
      return { message: 'Credenciales Invalidas', code: 11 };
    }

    // Si es login normal (no social), validar contraseña
    if (!isSocial) {
      if (!findUser.password) {
        return { message: 'Credenciales Invalidas', code: 14 };
      }

      const passwordMatch = await bcrypt.compare(password, findUser.password);
      if (!passwordMatch) {        
        return { message: 'Credenciales Invalidas', code: 13 };
      }
    }

    //verificar si es un empleado
    const empleado = await this.prisma.empleado.findFirst({
      where: { personaId: findUser.personaId },
      select: { id: true },
    });
   
    // Si llega aquí, la autenticación fue exitosa y quitamos password del user 
    const { password: _, ...user } = findUser;

    if (empleado) {
      user["empleadoId"] = empleado.id;
    }
    
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



 async signupUser(signupDto: SignupDto, isSocial = false) {
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

  try {
    // Validar correo
    const emailExists = await this.prisma.user.findUnique({
      where: { correo },
    });
    if (emailExists) {
      return { message: 'El correo ya está registrado', code: 12 };
    }

    // Validar contraseña y DNI
    let hashedPassword: string | null = null;

    if (!isSocial) {
      if (!password) {
        return { message: 'La contraseña es requerida.', code: 13 };
      }

      hashedPassword = await bcrypt.hash(password, 10);

      if (dni) {
        const dniExists = await this.prisma.persona.findFirst({
          where: { dni },
        });

        if (dniExists) {        
          return { message: 'El DNI ya existe', code: 9 };
        }
      }
    }

    // Crear persona
    const newPersona = await this.prisma.persona.create({
      data: {
        nombre,
        apellido: apellido,
        dni: dni ||null,
        telefono: telefono || null,
        direccion: direccion || null,
        fechaNac: fechaNac ? new Date(fechaNac) : null,
      },
    });

    // Crear usuario
    const newUser = await this.prisma.user.create({
      data: {
        correo,
        password: hashedPassword || '',
        personaId: newPersona.id,
      },
    });

    return { message: 'Usuario registrado con éxito', code: 10, user: newUser };
  } catch (error) {
    console.error('Error en signupUser:', error);
    return { message: 'Error interno del servidor', code: 500 };
  }
}
async validateGoogleUser(googleUser: SignupDto) {
  try {         
   
    // Verificar si el usuario ya existe        
    const existingUser = await this.prisma.user.findUnique({
      where: { correo: googleUser.correo}  
    });

    if (existingUser) {
      // Usuario existente → reutilizar validateUser con isSocial = true
      return await this.validateUser(
        { correo: existingUser.correo, password: '' },
        true
      );
    }

    // Usuario no existe → registrar como social    
    const signupPayload: SignupDto = {
      correo: googleUser.correo,
      nombre: googleUser.nombre || '',
      apellido: googleUser.apellido || '',     
    };

    const signupResult = await this.signupUser(signupPayload, true);

    if (signupResult.code !== 10 || !signupResult.user) {
      // Falló el registro
      return signupResult;
    }

    const newUser = signupResult.user;

    // Generar token y respuesta unificada
    return await this.validateUser(
      { correo: newUser.correo, password: '' },
      true
    );
  } catch (error) {
    console.error('Error en validateGoogleUser:', error);
    return { message: 'Error interno del servidor', code: 500 };
  }
}

 
}
