import { ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { Post, Param, Get, ParseIntPipe, Controller } from '@nestjs/common';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll() {
    return await this.logsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.logsService.findOne(id);
  }

  @Get('empleado/:empleadoId')
  async getLogsByEmpleado(
    @Param('empleadoId', ParseIntPipe) empleadoId: number,
  ) {
    return await this.logsService.getLogsByEmpleado(empleadoId);
  }

  @Post('logout/:empleadoId')
  async logoutEmpleado(@Param('empleadoId') empleadoId: string) {
    return this.logsService.registrarLogout(Number(empleadoId));
  }
}
