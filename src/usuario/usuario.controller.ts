import { Body, Get, Post, ParseIntPipe, Param, Put } from "@nestjs/common";
import { Controller } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUsuarioDto } from "./dtoUsuario/create-usuario.dto";
import { UsuarioService } from "./usuario.service";


@ApiTags("Usuario")
@Controller("usuario")
export class UsuarioController {

    constructor(private readonly usuarioService: UsuarioService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
    @ApiResponse({ status: 400, description: 'Error al crear el usuario' })
    async create(@Body() createUsuarioDto: CreateUsuarioDto) {
        const usuario = await this.usuarioService.createUsuario(createUsuarioDto);
        console.log('Usuario creado:', usuario);

        return {
            message: 'Usuario creado correctamente',
            data: usuario,
        };
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    async findAll() {
        const usuarios = await this.usuarioService.findAll();
        console.log('Usuarios registrados:', usuarios);
        return {
            message: 'Lista de usuarios registrados',
            data: usuarios,
        };
    }

    @Get(':id')
    @ApiResponse({description: 'Obtener un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado correctamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const usuario = await this.usuarioService['prisma'].user.findUnique({
            where: { id },
        });
        if (!usuario) {
            return {
                message: `Usuario con ID ${id} no encontrado`,
            }
        }
        console.log(`Usuario con ID ${id} encontrado:`, usuario);
        return {
            message: `Usuario con ID ${id} encontrado correctamente`,
            data: usuario,
        };
    }

    @Put(':id')
    @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateUsuarioDto: CreateUsuarioDto,
    ){
      const empleado = await this.usuarioService.updateUsuario(id, updateUsuarioDto);
      console.log(`Usuario con ID ${id} actualizado:`, empleado);
      return {
        message: `Usuario con ID ${id} actualizado correctamente`,
        data: empleado,
      }
    }


}