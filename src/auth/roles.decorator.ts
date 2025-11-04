import { SetMetadata } from '@nestjs/common';

// Esta llave es la que usa el RolesGuard para encontrar los datos
export const ROLES_KEY = 'roles'; 

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);