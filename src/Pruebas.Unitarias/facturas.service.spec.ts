import { Test, TestingModule } from '@nestjs/testing';
import { FacturasService } from '../historialFacturas/historialF.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FacturasService', () => {
  let service: FacturasService;
  let prisma: PrismaService;

  const mockPrismaService = {
    factura: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FacturasService>(FacturasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // ------------------------------------------------------
  // Caso 1: Devuelve correctamente el historial
  // ------------------------------------------------------
  it('debería retornar el historial de facturas', async () => {
    const mockFacturas = [
      { id: 1, totalPagar: 100, detalles: [] },
      { id: 2, totalPagar: 200, detalles: [] },
    ];

    prisma.factura.findMany.mockResolvedValue(mockFacturas);

    const result = await service.historialFactura();

    expect(result.totalFacturas).toBe(2);
    expect(result.data).toEqual(mockFacturas);
    expect(result.message).toBe('Historial de facturas obtenido correctamente.');
    expect(prisma.factura.findMany).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------------------
  // Caso 2: Lanza NotFoundException si no hay facturas
  // ------------------------------------------------------
  it('debería lanzar NotFoundException si no existen facturas', async () => {
    prisma.factura.findMany.mockResolvedValue([]);

    await expect(service.historialFactura()).rejects.toThrow(NotFoundException);
  });

  // ------------------------------------------------------
  // Caso 3: Manejo de error inesperado de Prisma
  // ------------------------------------------------------
  it('debería lanzar error si prisma lanza una excepción', async () => {
    prisma.factura.findMany.mockRejectedValue(new Error('Prisma error'));

    await expect(service.historialFactura()).rejects.toThrow('Prisma error');
  });
});
