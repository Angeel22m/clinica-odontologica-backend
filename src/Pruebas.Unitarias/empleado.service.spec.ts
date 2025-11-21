import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadoService } from '../empleado/empleado.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Puesto, Rol } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_mock'),
}));

describe('EmpleadoService', () => {
  let service: EmpleadoService;
  let prisma: any;

  const mockPrisma = {
    $transaction: jest.fn(),
    persona: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    empleado: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadoService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmpleadoService>(EmpleadoService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  //                   createEmpleado()
  // -------------------------------------------------------
  describe('createEmpleado', () => {
    const dto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '1234',
      telefono: '9999',
      direccion: 'Ciudad',
      fechaNac: new Date(),
      puesto: Puesto.DOCTOR,     // ✔ ENUM VÁLIDO
      salario: 5000,
      fechaIngreso: new Date(),
      activo: true,
      correo: 'test@mail.com',
      password: '1234',
      rol: Rol.ADMIN,            // ✔ ENUM VÁLIDO
      usuarioActivo: true,
    };

    it('debe lanzar error si el DNI ya existe', async () => {
      prisma.$transaction.mockImplementation(async (cb) =>
        cb({
          persona: {
            findFirst: jest.fn().mockResolvedValue({ id: 1, dni: dto.dni }),
          },
          user: {},
          empleado: {},
        })
      );

      await expect(service.createEmpleado(dto)).rejects.toThrow(
        new BadRequestException(`El DNI ${dto.dni} ya está registrado.`)
      );
    });

    it('debe lanzar error si el correo ya existe', async () => {
      prisma.$transaction.mockImplementation(async (cb) =>
        cb({
          persona: { findFirst: jest.fn().mockResolvedValue(null) },
          user: { findUnique: jest.fn().mockResolvedValue({ id: 1 }) },
          empleado: {},
        })
      );

      await expect(service.createEmpleado(dto)).rejects.toThrow(
        new BadRequestException(`El correo ${dto.correo} ya está registrado.`)
      );
    });

    it('debe crear persona, empleado y usuario correctamente', async () => {
      prisma.$transaction.mockImplementation(async (cb) =>
        cb({
          persona: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 10 }),
          },
          empleado: {
            create: jest.fn().mockResolvedValue({ id: 20 }),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 30 }),
          },
        })
      );

      const result = await service.createEmpleado(dto);

      expect(result).toEqual({
        empleado: { id: 20 },
        usuario: { id: 30 },
        newpersona: { id: 10 },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    });
  });

  // -------------------------------------------------------
  //                      findAll()
  // -------------------------------------------------------
  describe('findAll', () => {
    it('debe retornar empleados', async () => {
      mockPrisma.empleado.findMany.mockResolvedValue(['empleado1']);

      const result = await service.findAll();

      expect(result).toEqual(['empleado1']);
      expect(mockPrisma.empleado.findMany).toHaveBeenCalledWith({
        include: { persona: true },
      });
    });
  });

  // -------------------------------------------------------
  //                 findAllCompleto()
  // -------------------------------------------------------
  describe('findAllCompleto', () => {
    it('debe regresar todos los empleados', async () => {
      mockPrisma.empleado.findMany.mockResolvedValue(['emp1', 'emp2']);

      const result = await service.findAllCompleto();

      expect(result).toEqual(['emp1', 'emp2']);
      expect(mockPrisma.empleado.findMany).toHaveBeenCalledWith({
        include: { persona: true },
      });
    });
  });

  // -------------------------------------------------------
  //                    UpdateEmpleado()
  // -------------------------------------------------------
  describe('UpdateEmpleado', () => {
    const dtoUpdate = {
      nombre: 'Nuevo',
      apellido: 'Apellido',
      dni: '5678',
      telefono: '1234',
      direccion: 'Nueva direccion',
      fechaNac: new Date(),
      puesto: Puesto.ADMINISTRADOR,      // ✔ ENUM
      salario: 6000,
      fechaIngreso: new Date(),
      activo: false,
      correo: 'nuevo@mail.com',
      password: 'nueva123',
      rol: Rol.RECEPCIONISTA,            // ✔ ENUM
      usuarioActivo: false,
    };

    it('debe lanzar error si el DNI ya existe en otra persona', async () => {
      prisma.$transaction.mockImplementation(async (cb) =>
        cb({
          empleado: {
            findUnique: jest.fn().mockResolvedValue({
              personaId: 10,
              persona: {},
            }),
          },
          persona: {
            findFirst: jest.fn().mockResolvedValue({ id: 99, dni: dtoUpdate.dni }),
          },
        })
      );

      await expect(service.UpdateEmpleado(10, dtoUpdate)).rejects.toThrow(
        new BadRequestException(`El DNI ${dtoUpdate.dni} ya está registrado.`)
      );
    });

    it('debe actualizar correctamente persona, empleado y usuario', async () => {
      prisma.$transaction.mockImplementation(async (cb) =>
        cb({
          empleado: {
            findUnique: jest.fn().mockResolvedValue({
              personaId: 10,
              persona: {},
            }),
            update: jest.fn().mockResolvedValue({ id: 20 }),
          },
          persona: {
            findFirst: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue({ id: 10 }),
          },
          user: {
            findFirst: jest.fn().mockResolvedValue({ id: 5, password: 'old' }),
            update: jest.fn().mockResolvedValue({ id: 5 }),
          },
        })
      );

      const result = await service.UpdateEmpleado(10, dtoUpdate);

      expect(result.persona).toEqual({ id: 10 });
      expect(result.empleado).toEqual({ id: 20 });
      expect(result.usuario).toEqual({ id: 5 });

      expect(bcrypt.hash).toHaveBeenCalledWith(dtoUpdate.password, 10);
    });
  });
});
