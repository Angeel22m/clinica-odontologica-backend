import { Module } from '@nestjs/common';
import { EmpleadoModule } from './empleado/empleado.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { PersonaModule } from './persona/persona.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ServiciosModule } from './servicios/servicios.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    EmpleadoModule,
    ExpedienteModule,
    PersonaModule,
    UsuarioModule,
    ServiciosModule,
    FirebaseModule,
    AuthModule,
  ],
})
export class AppModule {}

