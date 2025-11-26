import { Test, TestingModule } from '@nestjs/testing';
import { ModificarInfoService } from '../EditarInformacio/modificarInfo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ModificarInfoService', () => {
  let service: ModificarInfoService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1,
    correo: 'test@example.com',
    rol: 'CLIENTE',
    persona: {
      id: 10,
      nombre: 'Juan',
      telefono: '9999-9999',
      dni: '0801-2000-00000',
    },
  };

  // Prisma mock
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    persona: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModificarInfoService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ModificarInfoService>(ModificarInfoService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  //                    TESTS -> findUserForUpdate()
  // ----------------------------------------------------------------------
  describe('findUserForUpdate', () => {
    it('Debe retornar el usuario si existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserForUpdate('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { correo: 'test@example.com' },
        include: { persona: true },
      });
    });

    it('Debe lanzar NotFoundException si el usuario no existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findUserForUpdate('no@existe.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ----------------------------------------------------------------------
  //                    TESTS -> updateUserInfo()
  // ----------------------------------------------------------------------
  describe('updateUserInfo', () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
    });

    // --------- PERMISOS ---------
    it('Debe retornar código 403 si el usuario autenticado no tiene permisos', async () => {
      const data = { nombre: 'Nuevo' };
      const userAuth = { correo: 'otro@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        data,
        userAuth,
      );

      expect(result.code).toBe(403);
    });

    // --------- CAMPOS VACÍOS ---------
    it('Debe retornar error 400 si no se enviaron datos válidos', async () => {
      const userAuth = { correo: 'test@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        {},
        userAuth,
      );

      expect(result.code).toBe(400);
      expect(result.message).toBe('No se enviaron datos para actualizar.');
    });

    // --------- VALIDACIÓN: TELÉFONO DUPLICADO ---------
    it('Debe retornar error 400 si el teléfono ya existe', async () => {
      prismaMock.persona.findFirst.mockResolvedValue({ id: 99 });

      const data = { telefono: '8888-8888' };
      const userAuth = { correo: 'test@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        data,
        userAuth,
      );

      expect(result.code).toBe(400);
      expect(result.message).toBe(
        'El teléfono ya está en uso por otro usuario.',
      );
    });

    // --------- VALIDACIÓN: CORREO DUPLICADO ---------
    it('Debe retornar error 400 si el correo ya existe', async () => {
      prismaMock.persona.findFirst.mockResolvedValue(null);

      prismaMock.user.findFirst.mockResolvedValue({ id: 2 });

      const data = { correo: 'nuevo@example.com' };
      const userAuth = { correo: 'test@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        data,
        userAuth,
      );

      expect(result.code).toBe(400);
      expect(result.message).toBe('El correo ya está en uso.');
    });

    // --------- VALIDACIÓN: DNI DUPLICADO ---------
    it('Debe retornar error 400 si el DNI ya existe', async () => {
      prismaMock.persona.findFirst.mockResolvedValue({ id: 999 });

      const data = { dni: '0801-1999-99999' };
      const userAuth = { correo: 'test@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        data,
        userAuth,
      );

      expect(result.code).toBe(400);
      expect(result.message).toBe('El DNI ya existe.');
    });

    // --------- ACTUALIZACIÓN EXITOSA ---------
    it('Debe actualizar correctamente los datos', async () => {
      prismaMock.persona.findFirst.mockResolvedValue(null);
      prismaMock.user.findFirst.mockResolvedValue(null);

      // valor retornado por prisma.update
      prismaMock.user.update.mockResolvedValue({
        id: 1,
        correo: 'nuevo@example.com',
        persona: {
          nombre: 'Nuevo Nombre',
        },
      });

      const data = {
        correo: 'nuevo@example.com',
        nombre: 'Nuevo Nombre',
      };

      const userAuth = { correo: 'test@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        data,
        userAuth,
      );

      expect(result.message).toBe('Información actualizada correctamente.');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { correo: 'test@example.com' },
        data: {
          correo: 'nuevo@example.com',
          persona: { update: { nombre: 'Nuevo Nombre' } },
        },
        include: { persona: true },
      });
    });

    // --------- ERROR INTERNO ---------
    it('Debe manejar excepciones internas y retornar code 500', async () => {
      prismaMock.persona.findFirst.mockResolvedValue(null);
      prismaMock.user.findFirst.mockResolvedValue(null);

      prismaMock.user.update.mockRejectedValue(new Error('DB ERROR'));

      const data = { nombre: 'Error Test' };
      const userAuth = { correo: 'test@example.com', rol: 'CLIENTE' };

      const result = await service.updateUserInfo(
        'test@example.com',
        data,
        userAuth,
      );

      expect(result.code).toBe(500);
      expect(result.message).toBe('Error interno del servidor');
    });
  });
});
