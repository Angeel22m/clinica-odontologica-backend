import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from '../servicios/servicios.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiciosDto } from '../servicios/dto/create_servicios.dto';
import { UpdateServiciosDto } from '../servicios/dto/update_servicios.dto';
import { NotFoundException } from '@nestjs/common'; 

// 1. Definición de la estructura MOCK de Prisma
// Usamos una función para generar un mock fresco en cada beforeEach.
const createMockPrismaService = () => ({
  servicioClinico: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(), 
  },
  cita: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
});

// Definición de tipos para la variable 'prisma' en el scope del test
type MockPrismaService = ReturnType<typeof createMockPrismaService>;

describe('ServiciosService', () => {
  let service: ServiciosService;
  let prisma: MockPrismaService;

  // Configuración inicial antes de cada prueba
  beforeEach(async () => {
    // Creamos una instancia fresca del mock de Prisma para cada test
    const mockPrismaServiceFresh = createMockPrismaService();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        {
          // Proporcionamos el mock en lugar del PrismaService real
          provide: PrismaService,
          useValue: mockPrismaServiceFresh,
        },
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
    // Asignamos la referencia al mock para poder manipular sus métodos y verificar llamadas
    prisma = module.get<PrismaService>(PrismaService as any) as MockPrismaService;
  });

  // Asegura que el servicio se inicializa correctamente
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --------------------------------------------------------------------------------
  // PRUEBAS PARA findAll()
  // --------------------------------------------------------------------------------
  describe('findAll', () => {
    it('debe devolver un array de servicios', async () => {
      const mockServicios = [
        { id: 1, nombre: 'Consulta', descripcion: 'D', precio: 50, activo: true },
        { id: 2, nombre: 'Rayos X', descripcion: 'R', precio: 100, activo: true },
      ];
      prisma.servicioClinico.findMany.mockResolvedValue(mockServicios);

      const result = await service.findAll();

      expect(result).toEqual(mockServicios);
      expect(prisma.servicioClinico.findMany).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------------
  // PRUEBAS PARA findOne(id)
  // --------------------------------------------------------------------------------
  describe('findOne', () => {
    it('debe devolver un servicio si se encuentra', async () => {
      const mockServicio = { id: 1, nombre: 'Consulta', descripcion: 'D', precio: 50, activo: true };
      prisma.servicioClinico.findUnique.mockResolvedValue(mockServicio);

      const result = await service.findOne(1);

      expect(result).toEqual(mockServicio);
      // Nota: Uso expect.anything() para select, ya que findOne suele cargar relaciones
      expect(prisma.servicioClinico.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: expect.anything() });
    });

    it('debe devolver un error si el servicio NO se encuentra', async () => {
      prisma.servicioClinico.findUnique.mockResolvedValue(null);

      const result = await service.findOne(99);

      expect(result).toEqual({ message: 'Servicio no encontrado', code: 4 });
    });
  });

  // --------------------------------------------------------------------------------
  // PRUEBAS PARA createServicio(dto)
  // --------------------------------------------------------------------------------
  describe('createServicio', () => {
    const createDto: CreateServiciosDto = {
      nombre: 'Nuevo Servicio',
      descripcion: 'D',
      precio: 75,
      activo: true
    };

    it('debe crear un servicio y devolver el objeto con code 0', async () => {
      prisma.servicioClinico.findFirst.mockResolvedValue(null);
      const nuevoServicio = { id: 10, ...createDto };
      prisma.servicioClinico.create.mockResolvedValue(nuevoServicio);

      const result = await service.createServicio(createDto);

      expect(result).toEqual({ message: nuevoServicio, code: 0 });
      
      expect(prisma.servicioClinico.create).toHaveBeenCalledWith({
          data: createDto,
          include: expect.anything() 
      });
    });

    it('debe devolver error 3 si el servicio ya existe', async () => {
      prisma.servicioClinico.findFirst.mockResolvedValue({ id: 1, nombre: createDto.nombre });

      const result = await service.createServicio(createDto);

      expect(result).toEqual({ message: 'El servicio ya existe', code: 3 });
      expect(prisma.servicioClinico.create).not.toHaveBeenCalled();
    });

    it('debe devolver error 1 si el nombre está vacío', async () => {
        const dtoVacio: CreateServiciosDto = { ...createDto, nombre: ' ' };
        const result = await service.createServicio(dtoVacio);

        expect(result).toEqual({ message: 'El nombre es obligatorio', code: 1 });
        expect(prisma.servicioClinico.create).not.toHaveBeenCalled();
    });

    it('debe devolver error 2 si el precio es cero o menor', async () => {
        const dtoPrecioInvalido: CreateServiciosDto = { ...createDto, precio: 0 };
        const result = await service.createServicio(dtoPrecioInvalido);

        expect(result).toEqual({ message: 'El precio debe ser mayor a cero', code: 2 });
        expect(prisma.servicioClinico.create).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------------
  // PRUEBAS PARA updateServicio(id, dto)
  // --------------------------------------------------------------------------------
  describe('updateServicio', () => {
    const updateDto: UpdateServiciosDto = {
      nombre: 'Consulta Actualizada',
      precio: 150,
    };
    const existingService = {
        id: 1, nombre: 'Consulta', descripcion: 'D', precio: 100, activo: true
    };
    const updatedService = {
        ...existingService, ...updateDto
    };

    it('debe actualizar el servicio y devolver el objeto con code 0', async () => {
      prisma.servicioClinico.findUnique.mockResolvedValue(existingService);
      prisma.servicioClinico.update.mockResolvedValue(updatedService);

      const result = await service.updateServicio(1, updateDto);

      expect(result).toEqual({ message: updatedService, code: 0 });
      expect(prisma.servicioClinico.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: expect.anything() 
      });
    });

    it('debe devolver error 4 si el servicio a actualizar NO existe', async () => {
      prisma.servicioClinico.findUnique.mockResolvedValue(null);

      const result = await service.updateServicio(99, updateDto);

      expect(result).toEqual({ message: 'El servicio no existe', code: 4 });
      expect(prisma.servicioClinico.update).not.toHaveBeenCalled();
    });

    it('debe devolver error 2 si se intenta actualizar con un precio <= 0', async () => {
      prisma.servicioClinico.findUnique.mockResolvedValue(existingService);

      const invalidUpdateDto: UpdateServiciosDto = { precio: 0 };
      const result = await service.updateServicio(1, invalidUpdateDto);

      expect(result).toEqual({ message: 'El precio debe ser mayor a cero', code: 2 });
      expect(prisma.servicioClinico.update).not.toHaveBeenCalled();
    });

    it('debe permitir la actualización si solo se envían campos opcionales (ej. activo)', async () => {
        prisma.servicioClinico.findUnique.mockResolvedValue(existingService);
        const partialUpdateDto: UpdateServiciosDto = { activo: false };
        const resultUpdate = { ...existingService, activo: false };

        prisma.servicioClinico.update.mockResolvedValue(resultUpdate);

        const result = await service.updateServicio(1, partialUpdateDto);

        expect(result.code).toBe(0);
        expect(result.message).toEqual(resultUpdate);
        expect(prisma.servicioClinico.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: partialUpdateDto,
            include: expect.anything() 
        });
    });

    it('debe manejar errores internos del servidor (code 500) durante la actualización', async () => {
        prisma.servicioClinico.findUnique.mockResolvedValue(existingService);
        prisma.servicioClinico.update.mockRejectedValue(new Error('Simulated DB error'));

        const result = await service.updateServicio(1, updateDto);

        expect(result).toEqual({ message: 'Error interno del servidor', code: 500 });
    });
  });

  // --------------------------------------------------------------------------------
  // PRUEBAS PARA deleteServicio(id)
  // --------------------------------------------------------------------------------
  describe('deleteServicio', () => {
    const idToDelete = 1;

    it('debe eliminar el servicio y devolver code 0 si NO tiene citas asociadas', async () => {
      // No hay citas asociadas
      prisma.cita.findFirst.mockResolvedValue(null);
      // Delete se completa correctamente
      prisma.servicioClinico.delete.mockResolvedValue({ id: idToDelete }); 
      // Si se usa cita.deleteMany, debe resolverse
      prisma.cita.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.deleteServicio(idToDelete);

      expect(result).toEqual({ message: 'Servicio eliminado correctamente', code: 0 });
      expect(prisma.cita.findFirst).toHaveBeenCalledWith({ where: { servicioId: idToDelete } });
      // Se verifica la llamada al delete final
      expect(prisma.servicioClinico.delete).toHaveBeenCalledWith({ where: { id: idToDelete } });
    });

    it('debe devolver error 5 si el servicio tiene citas asociadas', async () => {
      // Hay una cita asociada
      prisma.cita.findFirst.mockResolvedValue({ id: 10, servicioId: idToDelete, fecha: new Date() });

      const result = await service.deleteServicio(idToDelete);

      expect(result).toEqual({
        message: 'No se puede eliminar el servicio porque tiene citas asociadas',
        code: 5,
      });
      expect(prisma.servicioClinico.delete).not.toHaveBeenCalled();
    });

    it('debe manejar errores internos del servidor (code 500) durante la eliminación', async () => {
        // Aseguramos que no hay citas
        prisma.cita.findFirst.mockResolvedValue(null);
        // Hacemos que delete falle (simulando un error de DB)
        prisma.servicioClinico.delete.mockRejectedValue(new Error('Simulated DB error'));

        const result = await service.deleteServicio(idToDelete);

        expect(result).toEqual({ message: 'Error interno del servidor', code: 500 });
        expect(prisma.servicioClinico.delete).toHaveBeenCalled();
    });
  });

});
