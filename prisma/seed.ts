import { PrismaClient, Rol, Puesto, EstadoCita, Prisma } from '@prisma/client';
import { addDays } from 'date-fns'; // Importamos addDays para generar fechas futuras

const prisma = new PrismaClient();
// Tipo genérico para el resultado de create
type ExpedienteResult = Awaited<ReturnType<typeof prisma.expediente.create>>; 

// --- FUNCIONES DE AYUDA ---

// Función crucial: Convierte un objeto Date a la cadena 'YYYY-MM-DD'
function formatDateString(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Función para generar horas aleatorias en intervalos de 30 minutos (08:00 a 16:30)
function randomHora(): string {
    const horas = ['08', '09', '10', '11', '12', '13', '14', '15', '16'];
    const minutos = ['00', '30'];
    let h = parseInt(horas[Math.floor(Math.random() * horas.length)]);
    let m = minutos[Math.floor(Math.random() * minutos.length)];

    if (h === 16 && m === '30') return '16:30';
    if (h > 16) h = 16;
    
    return `${String(h).padStart(2, '0')}:${m}`;
}


async function main() {
    console.log('🌱 Iniciando carga de datos para el seeder corregido...');

    // --- CONFIGURACIÓN BASE ---
    const NUM_CLIENTES = 20; 
    // Usamos el año actual para las citas de prueba
    const BASE_DATE = new Date(); 
    const BASE_YEAR = BASE_DATE.getFullYear(); 

    const expedientesCreados: ExpedienteResult[] = []; 
    const usersData: Prisma.UserCreateManyInput[] = []; 
    const citasData: Prisma.CitaCreateManyInput[] = []; 
    
    // 1️⃣ Personas (25 registros)
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
    // Clientes
    for (let i = 1; i <= NUM_CLIENTES; i++) {
        // Asumiendo que el hash del password es fijo para este seeder
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


    // 3️⃣ Empleados (5 registros)
    const empleadosCreados = await prisma.$transaction([
        prisma.empleado.create({ data: { personaId: 21, puesto: Puesto.DOCTOR, salario: 25000 } }),
        prisma.empleado.create({ data: { personaId: 22, puesto: Puesto.DOCTOR, salario: 27000 } }),
        prisma.empleado.create({ data: { personaId: 23, puesto: Puesto.RECEPCIONISTA, salario: 18000 } }),
        prisma.empleado.create({ data: { personaId: 24, puesto: Puesto.ADMIN, salario: 30000 } }),
        prisma.empleado.create({ data: { personaId: 25, puesto: Puesto.DOCTOR, salario: 26000 } }),
    ]);
    
    // IDs primarios (reales) de la tabla Empleado: [1, 2, 3, 4, 5]
    const doctorIds = empleadosCreados.filter(e => e.puesto === Puesto.DOCTOR).map(e => e.id); 
    // doctorIds ahora es [1, 2, 5]
    
    const getDoctorId = (index: number) => doctorIds[index % doctorIds.length];
    
    console.log(`✅ ${empleadosCreados.length} Empleados creados. IDs de doctor reales: ${doctorIds.join(', ')}`);


    // 4️⃣ Servicios clínicos (7 registros)
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
    const serviciosCreados = await prisma.servicioClinico.findMany(); // Obtenemos IDs reales
    const numServicios = serviciosCreados.length;
    console.log(`✅ ${numServicios} Servicios clínicos creados`);


    // 5️⃣ Expedientes (20 registros, uno por cliente)
    // El Expediente requiere la relación de la Persona (pacienteId) y el Empleado (doctorId).
    for (let i = 1; i <= NUM_CLIENTES; i++) {
        const exp = await prisma.expediente.create({
            data: {
                pacienteId: i, // ID de la Persona/Cliente
                // La relación Empleado(Doctor) necesita un `ExpedienteDoctor` intermedio.
                // Insertamos el expediente y luego la asociación en ExpedienteDoctor.
                alergias: i % 5 === 0 ? 'Penicilina' : 'Ninguna',
                enfermedades: i % 4 === 0 ? 'Diabetes Tipo 2' : 'Ninguna conocida',
                medicamentos: i % 3 === 0 ? 'Ibuprofeno' : 'Ninguno',
                observaciones: i % 6 === 0 ? 'Requiere seguimiento especial' : 'Paciente regular',
            },
        });
        expedientesCreados.push(exp); 
        
        // ASOCIACIÓN EN TABLA INTERMEDIA ExpedienteDoctor
        await prisma.expedienteDoctor.create({
            data: {
                expedienteId: exp.id,
                doctorId: getDoctorId(i),
            }
        });
    }
    console.log(`✅ ${expedientesCreados.length} Expedientes y Asociaciones de Doctor creados`);


    // 6️⃣ Detalles de Expediente (40 registros, 2 detalles por expediente)
    for (let i = 0; i < expedientesCreados.length; i++) {
        const expedienteId = expedientesCreados[i].id;
        const doctor1 = getDoctorId(i);
        const doctor2 = getDoctorId(i + 1);
        
        // Detalle 1: Control (Antiguo)
        await prisma.expedienteDetalle.create({
            data: {
                expedienteId: expedienteId,
                fecha: addDays(BASE_DATE, -(50 + i)), // Fecha pasada
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
                fecha: addDays(BASE_DATE, -(10 + i)), // Fecha reciente
                motivo: (i % 3 === 0) ? 'Dolor agudo en muela' : 'Estético - Blanqueamiento',
                diagnostico: (i % 3 === 0) ? 'Caries en molar' : 'Manchas por café',
                tratamiento: (i % 3 === 0) ? 'Empaste + Endodoncia' : 'Blanqueamiento láser',
                planTratamiento: (i % 3 === 0) ? 'Cita de seguimiento en 2 semanas' : 'Continuar con higiene',
                doctorId: doctor2, 
            },
        });
    }
    console.log(`✅ ${expedientesCreados.length * 2} Detalles de expediente creados`);

    // 7️⃣ Archivos de Expediente (20 archivos)
    for (let i = 0; i < expedientesCreados.length; i++) {
        const expedienteId = expedientesCreados[i].id;
        const creadoPorId = getDoctorId(i);
        
        await prisma.expedienteArchivo.create({
            data: {
                expedienteId: expedienteId,
                nombreArchivo: `Radiografia-${i + 1}.jpg`,
                storageName: `rad-file-${i + 1}-${generarNumero(5)}`,
                filePath: `/files/rad-${i + 1}`,
                tipoArchivo: 'JPEG',
                creadoPorId: creadoPorId,
            }
        });
    }
    console.log(`✅ ${expedientesCreados.length} Archivos de expediente creados`);

    // 8️⃣ Citas (60 registros, variedad de estados y fechas)
    for (let i = 1; i <= NUM_CLIENTES; i++) {
        const doctor = getDoctorId(i);
        const servicio = (i % numServicios) + 1;
        
        // Generamos fechas basadas en la fecha base
        const fechaCompletada = addDays(BASE_DATE, -(30 + i)); // Pasado (hace un mes)
        const fechaCancelada = addDays(BASE_DATE, -(7 + i)); // Reciente (hace una semana)
        const fechaPendiente = addDays(BASE_DATE, (10 + i)); // Futura (próximos días)

        // Cita 1: COMPLETADA (Historial)
        citasData.push({
            // CORREGIDO: Usamos formatDateString para obtener 'YYYY-MM-DD'
            fecha: formatDateString(fechaCompletada), 
            hora: randomHora(),
            estado: EstadoCita.COMPLETADA,
            pacienteId: i,
            doctorId: doctor,
            servicioId: servicio,
        });
        
        // Cita 2: CANCELADA (Prueba de filtros)
        if (i % 3 === 0) {
            citasData.push({
                // CORREGIDO: Usamos formatDateString para obtener 'YYYY-MM-DD'
                fecha: formatDateString(fechaCancelada),
                hora: randomHora(),
                estado: EstadoCita.CANCELADA,
                pacienteId: i,
                doctorId: getDoctorId(i + 1),
                servicioId: ((i + 1) % numServicios) + 1,
            });
        }

        // Cita 3: PENDIENTE (Futura - Agendamiento)
        citasData.push({
            // CORREGIDO: Usamos formatDateString para obtener 'YYYY-MM-DD'
            fecha: formatDateString(fechaPendiente),
            hora: randomHora(),
            estado: EstadoCita.PENDIENTE,
            pacienteId: i,
            doctorId: doctor,
            servicioId: ((i + 2) % numServicios) + 1,
        });
    }
    await prisma.cita.createMany({ data: citasData });
    console.log(`✅ ${citasData.length} Citas creadas`);

    console.log('\n✨ Todos los datos de prueba han sido cargados con éxito.');
}

// Función auxiliar simple para generar números aleatorios
function generarNumero(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
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
  