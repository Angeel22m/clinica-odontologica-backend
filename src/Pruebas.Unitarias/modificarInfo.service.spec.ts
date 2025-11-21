import { Test, TestingModule } from '@nestjs/testing';
import { ModificarInfoService } from '../EditarInformacio/modificarInfo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ModificarInfoService', () => {
  let service: ModificarInfoService;

  // Mock correcto de Prisma
  let prismaMock: {
    user: {
      findUnique: jest.Mock<any, any>;
      update: jest.Mock<any, any>;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModificarInfoService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ModificarInfoService>(ModificarInfoService);
  });

  // --------------------------------------------------------------------
  // 🔹 TEST 1: Usuario no existe
  // --------------------------------------------------------------------
  it('Debe lanzar NotFoundException si el usuario no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.buscarPorCorreo('noexiste@mail.com'),
    ).rejects.toThrow(NotFoundException);
  });

  // --------------------------------------------------------------------
  // 🔹 TEST 2: Usuario no es cliente
  // --------------------------------------------------------------------
  it('Debe lanzar BadRequestException si el usuario no es cliente', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      correo: 'empleado@mail.com',
      rol: 'EMPLEADO',
      persona: {},
    });

    await expect(
      service.buscarPorCorreo('empleado@mail.com'),
    ).rejects.toThrow(BadRequestException);
  });

  // --------------------------------------------------------------------
  // 🔹 TEST 3: Retornar usuario válido si es cliente
  // --------------------------------------------------------------------
  it('Debe retornar el usuario si es cliente', async () => {
    const mockUser = {
      correo: 'cliente@mail.com',
      rol: 'CLIENTE',
      persona: {},
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.buscarPorCorreo('cliente@mail.com');

    expect(result).toEqual(mockUser);
  });

  // --------------------------------------------------------------------
  // 🔹 TEST 4: No permite datos vacíos
  // --------------------------------------------------------------------
  it('Debe lanzar BadRequestException si no se envían datos válidos', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      correo: 'cliente@mail.com',
      rol: 'CLIENTE',
      persona: {},
    });

    await expect(
      service.completarDatosPorCorreo('cliente@mail.com', {}),
    ).rejects.toThrow(BadRequestException);
  });

  // --------------------------------------------------------------------
  // 🔹 TEST 5: Actualiza persona correctamente sin password
  // --------------------------------------------------------------------
  it('Debe actualizar persona sin password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      correo: 'cliente@mail.com',
      rol: 'CLIENTE',
      persona: {},
    });

    prismaMock.user.update.mockResolvedValue({
      correo: 'cliente@mail.com',
      persona: { nombre: 'Juan' },
    });

    const result = await service.completarDatosPorCorreo('cliente@mail.com', {
      nombre: 'Juan',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { correo: 'cliente@mail.com' },
      data: {
        persona: {
          update: { nombre: 'Juan' },
        },
      },
    });

    expect(result.message).toBe('Datos del cliente completados correctamente.');
  });

  // --------------------------------------------------------------------
  // 🔹 TEST 6: Actualiza persona + password
  // --------------------------------------------------------------------
  it('Debe actualizar persona y password cuando se envía', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      correo: 'cliente@mail.com',
      rol: 'CLIENTE',
      persona: {},
    });

    prismaMock.user.update.mockResolvedValue({
      correo: 'cliente@mail.com',
      persona: { nombre: 'Juan' },
      password: '12345',
    });

    const result = await service.completarDatosPorCorreo('cliente@mail.com', {
      nombre: 'Juan',
      password: '12345',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { correo: 'cliente@mail.com' },
      data: {
        password: '12345',
        persona: {
          update: { nombre: 'Juan' },
        },
      },
    });

    expect(result.message).toBe('Datos del cliente completados correctamente.');
  });
});
