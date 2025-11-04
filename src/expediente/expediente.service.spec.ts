import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { Prisma } from '@prisma/client';

// 1. Definir el Mock para PrismaService
// Simulamos todos los modelos y métodos utilizados en el servicio.
const mockPrismaService = {
  persona: {
    findUnique: jest.fn(),
  },
  empleado: {
    findUnique: jest.fn(),
  },
  expediente: {
    findUnique: jest.fn(),
    findFirst: jest.fn(), // Aunque no se usa, lo mantenemos por consistencia
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expedienteDetalle: {
    findMany: jest.fn(),
  },
};

describe('ExpedienteService', () => {
  let service: ExpedienteService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    // Limpiamos los mocks antes de cada test para asegurar el aislamiento
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedienteService,
        {
          // Sustituimos el PrismaService real por nuestro mock
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExpedienteService>(ExpedienteService);
    prisma = module.get<typeof mockPrismaService>(PrismaService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- PRUEBAS PARA create(createExpedienteDto) ---
  describe('create', () => {
    const createDto: CreateExpedienteDto = {
      pacienteId: 1,
      doctorId: 10,
      alergias: 'Ninguna',
      enfermedades: 'Ninguna',
    };
    const mockExpedienteCreado = { id: 100, ...createDto };

    // Caso de Éxito
    it('debe crear el expediente si todas las validaciones son exitosas', async () => {
      // Mocks: 1. Paciente existe
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      // Mocks: 2. Expediente no existe
      prisma.expediente.findUnique.mockResolvedValue(null);
      // Mocks: 3. Doctor existe y es DOCTOR
      prisma.empleado.findUnique.mockResolvedValue({ id: 10, puesto: 'DOCTOR' });
      // Mocks: 4. Creación exitosa
      prisma.expediente.create.mockResolvedValue(mockExpedienteCreado);

      const result = await service.create(createDto);

      expect(result).toEqual(mockExpedienteCreado);
      expect(prisma.expediente.create).toHaveBeenCalledWith({ data: createDto });
    });

    // Validaciones de Claves Foráneas (Excepciones 404)
    it('debe lanzar NotFoundException si el pacienteId no existe', async () => {
      // Mock: Paciente no existe
      prisma.persona.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(prisma.expediente.create).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el doctorId no existe o no es un DOCTOR', async () => {
      // Mock: Paciente existe
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      // Mock: Expediente no existe
      prisma.expediente.findUnique.mockResolvedValue(null);

      // Simula que el Doctor no existe
      prisma.empleado.findUnique.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);

      // Simula que existe pero NO es DOCTOR
      prisma.empleado.findUnique.mockResolvedValue({ id: 10, puesto: 'RECEPCIONISTA' });
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);

      expect(prisma.expediente.create).not.toHaveBeenCalled();
    });

    // Validación de Unicidad (Excepción 400)
    it('debe lanzar BadRequestException si el expediente para el paciente ya existe', async () => {
      // Mocks: 1. Paciente existe
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      // Mocks: 2. Expediente YA existe
      prisma.expediente.findUnique.mockResolvedValue({ id: 50 });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(prisma.expediente.create).not.toHaveBeenCalled();
    });

    // Manejo de Errores Genéricos (Excepción 500)
    it('debe lanzar InternalServerErrorException si la creación falla inesperadamente', async () => {
      // Mocks: Todos los checks OK
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      prisma.expediente.findUnique.mockResolvedValue(null);
      prisma.empleado.findUnique.mockResolvedValue({ id: 10, puesto: 'DOCTOR' });
      // Mock: La creación falla
      prisma.expediente.create.mockRejectedValue(new Error('Simulated DB connection error'));

      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- PRUEBAS PARA findOne(id) ---
  describe('findOne', () => {
    const mockExpediente = { id: 1, alergias: 'Ninguna', include: { /* ... */ } };

    it('debe devolver el expediente si es encontrado', async () => {
      prisma.expediente.findUnique.mockResolvedValue(mockExpediente);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockExpediente);
      expect(prisma.expediente.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.anything(),
      });
    });

    it('debe lanzar NotFoundException si el expediente no existe', async () => {
      prisma.expediente.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // --- PRUEBAS PARA update(id, dto) ---
  describe('update', () => {
    const updateDto = { alergias: 'Polen' };
    const mockExpedienteActualizado = { id: 1, alergias: 'Polen' };

    it('debe actualizar el expediente si es encontrado', async () => {
      prisma.expediente.update.mockResolvedValue(mockExpedienteActualizado);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockExpedienteActualizado);
      expect(prisma.expediente.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('debe lanzar NotFoundException si el expediente no existe (Prisma P2025)', async () => {
      // Simulamos el error P2025 que ocurre cuando se intenta actualizar un registro que no existe
      const notFoundError = new Prisma.PrismaClientKnownRequestError('Record to update not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      prisma.expediente.update.mockRejectedValue(notFoundError);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });
  
  // --- PRUEBAS PARA remove(id) ---
  describe('remove', () => {
    it('debe eliminar el expediente y devolver el mensaje de éxito', async () => {
      // Mock: delete se resuelve (éxito en la eliminación)
      prisma.expediente.delete.mockResolvedValue({ id: 1 }); 

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Expediente eliminado correctamente' });
      expect(prisma.expediente.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('debe lanzar NotFoundException si el expediente no existe (Prisma P2025)', async () => {
      const notFoundError = new Prisma.PrismaClientKnownRequestError('Record to delete not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
      prisma.expediente.delete.mockRejectedValue(notFoundError);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // --- PRUEBAS PARA getHistorialPaciente(pacienteId) ---
  describe('getHistorialPaciente', () => {
    const pacienteId = 5;
    const mockHistorial = [
      { fecha: new Date(), motivo: 'Control', doctor: { /* ... */ } },
      { fecha: new Date(), motivo: 'Extracción', doctor: { /* ... */ } },
    ];

    it('debe devolver el historial si hay registros', async () => {
      prisma.expedienteDetalle.findMany.mockResolvedValue(mockHistorial);

      const result = await service.getHistorialPaciente(pacienteId);

      expect(result).toEqual(mockHistorial);
      expect(prisma.expedienteDetalle.findMany).toHaveBeenCalledWith({
        where: { expediente: { pacienteId } },
        orderBy: { fecha: 'desc' },
        include: expect.anything(),
      });
    });

    it('debe lanzar NotFoundException si no hay historial para el paciente', async () => {
      // Mock: findMany devuelve un array vacío
      prisma.expedienteDetalle.findMany.mockResolvedValue([]);

      await expect(service.getHistorialPaciente(pacienteId)).rejects.toThrow(NotFoundException);
    });
  });
});