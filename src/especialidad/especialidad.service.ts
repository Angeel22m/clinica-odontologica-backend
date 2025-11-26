import { 
  Injectable, 
  NotFoundException, // Para errores 404
  InternalServerErrorException, // Para errores 500
} from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EspecialidadService {
  constructor(private prisma: PrismaService) {}

 
  async create(createEspecialidadDto: CreateEspecialidadDto) {
    try {
      const especialidad = await this.prisma.especialidad.create({
        data: createEspecialidadDto,
      });
      
      return especialidad; 
    } catch (error) {
      console.error(error);
      
      throw new InternalServerErrorException('No se pudo crear la especialidad.');
    }
  }

  async findAll() {
    try {
      const especialidades = await this.prisma.especialidad.findMany();
      return especialidades;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error al recuperar las especialidades.');
    }
  }

 
  async findOne(id: number) {
    try {
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id: id },
      });

      if (!especialidad) {
     
        throw new NotFoundException(`La especialidad con ID ${id} no existe.`);
      }
      return especialidad;
    } catch (error) {
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(`Error al buscar la especialidad con ID ${id}.`);
    }
  }


  async update(id: number, updateEspecialidadDto: UpdateEspecialidadDto) {
  
    try {
      await this.findOne(id); 
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Propaga el 404
      }
    }
    
   
    try {
      const especialidadActualizada = await this.prisma.especialidad.update({
        where: { id: id },
        data: updateEspecialidadDto,
      });
      return especialidadActualizada;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(`No se pudo actualizar la especialidad con ID ${id}.`);
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.especialidad.delete({
        where: { id: id },
      });
     
      return { message: `Especialidad con ID ${id} eliminada correctamente` };
    } catch (error) {
     
      if (error.code === 'P2025') {
        throw new NotFoundException(`No se puede eliminar: la especialidad con ID ${id} no existe.`);
      }
      console.error(error);
      throw new InternalServerErrorException(`Error al intentar eliminar la especialidad con ID ${id}.`);
    }
  }
}