import {  Post,  Get,  Param,  Body,  ParseIntPipe,  Put,} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dtopersona/crete-persona';
import { UpdatePersonaDto } from './dtopersona/update-persona';

@ApiTags('Persona')
@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  //  Crear persona
  @Post()
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiResponse({ status: 201, description: 'Persona creada correctamente' })
  @ApiResponse({ status: 400, description: 'Error al crear la persona' })
  async create(@Body() createPersonaDto: CreatePersonaDto) {
    const persona = await this.personaService.createPersona(createPersonaDto);
    console.log(' Persona creada:', persona);

    return {
      message: 'Persona creada correctamente ',
      data: persona,
    };
  }

  //  Actualizar persona
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar los datos de una persona' })
  @ApiResponse({ status: 200, description: 'Persona actualizada correctamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    const persona = await this.personaService.updatePersona(id, updatePersonaDto);
    console.log(` Persona con ID ${id} actualizada:`, persona);

    return {
      message: `Persona con ID ${id} actualizada correctamente `,
      data: persona,
    };
  }

  //  Obtener todas las personas
  @Get()
  @ApiOperation({ summary: 'Obtener todas las personas registradas' })
  async findAll() {
    const personas = await this.personaService['prisma'].persona.findMany();
    console.log(' Personas registradas:', personas);

    return {
      message: 'Lista de personas registradas',
      data: personas,
    };
  }

  //  Obtener una persona por ID
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una persona por su ID' })
  @ApiResponse({ status: 200, description: 'Persona encontrada correctamente' })
  @ApiResponse({ status: 404, description: 'Persona no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const persona = await this.personaService['prisma'].persona.findUnique({
      where: { id },
    });

    if (!persona) {
      return {
        message: ` Persona con ID ${id} no encontrada`,
      };
    }

    console.log(` Persona con ID ${id}:`, persona);

    return {
      message: `Persona con ID ${id} encontrada correctamente `,
      data: persona,
    };
  }
}
