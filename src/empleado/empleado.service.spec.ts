import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadoService } from './empleado.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock global de bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('EmpleadoService', () => {
  let service: EmpleadoService;
  let prisma: any;

  // DTO de prueba
  const dto = {
    nombre: 'Juan',
    apellido: 'Perez',
    dni: '12345678',
    telefono: '555-1234',
    direccion: 'Calle Falsa 123',
    fechaNac: new Date('1990-01-01'),
    puesto: 'DOCTOR',
    salario: 1000,
    fechaIngreso: new Date(),
    activo: true,
    correo: 'juan@mail.com',
    password: 'secret',
    rol: 'ADMIN',
    usuarioActivo: true,
  };

  beforeEach(async () => {
    // Mock de PrismaService
    const mockPrismaService = {
      $transaction: jest.fn(),
      empleado: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      persona: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadoService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EmpleadoService>(EmpleadoService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =================================================
  // Test createEmpleado
  // =================================================
  describe('createEmpleado', () => {
    it('should create an empleado with persona and user', async () => {
      // Mock de hash de bcrypt
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Mock del transaction
      prisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          persona: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 1, ...dto }),
          },
          empleado: {
            create: jest.fn().mockResolvedValue({ id: 1, personaId: 1, ...dto }),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 1, correo: dto.correo }),
          },
        });
      });

      const result = await service.createEmpleado(dto as any);

      expect(result.empleado).toBeDefined();
      expect(result.usuario).toBeDefined();
      expect(result.newpersona).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    });

    it('should throw BadRequestException if DNI exists', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          persona: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
          user: { findUnique: jest.fn() },
          empleado: { create: jest.fn() },
        });
      });

      await expect(service.createEmpleado(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if correo exists', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          persona: { findUnique: jest.fn().mockResolvedValue(null) },
          user: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
          empleado: { create: jest.fn() },
        });
      });

      await expect(service.createEmpleado(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  // =================================================
  // Test UpdateEmpleado
  // =================================================
  describe('UpdateEmpleado', () => {
    it('should update empleado, persona and user', async () => {
      const updateDto = { nombre: 'Juan Actualizado', password: 'newPass' };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPass');

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          empleado: {
            findUnique: jest.fn().mockResolvedValue({ personaId: 1 }),
            update: jest.fn().mockResolvedValue({ id: 1, ...updateDto }),
          },
          persona: {
            update: jest.fn().mockResolvedValue({ id: 1, ...updateDto }),
          },
          user: {
            findFirst: jest.fn().mockResolvedValue({ id: 1, password: 'oldHash' }),
            update: jest.fn().mockResolvedValue({ id: 1, password: 'hashedNewPass' }),
          },
        });
      });

      const result = await service.UpdateEmpleado(1, updateDto as any);

      expect(result.empleado).toBeDefined();
      expect(result.persona).toBeDefined();
      expect(result.usuario).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith('newPass', 10);
    });

    it('should throw NotFoundException if empleado does not exist', async () => {
      prisma.$transaction.mockImplementation(async (cb) => {
        return cb({
          empleado: { findUnique: jest.fn().mockResolvedValue(null) },
          persona: { update: jest.fn() },
          user: { findFirst: jest.fn() },
        });
      });

      await expect(service.UpdateEmpleado(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });
});
