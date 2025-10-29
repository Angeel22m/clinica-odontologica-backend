import { PrismaClient, Rol, Puesto, EstadoCita } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos...');

  // 1️⃣ Personas base
  const personas = await prisma.persona.createMany({
    data: [
      { nombre: 'Carlos', apellido: 'Mendoza', dni: '080119900001', telefono: '9991001', direccion: 'Centro 123', fechaNac: new Date('1990-01-10') },
      { nombre: 'Ana', apellido: 'Lopez', dni: '080119920002', telefono: '9991002', direccion: 'Col. Florencia', fechaNac: new Date('1992-02-11') },
      { nombre: 'Luis', apellido: 'Gomez', dni: '080119880003', telefono: '9991003', direccion: 'Col. Kennedy', fechaNac: new Date('1988-03-15') },
      { nombre: 'María', apellido: 'Pérez', dni: '080119950004', telefono: '9991004', direccion: 'Centro 345', fechaNac: new Date('1995-04-20') },
      { nombre: 'José', apellido: 'Torres', dni: '080119850005', telefono: '9991005', direccion: 'Col. Palmira', fechaNac: new Date('1985-05-25') },
      // Doctores
      { nombre: 'Laura', apellido: 'Hernandez', dni: '080119900006', telefono: '9991006', direccion: 'Barrio Abajo', fechaNac: new Date('1990-06-30') },
      { nombre: 'Miguel', apellido: 'Santos', dni: '080119870007', telefono: '9991007', direccion: 'Col. Miraflores', fechaNac: new Date('1987-07-12') },
      { nombre: 'Claudia', apellido: 'Rivas', dni: '080119890008', telefono: '9991008', direccion: 'Col. Alameda', fechaNac: new Date('1989-08-14') },
      { nombre: 'Roberto', apellido: 'Martinez', dni: '080119860009', telefono: '9991009', direccion: 'Col. Las Lomas', fechaNac: new Date('1986-09-18') },
      { nombre: 'Elena', apellido: 'Suarez', dni: '080119930010', telefono: '9991010', direccion: 'Col. El Bosque', fechaNac: new Date('1993-10-22') },
    ],
  });
  console.log('✅ Personas creadas');

  // 2️⃣ Usuarios de clientes (1-5)
  await prisma.user.createMany({
    data: [
      { correo: 'carlos@mail.com', password: '123456', rol: Rol.CLIENTE, personaId: 1 },
      { correo: 'ana@mail.com', password: '123456', rol: Rol.CLIENTE, personaId: 2 },
      { correo: 'luis@mail.com', password: '123456', rol: Rol.CLIENTE, personaId: 3 },
      { correo: 'maria@mail.com', password: '123456', rol: Rol.CLIENTE, personaId: 4 },
      { correo: 'jose@mail.com', password: '123456', rol: Rol.CLIENTE, personaId: 5 },
    ],
  });
  console.log('✅ Usuarios clientes creados');

  // 3️⃣ Empleados (6-10)
  await prisma.empleado.createMany({
    data: [
      { personaId: 6, puesto: Puesto.DOCTOR, salario: 25000 },
      { personaId: 7, puesto: Puesto.DOCTOR, salario: 27000 },
      { personaId: 8, puesto: Puesto.RECEPCIONISTA, salario: 18000 },
      { personaId: 9, puesto: Puesto.ADMINISTRADOR, salario: 30000 },
      { personaId: 10, puesto: Puesto.DOCTOR, salario: 26000 },
    ],
  });
  console.log('✅ Empleados creados');

  // 4️⃣ Servicios clínicos
  await prisma.servicioClinico.createMany({
    data: [
      { nombre: 'Limpieza dental', descripcion: 'Limpieza profesional básica', precio: 500 },
      { nombre: 'Extracción de muela', descripcion: 'Extracción dental simple', precio: 1200 },
      { nombre: 'Blanqueamiento dental', descripcion: 'Tratamiento estético', precio: 2000 },
      { nombre: 'Ortodoncia', descripcion: 'Colocación de brackets', precio: 5000 },
      { nombre: 'Consulta general', descripcion: 'Revisión general dental', precio: 300 },
    ],
  });
  console.log('✅ Servicios clínicos creados');

  // 5️⃣ Expedientes para los 5 clientes con distintos doctores
  for (let i = 1; i <= 5; i++) {
    await prisma.expediente.create({
      data: {
        pacienteId: i,
        doctorId: (i % 3) + 1, // alterna entre 3 doctores
        alergias: 'Ninguna conocida',
        enfermedades: 'Hipertensión leve',
        medicamentos: 'Losartán 50mg',
        observaciones: 'Paciente regular',
      },
    });
  }
  console.log('✅ Expedientes creados');

  // 6️⃣ Detalles de expediente
  for (let i = 1; i <= 5; i++) {
    await prisma.expedienteDetalle.create({
      data: {
        expedienteId: i,
        fecha: new Date(),
        motivo: 'Dolor dental',
        diagnostico: 'Caries',
        tratamiento: 'Empaste',
        planTratamiento: 'Revisión en 6 meses',
        doctorId: (i % 3) + 1,
      },
    });
  }
  console.log('✅ Detalles de expediente creados');

  // 7️⃣ Citas
  for (let i = 1; i <= 5; i++) {
    await prisma.cita.create({
      data: {
        fecha: new Date(`2025-10-${10 + i}`),
        estado: EstadoCita.COMPLETADA,
        pacienteId: i,
        doctorId: (i % 3) + 1,
        servicioId: (i % 5) + 1,
      },
    });
  }
  console.log('✅ Citas creadas');

  // 8️⃣ Facturas
  for (let i = 1; i <= 5; i++) {
    const total = 500 + i * 100;
    const factura = await prisma.factura.create({
      data: {
        pacienteId: i,
        total,
        detalles: {
          create: {
            servicioId: (i % 5) + 1,
            cantidad: 1,
            subtotal: total,
          },
        },
      },
    });
  }
  console.log('✅ Facturas creadas');

  console.log('🎉 Inserción completa.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
