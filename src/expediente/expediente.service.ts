import { Injectable, NotFoundException,InternalServerErrorException,BadRequestException } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';
import {CreateExpedienteDetalleDto} from './dto/create-expdiente-detalle.dtp'
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../firebase/storage.service';
import e from 'express';

const expedienteInclude = {  
    paciente: {
      select: {
        nombre: true,
        apellido: true,
      },
    }, 
    doctoresAsociados: { 
      include: {       
        doctor: {
          select: {           
            persona: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
          },
        },
      },
    },
  }




@Injectable()
export class ExpedienteService {
  constructor(private prisma: PrismaService,
              private storageService: StorageService
  ) {}


// ======================================================================
// crea un nuevo expediente
// ======================================================================
async create(createExpedienteDto: CreateExpedienteDto) {
    const { doctorId, ...expedienteData } = createExpedienteDto; 
    // 1. Validar que la Persona exista (paciente)
    const personaExists = await this.prisma.persona.findUnique({
      where: { id: createExpedienteDto.pacienteId },
    });
    if (!personaExists) {
      throw new NotFoundException(
        `No se encontró la persona (paciente) con ID ${createExpedienteDto.pacienteId}.`,
      );
    }

    // 2. Validar que el Expediente NO exista (Validación de Unicidad)
    const expedienteExists = await this.prisma.expediente.findUnique({
      where: { pacienteId: createExpedienteDto.pacienteId },  
    });
    if (expedienteExists) {
      throw new BadRequestException(
        `El expediente para el paciente con ID ${createExpedienteDto.pacienteId} ya existe.`,
      );
    }
    
    //Validar que el Doctor exista (Clave Foránea)
    const doctorExists = await this.prisma.empleado.findUnique({
        where: { id: doctorId},
        select: { id: true, puesto: true } // Opcional: solo traer los IDs
    });

    if (!doctorExists || doctorExists.puesto !== 'DOCTOR') {
        // Podrías refinar esta validación a solo chequear el ID,
        // pero es buena práctica chequear que el empleado sea realmente un doctor.
        throw new NotFoundException(
          `No se encontró un Doctor válido con ID ${doctorId}.`,
        );
    }
    
    // 3. Intentar crear el Expediente
    try {
          // Usamos $transaction para asegurar que ambas operaciones se ejecuten con éxito
        // o que ambas fallen (atomicidad).
        const [expedienteCreado] = await this.prisma.$transaction([
            
            // A. Crear el Expediente principal (SOLO los datos del Expediente)
            this.prisma.expediente.create({
                data:expedienteData
            }),
            
            // B. Crear la Asociación Inicial Doctor-Expediente (en la tabla ExpedienteDoctor)
            this.prisma.expedienteDoctor.create({
                data: {
                    // Usamos connect para referenciar las claves foráneas
                    // El expediente se conecta por su identificador único (pacienteId)
                    expediente: { connect: { pacienteId: expedienteData.pacienteId } },
                    doctor: { connect: { id: doctorId } }
                }
            })
        ]);
        
        // 4. Retornar el Expediente CREADO, incluyendo las nuevas relaciones
        return this.prisma.expediente.findUnique({
            where: { id: expedienteCreado.id },
            // Asegúrate de usar el 'expedienteInclude' modificado que usa 'doctoresAsociados'
            include: expedienteInclude, 
        });
        }
     catch (error) {
     // 5. Manejo Genérico del Error 
        console.error('Error inesperado al crear expediente y/o asociación:', error);
        throw new InternalServerErrorException(
            'Error desconocido al crear el expediente o su relación con el doctor.', 
            error.message);
    }
}

  async findAll() {
    return this.prisma.expediente.findMany(
      {include: expedienteInclude}
    );
  }

 async findOne(id: number, idPaciente = false) {
  
  let expediente;

  if (!idPaciente) {
    // Buscar por ID expediente
    expediente = await this.prisma.expediente.findUnique({
      where: { id },
      include: {
        archivos: {
          select: { filePath: true, id: true, nombreArchivo: true, tipoArchivo: true }
        },
        detalles: true,
        doctoresAsociados: { 
          include: {
            doctor: {
              select: {
                persona: {
                    select: { nombre: true, apellido: true }
                }
              }
            },
          },
        },
        paciente: { select: { nombre: true, apellido: true } }
      }
    });

  } else {
   expediente = await this.prisma.expediente.findUnique({
      where: { pacienteId: id },
      include: {
        archivos: {
          select: { filePath: true, id: true, nombreArchivo: true, tipoArchivo: true }
        },
        detalles: true,
        doctoresAsociados: { 
            include: {
                doctor: {
                    select: {
                        persona: { select: { nombre: true, apellido: true } }
                    }
                }
            }
        },     
        paciente: { select: { nombre: true, apellido: true } }
      }
    });
  }

  if (!expediente) {
    throw new NotFoundException(`Expediente con ID ${id} no encontrado`);
  }

  // Generar URLs firmadas
  const allFilePaths = expediente.archivos.map(a => a.filePath);
  const signedUrls = await this.storageService.generateSignedUrls(allFilePaths);

  const archivosConUrls = expediente.archivos.map((archivo, index) => ({
    id: archivo.id,
    url: signedUrls[index],
    nombre: archivo.nombreArchivo,
    type: archivo.tipoArchivo,
  })).filter(a => a.url);

  const doctores = expediente.doctoresAsociados.map(assoc => ({
    nombre: `${assoc.doctor.persona.nombre} ${assoc.doctor.persona.apellido}`,
  }))
  return {
    id: expediente.id,
    nombrePaciente: `${expediente.paciente.nombre} ${expediente.paciente.apellido}`,
    doctorNombre: doctores,
    alergias: expediente.alergias,
    enfermedades: expediente.enfermedades,
    medicamentos: expediente.medicamentos,
    observaciones: expediente.observaciones,
    archivos: archivosConUrls,
    detalles: expediente.detalles,
  };
}



//===========================================================================
// GET: OBTENER LOS EXPEDIENTES POR DOCTOR
//===========================================================================
async getExpedientesPorDoctor(id: number) {

  const asociaciones = await this.prisma.expedienteDoctor.findMany({
    where:{doctorId: id},
    select:{
      expediente:{
        include:{
          paciente:{
            select:{nombre:true, apellido:true }             
            }
          }
        }
      }
    }
  );
    if (!asociaciones || asociaciones.length === 0){
      throw new NotFoundException(`No tiene pacientes o expedientes asignados el doctor con ID ${id}`);
    }
    
    const expedientes = asociaciones.map(assoc => assoc.expediente)
    return expedientes;
}



// ======================================================================
// Actualizar un expediente por su id
// ======================================================================
  async update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
        // 1. Verificar si el expediente existe
        const expedienteToUpdate = await this.prisma.expediente.findUnique({
            where: { id },
        });

        if (!expedienteToUpdate) {
            throw new NotFoundException(`No se encontró el expediente con ID ${id}`);
        }

        // 2. Validar pacienteId si se intenta modificar (Debe existir y mantener unicidad)
        if (updateExpedienteDto.pacienteId) {
            // A. Verificar existencia de la Persona (Clave Foránea)
            const personaExists = await this.prisma.persona.findUnique({
                where: { id: updateExpedienteDto.pacienteId },
            });
            if (!personaExists) {
                throw new BadRequestException(
                    `El ID de paciente ${updateExpedienteDto.pacienteId} no corresponde a una persona existente.`,
                );
            }

            // B. Verificar Unicidad: Un paciente solo puede tener UN expediente.
            // Solo verificamos si el ID es diferente al que ya tiene
            if (updateExpedienteDto.pacienteId !== expedienteToUpdate.pacienteId) {
                const existingExpediente = await this.prisma.expediente.findUnique({
                    where: { pacienteId: updateExpedienteDto.pacienteId },
                });
                if (existingExpediente) {
                    throw new BadRequestException(
                        `Ya existe un expediente para el paciente con ID ${updateExpedienteDto.pacienteId}. No se puede asignar a este expediente.`,
                    );
                }
            }
        }

        // 3. Validar doctorId si se intenta modificar (Debe ser un Doctor válido)
        if (updateExpedienteDto.doctorId) {
            const doctorExists = await this.prisma.empleado.findUnique({
                where: { id: updateExpedienteDto.doctorId },
                select: { id: true, puesto: true },
            });
            
            if (!doctorExists || doctorExists.puesto !== 'DOCTOR') {
                throw new BadRequestException(
                    `El ID de doctor ${updateExpedienteDto.doctorId} no corresponde a un Empleado con puesto 'DOCTOR'.`,
                );
            }
        }

        // 4. Intentar actualizar el expediente
        try {
            const updatedExpediente = await this.prisma.expediente.update({
                where: { id },
                data: updateExpedienteDto,
                include: expedienteInclude, // Devolvemos el expediente actualizado con detalles
            });
            return updatedExpediente;
        } catch (error) {
            // Manejo de errores inesperados (p. ej., problemas de conexión con DB)
            console.error('Error inesperado al actualizar expediente:', error);
            throw new InternalServerErrorException(
                'Ocurrió un error desconocido al intentar actualizar el expediente.',
            );
        }
    }
// ======================================================================    
// Eliminar un expediente por su id
// ======================================================================

 /* async remove(id: number) {
    try {
      await this.prisma.expediente.delete({
        where: { id },
      });

      return {message: "Expediente eliminado correctamente"        
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`No se encontró el expediente con ID ${id}`);
      }
      throw error;
    }
  }
    */

  
  async crearExpedienteDetalle(data: CreateExpedienteDetalleDto) {
    // Verificar la existencia del Expediente (usando expedienteId)
    const existeExpediente = await this.prisma.expediente.findUnique({
      where: {
        id: data.expedienteId, // Verifica el ID del expediente principal
      },
    });

    if (!existeExpediente) {
      throw new NotFoundException(
        `El Expediente con ID ${data.expedienteId} no existe.`,
      );
    }
    const existeDoctor = await this.prisma.empleado.findUnique({
      where: {
        id: data.doctorId,
      },
    });

    if (!existeDoctor) {
      throw new NotFoundException(
        `El Doctor/Empleado con ID ${data.doctorId} no existe.`,
      );
    }


    // Crear el Detalle
    // Prisma infiere automáticamente el tipo a partir del modelo.
    const nuevoDetalle = await this.prisma.expedienteDetalle.create({data});

    return nuevoDetalle;
  }


  // ======================================================================
  // Obtener el historial completo de un paciente por su id
  // ======================================================================

  async getHistorialPaciente(pacienteId: number){
  const expedienteDetalles = await this.prisma.expedienteDetalle.findMany({
  where: {
    expediente: { pacienteId },
  },
  orderBy: { fecha: 'desc' },
  include: {
    doctor: {
      select: {
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

  if (!expedienteDetalles.length) {
    throw new NotFoundException(`No se encontró historial para el paciente con ID ${pacienteId}`);
  }

  return expedienteDetalles;

}

}
