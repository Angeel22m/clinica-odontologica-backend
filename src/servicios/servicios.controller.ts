/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ServiciosService } from './servicios.service';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) { }

  @Get()
  async getServicio() {
    return await this.serviciosService.findAll();
  }

  @Post()
  async postServicio(@Body() body: any) {
    return this.serviciosService.createServicio(
      body.nombre,
      body.descripcion,
      body.precio,
      body.activo,
    );
  }

  @Put(':id')
  async putServicio(@Param('id') id: string, @Body() body: any) {
    const idNumber = parseInt(id, 10);
    return this.serviciosService.updateServicio(
      idNumber,
      body.nombre,
      body.descripcion,
      body.precio,
      body.activo,
    );
  }
}
