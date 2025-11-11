import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  persona: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
};

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  // validateUser()
  describe('validateUser', () => {
    const bcryptCompare = bcrypt.compare as jest.Mock;
    const mockUser = {
      id: 1,
      correo: 'test@example.com',
      password: 'hashed123',
      rol: 'admin',
    };

    it('debería retornar código 11 si el usuario no existe', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.validateUser({
        correo: 'noexiste@example.com',
        password: '1234',
      });

      expect(result).toEqual({ message: 'Usuario no encontrado', code: 11 });
    });

    it('debería retornar código 13 si la contraseña no coincide', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(false);

      const result = await service.validateUser({
        correo: 'test@example.com',
        password: 'wrongpass',
      });

      expect(result).toEqual({ message: 'Credenciales erróneas.', code: 13 });
    });

    it('debería retornar token y datos de usuario si todo es correcto', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      bcryptCompare.mockResolvedValue(true as never);

      const result = await service.validateUser({
        correo: 'test@example.com',
        password: 'hashed123',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        correo: mockUser.correo,
        rol: mockUser.rol,
      });
      expect(result).toEqual({
        message: 'Autenticación exitosa',
        code: 0,
        token: 'mocked-jwt-token',
        user: { id: 1, correo: 'test@example.com', rol: 'admin' },
      });
    });

    it('debería manejar errores internos', async () => {
      prisma.user.findFirst.mockRejectedValue(new Error('DB error'));

      const result = await service.validateUser({
        correo: 'test@example.com',
        password: '1234',
      });

      expect(result.code).toBe(500);
    });
  });

  // -------------------------------------------------------------------------
  // 🔹 TESTS: signupUser()
  // -------------------------------------------------------------------------
  describe('signupUser', () => {
    const bcryptHash = bcrypt.hash as jest.Mock;
    const signupDto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '0801-2000-00001',
      telefono: '99999999',
      direccion: 'Col. Miraflores',
      fechaNac: '1990-01-01',
      correo: 'nuevo@example.com',
      password: '12345678',
    };

    it('debería retornar código 12 si el correo ya está registrado', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });

      const result = await service.signupUser(signupDto);

      expect(result).toEqual({
        message: 'El correo ya está registrado',
        code: 12,
      });
    });

    it('debería crear un nuevo usuario y persona correctamente', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptHash.mockResolvedValue('hashedPass');
      prisma.persona.create.mockResolvedValue({ id: 10 });
      prisma.user.create.mockResolvedValue({ id: 1 });

      const result = await service.signupUser(signupDto);

      expect(prisma.persona.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '0801-2000-00001',
        }),
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          correo: signupDto.correo,
          password: 'hashedPass',
          personaId: 10,
        }),
      });

      expect(result).toEqual({
        message: 'Usuario registrado con éxito',
        code: 10,
      });
    });

    it('debería manejar errores internos durante el registro', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      bcryptHash.mockRejectedValue(new Error('Hash error'));

      const result = await service.signupUser(signupDto);
      expect(result.code).toBe(500);
    });
  });
});
