import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos de la metadata (@Roles('ADMIN'))
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),  
    ]);

    if (!requiredRoles) {
      return true; // Si no hay @Roles, permitir acceso
    }

    // 2. Obtener el usuario (req.user)
    const { user } = context.switchToHttp().getRequest();
    
    // ⚠️ Si user o user.role no existen, se lanza un 403
    if (!user || !user.rol) {
      throw new ForbiddenException('Rol de usuario no definido.');
    }

    // 3. Comprobar si el rol del usuario coincide con alguno de los requeridos
    const hasRequiredRole = requiredRoles.some((requiredRole) => user.rol === requiredRole);

    if (!hasRequiredRole) {
        throw new ForbiddenException('No tienes permiso para realizar esta acción. Rol requerido: ' + requiredRoles.join(', '));
    }

    return true;
  }
}