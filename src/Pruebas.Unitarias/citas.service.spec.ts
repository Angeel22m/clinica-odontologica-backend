import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from '../citas/citas.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notificaciones/notificaciones.service';
import { HorarioLaboral } from '../enums/enums';

describe('CitasService', () => {
  let service: CitasService;
  let prisma: any;
  let notificationService: any;

  const mockPrisma = {
    cita: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    empleado: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    persona: {
      findUnique: jest.fn(),
    },
    servicio: {
      findUnique: jest.fn(),
    },
    expediente: {
      findUnique: jest.fn(),
      upsert: jest.fn(),   // ✔ NECESARIO PARA EVITAR ERROR
    },
    $transaction: jest.fn(),
  };

  const mockNotification = {
    notifyDoctor: jest.fn(),
    notifyAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    prisma = module.get(PrismaService);
    notificationService = module.get(NotificationService);

    jest.clearAllMocks();
  });

  // =============================================================
  //                        CREATE
  // =============================================================
  describe('create', () => {
    const fechaFuture = new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0];

    const dtoBase = {
      doctorId: 1,
      pacienteId: 1,
      servicioId: 1,
      fecha: fechaFuture,
      hora: HorarioLaboral.H08_00, // ✔ ENUM CORRECTO
    };

    const mockDoctor = {
      id: 1,
      persona: { id: 101, nombre: 'Juan', apellido: 'Pérez' },
    };

    const mockPaciente = {
      id: 1,
      nombre: 'Carlos',
    };

    const mockServicio = { id: 1, nombre: 'Limpieza' };

    const mockCitaCreada = {
      id: 10,
      ...dtoBase,
      doctor: mockDoctor,
    };

    beforeEach(() => {
      prisma.empleado.findUnique.mockResolvedValue(mockDoctor);
      prisma.persona.findUnique.mockResolvedValue(mockPaciente);
      prisma.servicio.findUnique.mockResolvedValue(mockServicio);

      prisma.cita.create.mockResolvedValue(mockCitaCreada);
      prisma.cita.findFirst.mockResolvedValue(null);

      prisma.expediente.upsert.mockResolvedValue({ id: 999 }); // ✔ IMPORTANTE
    });

    it('Debe crear una cita correctamente', async () => {
      const result = await service.create(dtoBase);

      expect(result.code).toBe(0);
      expect(result.message).toHaveProperty('id');
      expect(prisma.cita.create).toHaveBeenCalled();
      expect(notificationService.notifyDoctor).toHaveBeenCalled();
    });

    it('Debe fallar si el doctor no existe', async () => {
      prisma.empleado.findUnique.mockResolvedValue(null);

      const result = await service.create(dtoBase);

      expect(result.code).toBe(21);
      expect(result.message).toBe('Doctor no encontrado');
    });

    it('Debe fallar si el paciente no existe', async () => {
      prisma.empleado.findUnique.mockResolvedValue(mockDoctor);
      prisma.persona.findUnique.mockResolvedValue(null);

      const result = await service.create(dtoBase);

      expect(result.code).toBe(22);
    });

    it('Debe fallar si la hora no pertenece al enum', async () => {
      const dtoInvalidHour = {
        ...dtoBase,
        hora: '14_00' as unknown as HorarioLaboral,
      };

      const result = await service.create(dtoInvalidHour);

      expect(result.code).toBe(26);
      expect(result.message).toBe('Hora inválida');
    });
  });

  // =============================================================
  //                GET DOCTORES DISPONIBLES
  // =============================================================
  describe('getDoctoresDisponibles', () => {
    it('Debe retornar doctores disponibles', async () => {
      prisma.empleado.findMany.mockResolvedValue([
        { id: 1, persona: { nombre: 'Juan', apellido: 'Pérez' }, puesto: 'DOCTOR', activo: true },
      ]);

      prisma.cita.findMany.mockResolvedValue([
        { doctorId: 1, hora: HorarioLaboral.H08_00 },
      ]);

      const result = await service.getDoctoresDisponibles('2030-01-01');

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
    });
  });

  // =============================================================
  //                GET HORAS DISPONIBLES
  // =============================================================
  describe('getHorasDisponibles', () => {
    it('Debe retornar horas disponibles', async () => {
      prisma.cita.findMany.mockResolvedValue([
        { hora: HorarioLaboral.H08_00 },
      ]);

      const result = await service.getHorasDisponibles(1, '2030-01-01');

      expect(result).toContain(HorarioLaboral.H09_00);
    });
  });

  // =============================================================
  //                CANCELAR CITA
  // =============================================================
  describe('cancelar', () => {
    it('Debe cancelar una cita correctamente', async () => {
      prisma.cita.update.mockResolvedValue({
        doctor: { persona: { id: 101 } },
        doctorId: 1,
      });

      const result = await service.cancelar(1);

      expect(result.code).toBe(0);
      expect(notificationService.notifyDoctor).toHaveBeenCalled();
    });
  });

  // =============================================================
  //                 CONFIRMAR CITA
  // =============================================================
  describe('confirmar', () => {
    it('Debe confirmar una cita correctamente', async () => {
      prisma.cita.update.mockResolvedValue({ doctorId: 1 });

      const result = await service.confirmar(1);

      expect(result.code).toBe(0);
      expect(notificationService.notifyAll).toHaveBeenCalled();
    });
  });
});
