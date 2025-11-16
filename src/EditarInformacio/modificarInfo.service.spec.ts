import { Test, TestingModule } from '@nestjs/testing';
import { ModificarInfoService } from './modificarInfo.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock del PrismaService
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ModificarInfoService', () => {
  let service: ModificarInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModificarInfoService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ModificarInfoService>(ModificarInfoService);

    jest.clearAllMocks();
  });

  // ------------------------------------------------------------------------------------
  // 1. Usuario NO encontrado
  // ------------------------------------------------------------------------------------
  it('debe lanzar NotFoundException si el usuario no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.completarDatosPorCorreo('noexiste@mail.com', { nombre: 'Test' })
    ).rejects.toThrow(NotFoundException);
  });

  // ------------------------------------------------------------------------------------
  // 2. Persona NO es cliente (sin personaId)
  // ------------------------------------------------------------------------------------
  it('debe lanzar BadRequestException si el usuario no es cliente', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      correo: 'cliente@mail.com',
      personaId: null, // No es cliente
    });

    await expect(
      service.completarDatosPorCorreo('cliente@mail.com', { nombre: 'Test' })
    ).rejects.toThrow(BadRequestException);
  });

  // ------------------------------------------------------------------------------------
  // 3. Body vacío (sin datos válidos)
  // ------------------------------------------------------------------------------------
  it('debe lanzar BadRequestException si no hay campos válidos', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      correo: 'cliente@mail.com',
      personaId: 5,
      persona: {},
    });

    await expect(
      service.completarDatosPorCorreo('cliente@mail.com', {})
    ).rejects.toThrow(BadRequestException);
  });

  // ------------------------------------------------------------------------------------
  // 4. Actualización exitosa
  // ------------------------------------------------------------------------------------
  it('debe actualizar correctamente los datos del cliente', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      correo: 'cliente@mail.com',
      personaId: 5,
      persona: {},
    });

    prismaMock.user.update.mockResolvedValue({
      id: 1,
      correo: 'cliente@mail.com',
      nombre: 'Juan',
    });

    const result = await service.completarDatosPorCorreo(
      'cliente@mail.com',
      { nombre: 'Juan' }
    );

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { correo: 'cliente@mail.com' },
      data: { nombre: 'Juan' },
    });

    expect(result).toEqual({
      message: 'Datos del cliente completados correctamente.',
      personaActualizada: {
        id: 1,
        correo: 'cliente@mail.com',
        nombre: 'Juan',
      },
    });
  });
});
