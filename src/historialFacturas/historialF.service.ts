import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturasService {
  constructor(private prisma: PrismaService) {}

  async historialFactura() {
  try {
   const facturas = await this.prisma.factura.findMany({
  include: {
    //  Detalles de cada factura
    detalles: {
      include: {
        servicioClinico: {
          select: {
            nombre: true,  //  nombre del servicio
          },
        },
      },
    },

    //  Paciente
    paciente: {
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true
      },
    },

    //  Doctor (empleado → persona)
    doctor: {
      include: {
        persona: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    },
  },
});


    //  Validar si no hay facturas
    if (!facturas || facturas.length === 0) {
      throw new NotFoundException('No existen facturas registradas.');
    }

    return {
      message: 'Historial de facturas obtenido correctamente.',
      totalFacturas: facturas.length,
      data: facturas,
    };

  } catch (error) {
    console.error('Error al obtener el historial de facturas:', error);
    throw error; // Nest manejará automáticamente el error
  }
}


}
