/*import { PrismaClient, Rol, Puesto, EstadoCita } from '@prisma/client';
import { Prisma } from '@prisma/client'; 

const prisma = new PrismaClient();
type ExpedienteResult = Awaited<ReturnType<typeof prisma.expediente.create>>;

async function main() {
  console.log('🌱 Iniciando carga de datos para el Sprint 1...');

  // --- CONFIGURACIÓN BASE ---
  const NUM_CLIENTES = 20; 
  const BASE_YEAR = 2025; 

  const expedientesCreados: ExpedienteResult[] = []; 
  const usersData: Prisma.UserCreateManyInput[] = []; 
  const citasData: Prisma.CitaCreateManyInput[] = []; 
  
  // 1️ Personas base (25 registros) - (No lo repito para ahorrar espacio, asume IDs 1-25)
  // ... (Creación de personasData y prisma.persona.createMany) ...
  // [Suponiendo que el código de la sección 1 (Personas) está aquí]

  const personasData = [
    // CLIENTES (IDs 1-20)
    { nombre: 'Carlos', apellido: 'Mendoza', dni: '080119900001', telefono: '9991001', direccion: 'Centro 123', fechaNac: new Date('1990-01-10') },
    { nombre: 'Ana', apellido: 'Lopez', dni: '080119920002', telefono: '9991002', direccion: 'Col. Florencia', fechaNac: new Date('1992-02-11') },
    { nombre: 'Luis', apellido: 'Gomez', dni: '080119880003', telefono: '9991003', direccion: 'Col. Kennedy', fechaNac: new Date('1988-03-15') },
    { nombre: 'María', apellido: 'Pérez', dni: '080119950004', telefono: '9991004', direccion: 'Centro 345', fechaNac: new Date('1995-04-20') },
    { nombre: 'José', apellido: 'Torres', dni: '080119850005', telefono: '9991005', direccion: 'Col. Palmira', fechaNac: new Date('1985-05-25') },
    { nombre: 'Sofía', apellido: 'Ramirez', dni: '080119980011', telefono: '9991011', direccion: 'Barrio Central', fechaNac: new Date('1998-11-01') },
    { nombre: 'Pedro', apellido: 'Vargas', dni: '080119750012', telefono: '9991012', direccion: 'Altos del Pinar', fechaNac: new Date('1975-12-12') },
    { nombre: 'Andrea', apellido: 'Castro', dni: '080120000013', telefono: '9991013', direccion: 'Res. Cima', fechaNac: new Date('2000-01-05') },
    { nombre: 'Fernando', apellido: 'Mora', dni: '080119820014', telefono: '9991014', direccion: 'El Trapiche', fechaNac: new Date('1982-02-28') },
    { nombre: 'Gabriela', apellido: 'Reyes', dni: '080119910015', telefono: '9991015', direccion: 'Blvd. Morazán', fechaNac: new Date('1991-03-17') },
    { nombre: 'Hugo', apellido: 'Fuentes', dni: '080119780016', telefono: '9991016', direccion: 'Prados de Oriente', fechaNac: new Date('1978-04-04') },
    { nombre: 'Isabel', apellido: 'Guerra', dni: '080119970017', telefono: '9991017', direccion: 'Col. San José', fechaNac: new Date('1997-05-09') },
    { nombre: 'Javier', apellido: 'Díaz', dni: '080119840018', telefono: '9991018', direccion: 'Zona Viva', fechaNac: new Date('1984-06-21') },
    { nombre: 'Karen', apellido: 'Silva', dni: '080119940019', telefono: '9991019', direccion: 'Anillo Periférico', fechaNac: new Date('1994-07-26') },
    { nombre: 'Leo', apellido: 'Chávez', dni: '080119800020', telefono: '9991020', direccion: 'Comayagüela', fechaNac: new Date('1980-08-19') },
    { nombre: 'Marta', apellido: 'Núñez', dni: '080119960021', telefono: '9991021', direccion: 'Col. Lomas', fechaNac: new Date('1996-09-01') },
    { nombre: 'Ricardo', apellido: 'Paz', dni: '080119770022', telefono: '9991022', direccion: 'Barrio El Centro', fechaNac: new Date('1977-10-10') },
    { nombre: 'Valeria', apellido: 'Soto', dni: '080120010023', telefono: '9991023', direccion: 'Res. Roble', fechaNac: new Date('2001-11-15') },
    { nombre: 'Wilmer', apellido: 'Zelaya', dni: '080119890024', telefono: '9991024', direccion: 'Col. Satélite', fechaNac: new Date('1989-12-20') },
    { nombre: 'Yessenia', apellido: 'Baca', dni: '080119930025', telefono: '9991025', direccion: 'Zona Universitaria', fechaNac: new Date('1993-01-25') },
    
    // EMPLEADOS (IDs 21-25)
    { nombre: 'Laura', apellido: 'Hernandez', dni: '080119900006', telefono: '9991006', direccion: 'Barrio Abajo', fechaNac: new Date('1990-06-30') }, 
    { nombre: 'Miguel', apellido: 'Santos', dni: '080119870007', telefono: '9991007', direccion: 'Col. Miraflores', fechaNac: new Date('1987-07-12') }, 
    { nombre: 'Claudia', apellido: 'Rivas', dni: '080119890008', telefono: '9991008', direccion: 'Col. Alameda', fechaNac: new Date('1989-08-14') }, 
    { nombre: 'Roberto', apellido: 'Martinez', dni: '080119860009', telefono: '9991009', direccion: 'Col. Las Lomas', fechaNac: new Date('1986-09-18') }, 
    { nombre: 'Elena', apellido: 'Suarez', dni: '080119930010', telefono: '9991010', direccion: 'Col. El Bosque', fechaNac: new Date('1993-10-22') }, 
  ];
  await prisma.persona.createMany({ data: personasData });
  console.log(`✅ ${personasData.length} Personas creadas`);


  // 2️⃣ Usuarios (25 registros)
  // ... (El código de la sección 2 (Usuarios) permanece igual) ...
  // Clientes
  for (let i = 1; i <= NUM_CLIENTES; i++) {
    usersData.push({ correo: `c${i}@mail.com`, password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.CLIENTE, personaId: i });
  }
  // Empleados 
  usersData.push({ correo: 'laura@doc.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.DOCTOR, personaId: 21 });
  usersData.push({ correo: 'miguel@doc.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.DOCTOR, personaId: 22 });
  usersData.push({ correo: 'claudia@recep.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.RECEPCIONISTA, personaId: 23 });
  usersData.push({ correo: 'roberto@admin.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.ADMIN, personaId: 24 });
  usersData.push({ correo: 'elena@doc.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.DOCTOR, personaId: 25 });
  
  await prisma.user.createMany({ data: usersData });
  console.log(`✅ ${usersData.length} Usuarios creados`);


  // 3️⃣ Empleados (5 registros) - ¡CORRECCIÓN AQUÍ!
  const empleadosCreados = await prisma.$transaction([
    prisma.empleado.create({ data: { personaId: 21, puesto: Puesto.DOCTOR, salario: 25000 } }),
    prisma.empleado.create({ data: { personaId: 22, puesto: Puesto.DOCTOR, salario: 27000 } }),
    prisma.empleado.create({ data: { personaId: 23, puesto: Puesto.RECEPCIONISTA, salario: 18000 } }),
    prisma.empleado.create({ data: { personaId: 24, puesto: Puesto.ADMINISTRADOR, salario: 30000 } }),
    prisma.empleado.create({ data: { personaId: 25, puesto: Puesto.DOCTOR, salario: 26000 } }),
  ]);
  
  // Extraemos los IDs primarios (reales) de la tabla Empleado. Serán [1, 2, 3, 4, 5]
  const doctorIds = empleadosCreados.filter(e => e.puesto === Puesto.DOCTOR).map(e => e.id); 
  // doctorIds ahora es [1, 2, 5] (Asumiendo que los IDs son 1, 2, 3, 4, 5)
  
  const getDoctorId = (index: number) => doctorIds[index % doctorIds.length];
  
  console.log(`✅ ${empleadosCreados.length} Empleados creados. IDs de doctor reales: ${doctorIds.join(', ')}`);


  // 4️ Servicios clínicos (7 registros)
  // ... (El código de la sección 4 (Servicios) permanece igual) ...
  const serviciosData = [
    { nombre: 'Limpieza dental', descripcion: 'Limpieza profesional básica', precio: 500 },
    { nombre: 'Extracción de muela', descripcion: 'Extracción dental simple', precio: 1200 },
    { nombre: 'Blanqueamiento dental', descripcion: 'Tratamiento estético', precio: 2000 },
    { nombre: 'Ortodoncia', descripcion: 'Colocación de brackets', precio: 5000 },
    { nombre: 'Consulta general', descripcion: 'Revisión general dental', precio: 300 },
    { nombre: 'Endodoncia', descripcion: 'Tratamiento de conducto', precio: 2500 },
    { nombre: 'Implante dental', descripcion: 'Colocación de implante', precio: 8000 },
  ];
  await prisma.servicioClinico.createMany({ data: serviciosData });
  console.log(`✅ ${serviciosData.length} Servicios clínicos creados`);
  const numServicios = serviciosData.length;


  // 5️ Expedientes (20 registros, uno por cliente) - ¡CORRECCIÓN APLICADA AQUÍ!
  // Ahora usamos la función getDoctorId que retorna los IDs reales de la tabla Empleado.
  for (let i = 1; i <= NUM_CLIENTES; i++) {
    const exp = await prisma.expediente.create({
      data: {
        pacienteId: i,
        doctorId: getDoctorId(i), //  ESTO YA USA LOS IDs REALES DEL EMPLEADO
        alergias: i % 5 === 0 ? 'Penicilina' : 'Ninguna',
        enfermedades: i % 4 === 0 ? 'Diabetes Tipo 2' : 'Ninguna conocida',
        medicamentos: i % 3 === 0 ? 'Ibuprofeno' : 'Ninguno',
        observaciones: i % 6 === 0 ? 'Requiere seguimiento especial' : 'Paciente regular',
      },
    });
    expedientesCreados.push(exp); 
  }
  console.log(`✅ ${expedientesCreados.length} Expedientes creados`);

  // ... (El resto del script para ExpedienteDetalle, Archivos y Citas permanece igual y usará los IDs de doctor corregidos) ...
  // El resto del código usa getDoctorId(), por lo que ahora funcionará correctamente.

  // 6️ Detalles de Expediente (40 registros, 2 detalles por expediente)
  for (let i = 0; i < expedientesCreados.length; i++) {
    const expedienteId = expedientesCreados[i].id;
    const doctor1 = getDoctorId(i);
    const doctor2 = getDoctorId(i + 1);
    
    // Detalle 1: Control (Antiguo)
    await prisma.expedienteDetalle.create({
      data: {
        expedienteId: expedienteId,
        fecha: new Date(`${BASE_YEAR}-09-${10 + i}T10:00:00Z`),
        motivo: 'Control anual',
        diagnostico: 'Dientes sanos, sarro leve',
        tratamiento: 'Limpieza básica',
        planTratamiento: 'Revisión en 6 meses',
        doctorId: doctor1,
      },
    });

    // Detalle 2: Tratamiento (Reciente)
    await prisma.expedienteDetalle.create({
      data: {
        expedienteId: expedienteId,
        fecha: new Date(`${BASE_YEAR}-10-${10 + i}T14:30:00Z`),
        motivo: (i % 3 === 0) ? 'Dolor agudo en muela' : 'Estético - Blanqueamiento',
        diagnostico: (i % 3 === 0) ? 'Caries en molar' : 'Manchas por café',
        tratamiento: (i % 3 === 0) ? 'Empaste + Endodoncia' : 'Blanqueamiento láser',
        planTratamiento: (i % 3 === 0) ? 'Cita de seguimiento en 2 semanas' : 'Continuar con higiene',
        doctorId: doctor2, 
      },
    });
  }
  console.log(`✅ ${expedientesCreados.length * 2} Detalles de expediente creados`);

  // 7️ Archivos de Expediente (20 archivos)
  for (let i = 0; i < expedientesCreados.length; i++) {
      const expedienteId = expedientesCreados[i].id;
      const creadoPorId = getDoctorId(i);
      
      await prisma.expedienteArchivo.create({
          data: {
              expedienteId: expedienteId,
              nombreArchivo: `Radiografia-${i + 1}.jpg`,
              storageName: `https://storage.clinic.com/files/rad-${i + 1}`,
              filePath: `/files/rad-${i + 1}`,
              tipoArchivo: 'JPEG',
              creadoPorId: creadoPorId,
          }
      });
  }
  console.log(`✅ ${expedientesCreados.length} Archivos de expediente creados`);

// Función para generar horas aleatorias
function randomHora() {
  const h = String(Math.floor(Math.random() * 9) + 8).padStart(2, "0"); // 08–16
  const m = ["00", "15", "30", "45"][Math.floor(Math.random() * 4)];
  return `${h}:${m}`;
}

  // 8️ Citas (60 registros, variedad de estados y fechas)
// ... (omito la inicialización de citasData) ...
for (let i = 1; i <= NUM_CLIENTES; i++) {
  const doctor = getDoctorId(i);
  const servicio = (i % numServicios) + 1;
  
  // CORRECCIÓN: Usamos padStart(2, '0') para asegurar que el día sea '01', '06', etc.
  const diaCompletada = (5 + i).toString().padStart(2, '0');
  const diaCancelada = (10 + i).toString().padStart(2, '0');
  const diaPendiente = (5 + i).toString().padStart(2, '0'); // Reutilizamos 5 + i para noviembre

  // Cita 1: COMPLETADA (Historial)
  citasData.push({
    // Utilizamos la variable del día corregida
    fecha: new Date(`${BASE_YEAR}-09-${diaCompletada}T08:00:00Z`), 
    hora: randomHora(),
    estado: EstadoCita.COMPLETADA,
    pacienteId: i,
    doctorId: doctor,
    servicioId: servicio,
  });
  
  // Cita 2: CANCELADA (Prueba de filtros)
  if (i % 3 === 0) {
    citasData.push({
      // Utilizamos la variable del día corregida
      fecha: new Date(`${BASE_YEAR}-10-${diaCancelada}T10:00:00Z`),
      hora: randomHora(),
      estado: EstadoCita.CANCELADA,
      pacienteId: i,
      doctorId: getDoctorId(i + 1),
      servicioId: ((i + 1) % numServicios) + 1,
    });
  }

  // Cita 3: PENDIENTE (Futura - Agendamiento)
  citasData.push({
    // Utilizamos la variable del día corregida
    fecha: new Date(`${BASE_YEAR}-11-${diaPendiente}T14:00:00Z`),
    hora: randomHora(),
    estado: EstadoCita.PENDIENTE,
    pacienteId: i,
    doctorId: doctor,
    servicioId: ((i + 2) % numServicios) + 1,
  });
}
await prisma.cita.createMany({ data: citasData });
console.log(`✅ ${citasData.length} Citas creadas`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

  */