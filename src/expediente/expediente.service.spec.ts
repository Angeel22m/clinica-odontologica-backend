import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import { Prisma } from '@prisma/client';

// --- MOCKS DE DATOS ---
const mockExpediente = {
  id: 1,
  pacienteId: 101,
  doctorId: 201,
  fechaCreacion: new Date(),
  // Simular la inclusión (solo para findAll/findOne/update)
  paciente: { nombre: 'Juan', apellido: 'Perez' },
  doctor: { persona: { nombre: 'Dr.', apellido: 'García' } },
};

const mockCreateExpedienteDto: CreateExpedienteDto = {
  pacienteId: 101,
  doctorId: 201,
};

const mockDoctor = { id: 201, puesto: 'DOCTOR' };
const mockPersona = { id: 101, nombre: 'Juan', apellido: 'Perez' };

// --- MOCK DE PRISMA ---
const mockPrismaService = {
  persona: {
    findUnique: jest.fn(),
  },
  empleado: {
    findUnique: jest.fn(),
  },
  expediente: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expedienteDetalle: {
    findMany: jest.fn(),
  }
};

describe('ExpedienteService', () => {
  let service: ExpedienteService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    // Limpiamos los mocks antes de cada test para asegurar aislamiento
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpedienteService,
        {
          provide: PrismaService,
          useValue: mockPrismaService, // Usamos el objeto mock
        },
      ],
    }).compile();

    service = module.get<ExpedienteService>(ExpedienteService);
    prisma = module.get<typeof mockPrismaService>(PrismaService as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----------------------------------------------------
  // PRUEBAS para create()
  // ----------------------------------------------------
  describe('create', () => {
    it('debe crear un expediente exitosamente', async () => {
      // Configurar Mocks para las 3 validaciones:
      prisma.persona.findUnique.mockResolvedValue(mockPersona); // 1. Persona existe
      prisma.expediente.findUnique.mockResolvedValue(null);    // 2. Expediente NO existe
      prisma.empleado.findUnique.mockResolvedValue(mockDoctor); // 3. Doctor existe y es 'DOCTOR'
      prisma.expediente.create.mockResolvedValue(mockExpediente); // 4. Creación exitosa

      const result = await service.create(mockCreateExpedienteDto);
      
      expect(result).toEqual(mockExpediente);
      expect(prisma.expediente.create).toHaveBeenCalledWith({
        data: mockCreateExpedienteDto,
      });
    });

    it('debe lanzar NotFoundException si el pacienteId NO existe', async () => {
      // 1. Persona NO existe
      prisma.persona.findUnique.mockResolvedValue(null);
      
      await expect(service.create(mockCreateExpedienteDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.expediente.findUnique).not.toHaveBeenCalled(); // No debe seguir a la sig. validación
    });

    it('debe lanzar BadRequestException si el expediente ya existe para ese paciente', async () => {
      // 1. Persona existe
      prisma.persona.findUnique.mockResolvedValue(mockPersona);
      // 2. Expediente YA existe
      prisma.expediente.findUnique.mockResolvedValue(mockExpediente);

      await expect(service.create(mockCreateExpedienteDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.empleado.findUnique).not.toHaveBeenCalled(); // No debe seguir a la sig. validación
    });
    
    it('debe lanzar NotFoundException si el doctorId NO existe o no es DOCTOR', async () => {
      // 1. Persona existe
      prisma.persona.findUnique.mockResolvedValue(mockPersona);
      // 2. Expediente NO existe
      prisma.expediente.findUnique.mockResolvedValue(null);
      // 3. Doctor NO existe (o tiene otro puesto como 'ASISTENTE')
      prisma.empleado.findUnique.mockResolvedValue({ id: 201, puesto: 'ASISTENTE' });

      await expect(service.create(mockCreateExpedienteDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.expediente.create).not.toHaveBeenCalled();
    });

    it('debe lanzar InternalServerErrorException por un error desconocido de Prisma', async () => {
      // 1. Pasan las 3 validaciones
      prisma.persona.findUnique.mockResolvedValue(mockPersona);
      prisma.expediente.findUnique.mockResolvedValue(null);
      prisma.empleado.findUnique.mockResolvedValue(mockDoctor);
      
      // 4. Fallo en la creación
      prisma.expediente.create.mockRejectedValue(new Error('DB connection failed'));

      await expect(service.create(mockCreateExpedienteDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ----------------------------------------------------
  // PRUEBAS para findOne()
  // ----------------------------------------------------
  describe('findOne', () => {
    it('debe devolver el expediente si se encuentra', async () => {
      prisma.expediente.findUnique.mockResolvedValue(mockExpediente);

      const result = await service.findOne(1);
      
      expect(result).toEqual(mockExpediente);
      expect(prisma.expediente.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });
    
    it('debe lanzar NotFoundException si el expediente no existe', async () => {
      prisma.expediente.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  
  // ----------------------------------------------------
  // PRUEBAS para update()
  // ----------------------------------------------------
  describe('update', () => {
    const updateDto: UpdateExpedienteDto = { doctorId: 300 };
    const updateDtoPaciente: UpdateExpedienteDto = { pacienteId: 102 };
    const originalExpediente = { ...mockExpediente, pacienteId: 101 };
    
    it('debe actualizar el expediente exitosamente (solo doctorId)', async () => {
      // 1. Expediente original existe
      prisma.expediente.findUnique.mockResolvedValue(originalExpediente);
      // 2. Doctor nuevo existe
      prisma.empleado.findUnique.mockResolvedValue({ id: 300, puesto: 'DOCTOR' });
      // 3. Update exitoso
      prisma.expediente.update.mockResolvedValue({ ...originalExpediente, ...updateDto });

      const result = await service.update(1, updateDto);
      
      expect(result.doctorId).toBe(300);
      expect(prisma.expediente.update).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el expediente a actualizar no existe', async () => {
      prisma.expediente.findUnique.mockResolvedValue(null);
      
      await expect(service.update(99, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el nuevo pacienteId NO existe (clave foránea)', async () => {
      // 1. Expediente original existe
      prisma.expediente.findUnique.mockResolvedValue(originalExpediente);
      // 2. Persona NO existe
      prisma.persona.findUnique.mockResolvedValue(null);

      await expect(service.update(1, updateDtoPaciente)).rejects.toThrow(BadRequestException);
      expect(prisma.expediente.update).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el nuevo pacienteId YA tiene expediente', async () => {
        // Mocking secuencial para las dos llamadas a prisma.expediente.findUnique:
        
        // 1. Primera llamada (Línea 104 del servicio): Verifica si el expediente 'id: 1' existe.
        prisma.expediente.findUnique.mockResolvedValueOnce(originalExpediente);
        
        // 2. Mock: Persona existe (Paso 2.A)
        prisma.persona.findUnique.mockResolvedValue({ id: 102 });

        // 3. Segunda llamada (Línea 126 del servicio): Verifica si el 'pacienteId: 102' ya tiene otro expediente.
        // Se espera que SÍ encuentre un expediente (id: 5) para lanzar el BadRequest.
        prisma.expediente.findUnique.mockResolvedValueOnce({ id: 5, pacienteId: 102 });
        
        await expect(service.update(1, updateDtoPaciente)).rejects.toThrow(BadRequestException);
        expect(prisma.expediente.update).not.toHaveBeenCalled();
    });
    
    it('debe lanzar BadRequestException si el nuevo doctorId NO es DOCTOR', async () => {
      // 1. Expediente original existe
      prisma.expediente.findUnique.mockResolvedValue(originalExpediente);
      // 2. Doctor existe, pero no es DOCTOR
      prisma.empleado.findUnique.mockResolvedValue({ id: 300, puesto: 'ASISTENTE' });
      
      const updateDtoDoctor: UpdateExpedienteDto = { doctorId: 300 };
      
      await expect(service.update(1, updateDtoDoctor)).rejects.toThrow(BadRequestException);
      expect(prisma.expediente.update).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------
  // PRUEBAS para remove()
  // ----------------------------------------------------
  describe('remove', () => {
    it('debe eliminar el expediente y retornar mensaje de éxito', async () => {
      // Simular eliminación exitosa
      prisma.expediente.delete.mockResolvedValue(mockExpediente);

      const result = await service.remove(1);
      
      expect(result).toEqual({ message: "Expediente eliminado correctamente" });
      expect(prisma.expediente.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
    
    it('debe lanzar NotFoundException si el expediente a eliminar no existe (Prisma P2025)', async () => {
      // Simular error P2025 (No se encontró el registro a eliminar)
      const error = new Prisma.PrismaClientKnownRequestError('Record to delete does not exist.', {
        code: 'P2025',
        clientVersion: 'test',
      });
      prisma.expediente.delete.mockRejectedValue(error);

      await expect(service.remove(99)).rejects.toThrow(
        NotFoundException,
      );
    });
    
    it('debe lanzar el error original si no es P2025', async () => {
      // Simular otro tipo de error (ej. conexión)
      const genericError = new Error('Database connection failure');
      prisma.expediente.delete.mockRejectedValue(genericError);

      await expect(service.remove(1)).rejects.toThrow('Database connection failure');
    });
  });
  
  // ----------------------------------------------------
  // PRUEBAS para getHistorialPaciente()
  // ----------------------------------------------------
  describe('getHistorialPaciente', () => {
    const mockHistorial = [
      { id: 1, fecha: new Date(), diagnostico: 'Caries', doctor: { persona: { nombre: 'Dr.', apellido: 'García' } } },
      { id: 2, fecha: new Date(), diagnostico: 'Limpieza', doctor: { persona: { nombre: 'Dr.', apellido: 'García' } } },
    ];
    
    it('debe devolver el historial de detalles del paciente', async () => {
      prisma.expedienteDetalle.findMany.mockResolvedValue(mockHistorial);

      const result = await service.getHistorialPaciente(101);
      
      expect(result).toEqual(mockHistorial);
      expect(prisma.expedienteDetalle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ 
            where: { expediente: { pacienteId: 101 } },
            orderBy: { fecha: 'desc' }
        })
      );
    });
    
    it('debe lanzar NotFoundException si el historial no tiene detalles (array vacío)', async () => {
      prisma.expedienteDetalle.findMany.mockResolvedValue([]);

      await expect(service.getHistorialPaciente(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.expedienteDetalle.findMany).toHaveBeenCalled();
    });
  });

});