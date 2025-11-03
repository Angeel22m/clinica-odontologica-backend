import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from './servicios.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiciosDto } from './dto/create_servicios.dto';
import { UpdateServiciosDto } from './dto/update_servicios.dto';

// 1. Definir el Mock para PrismaService
// Este objeto simula la estructura que necesitamos de Prisma
const mockPrismaService = {
  // Simulamos el modelo 'servicioClinico' de Prisma
  servicioClinico: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Simulamos el modelo 'cita' si es necesario
  cita: {
    findFirst: jest.fn(),
  },
};

describe('ServiciosService', () => {
  let service: ServiciosService;
  let prisma: typeof mockPrismaService;

  // Configuración inicial antes de cada prueba
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        {
          // Proporcionamos el mock en lugar del PrismaService real
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
    // Obtenemos la referencia al mock para poder manipular sus métodos
    prisma = module.get<typeof mockPrismaService>(PrismaService as any); 
  });

  // Asegura que el servicio se inicializa correctamente
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * PRUEBAS PARA findAll()
   */
  describe('findAll', () => {
    it('debe devolver un array de servicios', async () => {
      const mockServicios = [
        { id: 1, nombre: 'Consulta', descripcion: 'D', precio: 50, activo: true },
        { id: 2, nombre: 'Rayos X', descripcion: 'R', precio: 100, activo: true },
      ];
      // Configuramos el mock: queremos que findMany devuelva la lista simulada
      prisma.servicioClinico.findMany.mockResolvedValue(mockServicios);

      const result = await service.findAll();
      
      // Verificamos el resultado
      expect(result).toEqual(mockServicios);
      // Verificamos que el método de Prisma haya sido llamado
      expect(prisma.servicioClinico.findMany).toHaveBeenCalled();
    });
  });



  /**
   * PRUEBAS PARA findOne(id)
   */
  describe('findOne', () => {
    it('debe devolver un servicio si se encuentra', async () => {
      const mockServicio = { id: 1, nombre: 'Consulta', descripcion: 'D', precio: 50, activo: true };
      // Configuramos el mock para que devuelva un servicio
      prisma.servicioClinico.findUnique.mockResolvedValue(mockServicio);

      const result = await service.findOne(1);
      
      // Verificamos el resultado y que se haya llamado con el ID correcto
      expect(result).toEqual(mockServicio);
      expect(prisma.servicioClinico.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: expect.anything() });
    });

    it('debe devolver un error si el servicio NO se encuentra', async () => {
      // Configuramos el mock para que devuelva null
      prisma.servicioClinico.findUnique.mockResolvedValue(null);

      const result = await service.findOne(99);
      
      // Verificamos el objeto de error que define la lógica del servicio
      expect(result).toEqual({ message: 'Servicio no encontrado', code: 4 });
    });
  });


  /**
   * PRUEBAS PARA createServicio(dto)
   */
  describe('createServicio', () => {
    const createDto: CreateServiciosDto = {
      nombre: 'Nuevo Servicio',
      descripcion: 'D',
      precio: 75,
      activo: true
    };

    it('debe crear un servicio y devolver el objeto con code 0', async () => {
      // 1. Mock: servicioExistente debe ser null
      prisma.servicioClinico.findFirst.mockResolvedValue(null);
      // 2. Mock: create debe devolver el objeto creado
      const nuevoServicio = { id: 10, ...createDto };
      prisma.servicioClinico.create.mockResolvedValue(nuevoServicio);

      const result = await service.createServicio(createDto);

      expect(result).toEqual({ message: nuevoServicio, code: 0 });
      // Verificamos que se llamó a create con el DTO
      expect(prisma.servicioClinico.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('debe devolver error 3 si el servicio ya existe', async () => {
      // Mock: El servicio existe
      prisma.servicioClinico.findFirst.mockResolvedValue({ id: 1, nombre: createDto.nombre });
      
      const result = await service.createServicio(createDto);

      expect(result).toEqual({ message: 'El servicio ya existe', code: 3 });
      // Aseguramos que NO se llamó al método create
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

  // (Continúa con las pruebas para updateServicio y deleteServicio)
  /**
   * PRUEBAS PARA updateServicio(id, dto)
   */
  describe('updateServicio', () => {
    const updateDto: UpdateServiciosDto = {
      nombre: 'Consulta Actualizada',
      precio: 150, // Precio válido
    };
    const existingService = { 
        id: 1, nombre: 'Consulta', descripcion: 'D', precio: 100, activo: true 
    };
    const updatedService = { 
        ...existingService, ...updateDto 
    };

    it('debe actualizar el servicio y devolver el objeto con code 0', async () => {
      // 1. Mock: El servicio existe antes de actualizar
      prisma.servicioClinico.findUnique.mockResolvedValue(existingService);
      // 2. Mock: update devuelve el objeto actualizado
      prisma.servicioClinico.update.mockResolvedValue(updatedService);

      const result = await service.updateServicio(1, updateDto);

      expect(result).toEqual({ message: updatedService, code: 0 });
      // Verificamos que se llamó a update con el DTO y el ID correctos
      expect(prisma.servicioClinico.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('debe devolver error 4 si el servicio a actualizar NO existe', async () => {
      // Mock: findUnique devuelve null
      prisma.servicioClinico.findUnique.mockResolvedValue(null);

      const result = await service.updateServicio(99, updateDto);

      expect(result).toEqual({ message: 'El servicio no existe', code: 4 });
      expect(prisma.servicioClinico.update).not.toHaveBeenCalled();
    });

    it('debe devolver error 2 si se intenta actualizar con un precio <= 0', async () => {
      // Mock: El servicio existe
      prisma.servicioClinico.findUnique.mockResolvedValue(existingService);
      
      const invalidUpdateDto: UpdateServiciosDto = { precio: 0 };
      const result = await service.updateServicio(1, invalidUpdateDto);

      expect(result).toEqual({ message: 'El precio debe ser mayor a cero', code: 2 });
      expect(prisma.servicioClinico.update).not.toHaveBeenCalled();
    });
    
    it('debe permitir la actualización si solo se envían campos opcionales (ej. activo)', async () => {
        // Mock: El servicio existe
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
        });
    });

    it('debe manejar errores internos del servidor (code 500) durante la actualización', async () => {
        // Simular que el servicio existe
        prisma.servicioClinico.findUnique.mockResolvedValue(existingService);
        // Simular un error de base de datos durante el update
        prisma.servicioClinico.update.mockRejectedValue(new Error('Simulated DB error'));

        const result = await service.updateServicio(1, updateDto);

        expect(result).toEqual({ message: 'Error interno del servidor', code: 500 });
    });
  });

  /**
   * PRUEBAS PARA deleteServicio(id)
   */
  describe('deleteServicio', () => {
    const idToDelete = 1;

    it('debe eliminar el servicio y devolver code 0 si NO tiene citas asociadas', async () => {
      // 1. Mock: findFirst en citas debe devolver null (no hay citas asociadas)
      prisma.cita.findFirst.mockResolvedValue(null);
      // 2. Mock: delete debe completarse correctamente
      prisma.servicioClinico.delete.mockResolvedValue({ id: idToDelete }); // El valor devuelto no es relevante, solo si se resuelve

      const result = await service.deleteServicio(idToDelete);

      expect(result).toEqual({ message: 'Servicio eliminado correctamente', code: 0 });
      // Verificamos que se llamó a findFirst
      expect(prisma.cita.findFirst).toHaveBeenCalledWith({ where: { servicioId: idToDelete } });
      // Verificamos que se intentó eliminar el servicio
      expect(prisma.servicioClinico.delete).toHaveBeenCalledWith({ where: { id: idToDelete } });
    });

    it('debe devolver error 5 si el servicio tiene citas asociadas', async () => {
      // Mock: findFirst en citas devuelve un objeto (hay una cita asociada)
      prisma.cita.findFirst.mockResolvedValue({ id: 10, servicioId: idToDelete, fecha: new Date() });

      const result = await service.deleteServicio(idToDelete);

      expect(result).toEqual({
        message: 'No se puede eliminar el servicio porque tiene citas asociadas',
        code: 5,
      });
      // Verificamos que NO se llamó al método delete
      expect(prisma.servicioClinico.delete).not.toHaveBeenCalled();
    });
    
    it('debe manejar errores internos del servidor (code 500) durante la eliminación', async () => {
        // Aseguramos que no hay citas asociadas
        prisma.cita.findFirst.mockResolvedValue(null);
        // Hacemos que la operación de delete falle simulando un error de Prisma
        prisma.servicioClinico.delete.mockRejectedValue(new Error('Simulated DB error'));
        
        const result = await service.deleteServicio(idToDelete);
        
        expect(result).toEqual({ message: 'Error interno del servidor', code: 500 });
        expect(prisma.servicioClinico.delete).toHaveBeenCalled();
    });
  });

});