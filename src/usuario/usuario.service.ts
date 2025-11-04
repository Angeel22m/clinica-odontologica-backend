import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUsuarioDto } from "./dtoUsuario/create-usuario.dto";
import { UpdateUsuarioDto } from "./dtoUsuario/update-usuario.dto";

@Injectable()
export class UsuarioService {
    constructor(private prisma: PrismaService) {}

    async createUsuario(dto: CreateUsuarioDto) {
        return this.prisma.user.create({
          data:{
            correo: dto.correo,
            password: dto.password,
            rol: dto.rol,
            activo: dto.activo,
            persona: {
              // connect to an existing persona by id
              connect: { id: dto.personaId},
            },
          },
          include: { persona: true },
        });
    }


      async findAll() {
          return this.prisma.empleado.findMany({ include: { persona: true } });
        }
      
        async findOne(id: number) {
          const empleado = await this.prisma.empleado.findUnique({
            where: { id },
            include: { persona: true },
          });
          if (!empleado) {
            throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
          }
          return empleado;
        }
      
        async updateUsuario(id: number, dto: UpdateUsuarioDto) {
            const usuario = await this.prisma.user.findUnique({ where: { id } });
            if (!usuario) {
                throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
            }
            return this.prisma.user.update({
                where: { id },
                data: {
                    correo: dto.correo ?? usuario.correo,
                    password: dto.password ?? usuario.password,
                    activo: dto.activo ?? usuario.activo,
                },
                include: { persona: true
                },});
        }
}