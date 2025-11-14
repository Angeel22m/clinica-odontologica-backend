import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { PrismaService } from '../prisma/prisma.service';
import { HorarioLaboral } from '../enums/enums';
import { Prisma } from '@prisma/client';

describe('CitasService', () => {
  let service: CitasService;
  let prisma: Partial<Record<keyof PrismaService, any>>;

  beforeEach(async () => {
    prisma = {
      empleado: {
        findUnique: jest.fn(),
      },
      persona: {
        findUnique: jest.fn(),
      },
      cita: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CitasService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CitasService>(CitasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe('create', () => {
    it('Debe retornar un mensaje de error si el doctor no existe.', async () => {
      prisma.empleado.findUnique.mockResolvedValue(null);

      const result = await service.create({
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date().toISOString(),
        hora: HorarioLaboral.H08_00,
      });

      expect(result).toEqual({ message: 'Doctor no encontrado', code: 21 });
    });

    it('Debe retornar un mensaje de error si el paciente no existe.', async () => {
      prisma.empleado.findUnique.mockResolvedValue({ id: 1 });
      prisma.persona.findUnique.mockResolvedValue(null);

      const result = await service.create({
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date().toISOString(),
        hora: HorarioLaboral.H08_00,
      });

      expect(result).toEqual({ message: 'Paciente no encontrado', code: 22 });
    });

    it('Debe retornar un mensaje de error si la fecha es inválida.', async () => {
      prisma.empleado.findUnique.mockResolvedValue({ id: 1 });
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });

      const result = await service.create({
        doctorId: 1,
        pacienteId: 1,
        fecha: 'invalid-date',
        hora: HorarioLaboral.H08_00,
      });

      expect(result).toEqual({
        message: 'Formato de fecha inválido',
        code: 23,
      });
    });

    it('Debe retornar un mensaje de error si la hora es inválida.', async () => {
      prisma.empleado.findUnique.mockResolvedValue({ id: 1 });
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });

      const result = await service.create({
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date().toISOString(),
        hora: 'H20_00' as HorarioLaboral,
      });

      expect(result).toEqual({ message: 'Hora inválida', code: 26 });
    });

    it('Debe crear una cita de manera exitosa.', async () => {
      prisma.empleado.findUnique.mockResolvedValue({ id: 1 });
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      prisma.cita.findFirst.mockResolvedValue(null);
      prisma.cita.create.mockResolvedValue({
        id: 1,
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date(),
        hora: HorarioLaboral.H08_00,
      });

      const result = await service.create({
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date().toISOString(),
        hora: HorarioLaboral.H08_00,
      });

      expect(result.code).toBe(0);
      expect(result.message).toHaveProperty('id');
    });
  });

  // ---------------- FINDALL ----------------
  describe('findAll', () => {
    it('Debe retornar todas las citas', async () => {
      const citasMock = [{ id: 1 }, { id: 2 }];
      prisma.cita.findMany.mockResolvedValue(citasMock);

      const result = await service.findAll();
      expect(result).toEqual(citasMock);
    });
  });

  // ---------------- FINDONE ----------------
  describe('findOne', () => {
    it('Debe retornar error si no encuentra la cita.', async () => {
      prisma.cita.findUnique.mockResolvedValue(null);

      const result = await service.findOne(1);
      expect(result).toEqual({ message: 'Cita no encontrada', code: 4 });
    });

    it('Debe retornar la cita encontrada', async () => {
      const citaMock = { id: 1 };
      prisma.cita.findUnique.mockResolvedValue(citaMock);

      const result = await service.findOne(1);
      expect(result).toEqual(citaMock);
    });
  });

  // ---------------- UPDATE ----------------
  describe('update', () => {
    it('Debe retornar error si la cita no es encontrada', async () => {
      prisma.cita.findUnique.mockResolvedValue(null);

      const result = await service.update(1, { hora: HorarioLaboral.H08_30 });
      expect(result).toEqual({ message: 'Cita no encontrada', code: 4 });
    });

    it('Deeb retornar error si el doctor no existe', async () => {
      const citaMock = {
        id: 1,
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date(),
        hora: HorarioLaboral.H08_00,
      };
      prisma.cita.findUnique.mockResolvedValue(citaMock);
      prisma.empleado.findUnique.mockResolvedValue(null);

      const result = await service.update(1, { doctorId: 2 });
      expect(result).toEqual({ message: 'Doctor no encontrado', code: 21 });
    });

    it('Debe actualizar la cita de forma existosa', async () => {
      const citaMock = {
        id: 1,
        doctorId: 1,
        pacienteId: 1,
        fecha: new Date(),
        hora: HorarioLaboral.H08_00,
      };
      prisma.cita.findUnique.mockResolvedValue(citaMock);
      prisma.cita.findFirst.mockResolvedValue(null);
      prisma.cita.update.mockResolvedValue({
        ...citaMock,
        hora: HorarioLaboral.H08_30,
      });

      const result = await service.update(1, { hora: HorarioLaboral.H08_30 });
      expect(result.code).toBe(0);
      expect(result.message.hora).toBe(HorarioLaboral.H08_30);
    });
  });
});
