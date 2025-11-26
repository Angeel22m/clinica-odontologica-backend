import { Test, TestingModule } from '@nestjs/testing';
import { EspecialidadService } from './especialidad.service';
import { PrismaService } from '../prisma/prisma.service'; // Asegúrate de que la ruta sea correcta
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto'; // Asume que tienes este DTO

// Define un mock para el PrismaService
const mockPrismaService = {
  // Simula el modelo 'especialidad' de Prisma
  especialidad: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('EspecialidadService', () => {
  let service: EspecialidadService;
  // Acceso al mock de Prisma para configurar respuestas esperadas
  let prisma: typeof mockPrismaService; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspecialidadService,
        // Proporcionamos el valor mockeado para PrismaService
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EspecialidadService>(EspecialidadService);
    // Asignamos el mock a la variable local para fácil acceso
    prisma = module.get(PrismaService);
  });

  // --- 1. Prueba de Definición ---
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ------------------------------------
  // --- 2. Pruebas para findAll ---
  // ------------------------------------
  describe('findAll', () => {
    it('debe devolver un array de especialidades', async () => {
      const especialidadesMock = [
        { id: 1, nombre: 'Cardiología' },
        { id: 2, nombre: 'Pediatría' },
      ];
      
      // Configuramos el mock: cuando se llame a findMany, devuelve la data mockeada
      prisma.especialidad.findMany.mockResolvedValue(especialidadesMock);

      const result = await service.findAll();
      
      // Verificamos que Prisma fue llamado correctamente
      expect(prisma.especialidad.findMany).toHaveBeenCalled();
      // Verificamos el resultado
      expect(result).toEqual(especialidadesMock);
    });

    it('debe lanzar InternalServerErrorException si la base de datos falla', async () => {
      // Configuramos el mock para que lance un error
      prisma.especialidad.findMany.mockRejectedValue(new Error('DB connection failed'));

      // Verificamos que la función lance la excepción esperada
      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ------------------------------------
  // --- 3. Pruebas para create ---
  // ------------------------------------
  describe('create', () => {
    it('debe crear y retornar la nueva especialidad', async () => {
      const createDto: CreateEspecialidadDto = { 
        nombre: 'Neurología',
        descripcion: 'Estudio del sistema nervioso' 
      };
      const createdSpecialty = { id: 3, ...createDto };

      // Configuramos el mock para devolver el objeto creado
      prisma.especialidad.create.mockResolvedValue(createdSpecialty);

      const result = await service.create(createDto);

      // Verificamos que Prisma.create fue llamado con los datos correctos
      expect(prisma.especialidad.create).toHaveBeenCalledWith({ data: createDto });
      // Verificamos el resultado
      expect(result).toEqual(createdSpecialty);
    });

    it('debe lanzar InternalServerErrorException si falla la creación', async () => {
      // Configuramos el mock para que rechace la promesa
      prisma.especialidad.create.mockRejectedValue(new Error('Failed to insert'));

      const createDto: CreateEspecialidadDto = { nombre: 'Urología' };
      
      // Verificamos que la función lance la excepción esperada
      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
  
  // Puedes seguir añadiendo bloques 'describe' para findOne, update y remove
});