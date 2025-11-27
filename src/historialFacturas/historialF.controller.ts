import { Controller, Get } from '@nestjs/common';
import { FacturasService } from './historialF.service';

@Controller('facturas')
export class FacturaController {
  constructor(private readonly facturaService: FacturasService) {}

  @Get('historial')
  async getHistorialFacturas() {
    return await this.facturaService.historialFactura();
  }
}
