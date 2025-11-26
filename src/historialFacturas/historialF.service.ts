import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturasService {
  constructor(private prisma: PrismaService) {}
async historialFactura() {

  return await this.prisma.factura.findMany({
    include: { 
       detalles: true
    }
  });
}

}
