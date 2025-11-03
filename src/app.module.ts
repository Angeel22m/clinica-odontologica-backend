import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { PersonaModule } from './persona/persona.module';
import { UsuarioModule } from './usuario/usuario.module';




@Module({
  imports: [HelloModule, EmpleadoModule, ExpedienteModule, PersonaModule, UsuarioModule],
})
export class AppModule {}
