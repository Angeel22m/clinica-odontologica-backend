import { Test, TestingModule } from '@nestjs/testing';
import { ExpedienteService } from '../expediente/expediente.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../firebase/storage.service';
import { CreateExpedienteDto } from '../expediente/dto/create-expediente.dto';
import { UpdateExpedienteDto } from '../expediente/dto/update-expediente.dto';

// 🔹 Mock de uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

// 🔹 Mock de PrismaService
const mockPrismaService = {
  $transaction: jest.fn((queries) => Promise.all(queries)),

  expediente: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expedienteDoctor: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  expedienteDetalle: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  persona: { findUnique: jest.fn() },
  empleado: { findUnique: jest.fn() },
};

// 🔹 Mock de StorageService
const mockStorageService = {
  generateSignedUrls: jest.fn(),
};

describe('ExpedienteService', () => {
  let service: ExpedienteService;
  let prisma: typeof mockPrismaService;
  let storage: typeof mockStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedienteService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<ExpedienteService>(ExpedienteService);
    prisma = module.get(PrismaService);
    storage = module.get(StorageService);

    // Resetear mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==============================================
  // Test de findAll()
  // ==============================================
  describe('findAll', () => {
    it('debe devolver todos los expedientes', async () => {
      const mockExpedientes = [
        { id: 1, pacienteId: 1, doctorId: 2 },
        { id: 2, pacienteId: 3, doctorId: 4 },
      ];
      prisma.expediente.findMany.mockResolvedValue(mockExpedientes);

      const result = await service.findAll();

      expect(result).toEqual(mockExpedientes);
      expect(prisma.expediente.findMany).toHaveBeenCalled();
    });
  });

  // ==============================================
  // Test de findOne()
  // ==============================================
  describe('findOne', () => {
    it('debe devolver expediente con archivos firmados', async () => {
      const mockExpediente = {
        id: 1,
        paciente: { nombre: 'Juan', apellido: 'Perez' },
        doctoresAsociados: [
          {
            doctor: {
              persona: {
                nombre: 'Dr.',
                apellido: 'Smith',
              },
            },
          },
        ],
        archivos: [
          {
            id: 1,
            filePath: 'path/file.pdf',
            nombreArchivo: 'file.pdf',
            tipoArchivo: 'pdf',
          },
        ],
        detalles: [],
        alergias: 'Ninguna',
        enfermedades: 'Diabetes',
        medicamentos: 'Insulina',
        observaciones: 'Observación',
      };

      prisma.expediente.findUnique.mockResolvedValue(mockExpediente);
      storage.generateSignedUrls.mockResolvedValue([
        'https://signed-url/file.pdf',
      ]);

      const result = await service.findOne(1);

      expect(result.archivos[0].url).toBe('https://signed-url/file.pdf');
      expect(prisma.expediente.findUnique).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(storage.generateSignedUrls).toHaveBeenCalledWith([
        'path/file.pdf',
      ]);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      prisma.expediente.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        'Expediente con ID 99 no encontrado',
      );
    });
  });

  // ==============================================
  // Test de create()
  // ==============================================
  describe('create', () => {
    const createDto: CreateExpedienteDto = {
      pacienteId: 1,
      doctorId: 2,
      alergias: 'Ninguna',
      enfermedades: 'Ninguna',
      medicamentos: 'Ninguno',
      observaciones: '',
    };

    it('debe crear un expediente si todo es válido', async () => {
      const createDto: CreateExpedienteDto = {
        pacienteId: 1,
        doctorId: 2,
        alergias: 'Ninguna',
        enfermedades: 'Ninguna',
        medicamentos: 'Ninguno',
        observaciones: '',
      };

      // 1️⃣ Persona existe
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });

      // 2️⃣ No existe expediente previo → primera llamada a findUnique
      prisma.expediente.findUnique.mockImplementationOnce(() => null);

      // 3️⃣ Doctor existe
      prisma.empleado.findUnique.mockResolvedValue({ id: 2, puesto: 'DOCTOR' });

      // 4️⃣ Mock de creación en $transaction
      prisma.expediente.create.mockResolvedValue({ id: 1, ...createDto });
      prisma.expedienteDoctor.create.mockResolvedValue({ id: 10, expedienteId: 1, doctorId: 2 });

      // 5️ Mock $transaction
      prisma.$transaction.mockImplementation(async (queries) => [await queries[0], await queries[1]]);

      // 6️ Segunda llamada a findUnique → devolver expediente con relaciones
      prisma.expediente.findUnique.mockImplementationOnce(() => ({
        id: 1,
        pacienteId: 1,
        alergias: 'Ninguna',
        enfermedades: 'Ninguna',
        medicamentos: 'Ninguno',
        observaciones: '',
        doctoresAsociados: [{ doctor: { persona: { nombre: 'Dr.', apellido: 'Smith' } } }],
        archivos: [],
        detalles: [],
      }));

      const result = await service.create(createDto);

      expect(result?.id).toBe(1);
      expect(result?.doctoresAsociados.length).toBe(1);
    });

    it('debe lanzar NotFoundException si paciente no existe', async () => {
      prisma.persona.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('debe lanzar BadRequestException si expediente ya existe', async () => {
      prisma.persona.findUnique.mockResolvedValue({ id: 1 });
      prisma.expediente.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  // ==============================================
  // Puedes agregar más tests: update, getHistorialPaciente, delete
  // ==============================================
});
