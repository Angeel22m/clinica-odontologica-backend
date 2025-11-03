import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from '../src/servicios/servicios.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let prisma: PrismaService;

  const testCases = [
    {
      input: {
        nombre: '',
        descripcion: 'desc',
        precio: 100,
        activo: true,
      },
      expected: { message: 'El nombre es obligatorio', code: 1 },
    },
    {
      input: {
        nombre: 'Limpieza',
        descripcion: 'desc',
        precio: -10,
        activo: true,
      },
      expected: { message: 'El precio debe ser mayor a cero', code: 2 },
    },
    {
      input: {
        nombre: 'Limpieza',
        descripcion: 'desc',
        precio: 100,
        activo: true,
      },
      mockFindFirstReturn: { id: 1, nombre: 'Limpieza' },
      expected: { message: 'El servicio ya existe', code: 3 },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        {
          provide: PrismaService,
          useValue: {
            servicioClinico: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('debería devolver error si el nombre está vacío', async () => {
    const result = await service.createServicio(testCases[0].input);
    expect(result).toEqual(testCases[0].expected);
  });

  it('debería devolver error si el precio es <= 0', async () => {
    const result = await service.createServicio(testCases[1].input);
    expect(result).toEqual(testCases[1].expected);
  });

  it('debería devolver error si el servicio ya existe', async () => {
    (prisma.servicioClinico.findFirst as jest.Mock).mockResolvedValue(
      testCases[2].mockFindFirstReturn,
    );
    const result = await service.createServicio(testCases[2].input);
    expect(result).toEqual(testCases[2].expected);
  });

  it('debería crear un nuevo servicio si los datos son válidos', async () => {
    (prisma.servicioClinico.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.servicioClinico.create as jest.Mock).mockResolvedValue({
      id: 1,
      nombre: 'Limpieza',
      descripcion: 'desc',
      precio: 100,
      activo: true,
    });

    const result = await service.createServicio(testCases[3].input);

    expect(prisma.servicioClinico.create as jest.Mock).toHaveBeenCalledWith({
      data: {
        nombre: 'Limpieza',
        descripcion: 'desc',
        precio: 100,
        activo: true,
      },
    });

    expect(result.code).toBe(0);
    expect(result.message).toHaveProperty('id');
  });
});
