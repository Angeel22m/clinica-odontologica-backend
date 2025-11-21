jest.mock('../enums/enums', () => ({
  HorarioLaboral: {
    H08_00: 'H08_00',
    H08_30: 'H08_30',
  },
}));
import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { PrismaService } from '../prisma/prisma.service';
import { HorarioLaboral } from '../enums/enums';
import { NotificationService } from '../notificaciones/notificaciones.service';

describe('CitasService', () => {
  let service: CitasService;
  let prisma: Partial<Record<keyof PrismaService, any>>;
  let mockNotificationService: Partial<Record<keyof NotificationService, any>>;

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

    mockNotificationService = {
      notifyAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe('create', () => {
    const fechaFutura = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    it('Debe crear una cita de manera exitosa.', async () => {
      prisma.empleado.findUnique.mockResolvedValue({ id: 1 });
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      prisma.cita.findFirst.mockResolvedValue(null);
      prisma.cita.create.mockResolvedValue({
        id: 1,
        doctorId: 1,
        pacienteId: 1,
        fecha: fechaFutura,
        hora: '08:00',
      });

      const result = await service.create({
        doctorId: 1,
        pacienteId: 1,
        fecha: fechaFutura,
        hora: 'H08_00' as HorarioLaboral,
      });

      expect(result.code).toBe(0);
      expect(result.message).toHaveProperty('id');
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
      const citasMock = [
        {
          id: 1,
          fecha: '2025-11-19',
          hora: '08:00',
          doctorId: 1,
          pacienteId: 1,
          doctor: { id: 1, persona: { nombre: 'Juan', apellido: 'Pérez' } },
          paciente: { id: 1, nombre: 'Carlos', apellido: 'Gómez' },
          servicio: { id: 1, nombre: 'Limpieza' },
        },
        {
          id: 2,
          fecha: '2025-11-20',
          hora: '09:00',
          doctorId: 2,
          pacienteId: 2,
          doctor: { id: 2, persona: { nombre: 'Ana', apellido: 'López' } },
          paciente: { id: 2, nombre: 'Laura', apellido: 'Martínez' },
          servicio: { id: 2, nombre: 'Consulta' },
        },
      ];

      prisma.cita.findMany.mockResolvedValue(citasMock);

      const result = await service.findAll({});
      expect(result).toEqual(citasMock);
      expect(prisma.cita.findMany).toHaveBeenCalledTimes(1);
    });

    it('Debe filtrar citas por fecha', async () => {
      const fecha = '2025-11-19';
      const citasMock = [
        {
          id: 1,
          fecha,
          hora: '08:00',
          doctorId: 1,
          pacienteId: 1,
          doctor: { id: 1, persona: { nombre: 'Juan', apellido: 'Pérez' } },
          paciente: { id: 1, nombre: 'Carlos', apellido: 'Gómez' },
          servicio: { id: 1, nombre: 'Limpieza' },
        },
      ];
      prisma.cita.findMany.mockResolvedValue(citasMock);

      const result = await service.findAll({ fecha });
      expect(result).toEqual(citasMock);
      expect(prisma.cita.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fecha: expect.any(Object),
          }),
          include: { doctor: true, servicio: true, paciente: true },
          orderBy: { hora: 'asc' },
        }),
      );
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
    const citaExistente = {
      id: 1,
      doctorId: 1,
      pacienteId: 1,
      fecha: new Date(),
      hora: '08:00',
    };

    it('Debe retornar error si la cita no existe', async () => {
      prisma.cita.findUnique.mockResolvedValue(null);

      const result = await service.update(1, { hora: HorarioLaboral.H08_30 });
      expect(result).toEqual({ message: 'Cita no encontrada', code: 4 });
    });

    it('Debe retornar error si la hora es inválida', async () => {
      prisma.cita.findUnique.mockResolvedValue(citaExistente);

      const result = await service.update(1, { hora: 'H20_00' as HorarioLaboral });
      expect(result).toEqual({ message: 'Hora inválida', code: 26 });
    });

    it('Debe actualizar la cita correctamente', async () => {
      prisma.cita.findUnique.mockResolvedValue(citaExistente);
      prisma.cita.findFirst.mockResolvedValue(null);
      prisma.cita.update.mockImplementation(async ({ where, data }) => ({
        ...citaExistente,
        ...data,
      }));

      const result = await service.update(1, { hora: 'H08_00' }); // valor original del enum
      expect(result.code).toBe(0);
      expect(result.message.hora).toBe('08:00'); // normalización
      expect(mockNotificationService.notifyAll).toHaveBeenCalledWith(
        'updateCitasDoctor',
        citaExistente.doctorId,
      );
    });

    it('Debe retornar error si existe conflicto de horario', async () => {
      prisma.cita.findUnique.mockResolvedValue(citaExistente);
      prisma.cita.findFirst.mockResolvedValue({ id: 2 }); // otra cita existente

      const result = await service.update(1, { hora: 'H08_00' });
      expect(result).toEqual({
        message: 'El doctor ya tiene una cita en ese horario',
        code: 24,
      });
    });
  });
});
