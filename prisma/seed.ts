import { PrismaClient, Rol, Puesto, EstadoCita, Prisma } from '@prisma/client';
import { addDays, addMinutes } from 'date-fns'; // Importamos addMinutes para la expiración del código

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

// Función auxiliar simple para generar números aleatorios (para CAI y Factura)
function generarNumero(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}


async function main() {
    console.log('🌱 Iniciando carga de datos para el seeder corregido...');

    // --- CONFIGURACIÓN BASE ---
    const NUM_CLIENTES = 20; 
    const BASE_DATE = new Date(); 

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


    // 2️⃣ Usuarios (25 registros) y Códigos de Verificación
    // Clientes
    for (let i = 1; i <= NUM_CLIENTES; i++) {
        const isVerified = i % 4 !== 0; // 75% verificados
        usersData.push({ 
            correo: `c${i}@mail.com`, 
            password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', 
            rol: Rol.CLIENTE, 
            personaId: i,
            verificado: isVerified
        });
    }
    // Empleados 
    usersData.push({ correo: 'laura@doc.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.DOCTOR, personaId: 21, verificado: true });
    usersData.push({ correo: 'miguel@doc.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.DOCTOR, personaId: 22, verificado: true });
    usersData.push({ correo: 'claudia@recep.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.RECEPCIONISTA, personaId: 23, verificado: true });
    usersData.push({ correo: 'roberto@admin.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.ADMIN, personaId: 24, verificado: true });
    usersData.push({ correo: 'elena@doc.com', password: '$2a$12$LDfJlhtdfM22Nj5FoqNmFuYyRBmJVsanmqlhsGklIG.vNs8sAlWhW', rol: Rol.DOCTOR, personaId: 25, verificado: true });
    
    await prisma.user.createMany({ data: usersData });
    console.log(`✅ ${usersData.length} Usuarios creados`);

    // 🔴 NUEVO: Códigos de Verificación (para usuarios no verificados, IDs 4, 8, 12, 16, 20)
    const unverifiedUserIds = [4, 8, 12, 16, 20];
    const verificationCodes: Prisma.CodigoVerificacionCreateManyInput[] = [];

    for (const userId of unverifiedUserIds) {
        verificationCodes.push({
            userId: userId,
            codigo: generarNumero(6),
            fechaExpiracion: addMinutes(BASE_DATE, 15), // Expira en 15 minutos
            usado: false
        });
    }
    await prisma.codigoVerificacion.createMany({ data: verificationCodes });
    console.log(`✅ ${verificationCodes.length} Códigos de Verificación creados para usuarios no verificados.`);

    // 3️⃣ Empleados (5 registros)
    const empleadosCreados = await prisma.$transaction([
        prisma.empleado.create({ data: { personaId: 21, puesto: Puesto.DOCTOR, salario: 25000 } }), // Laura (1)
        prisma.empleado.create({ data: { personaId: 22, puesto: Puesto.DOCTOR, salario: 27000 } }), // Miguel (2)
        prisma.empleado.create({ data: { personaId: 23, puesto: Puesto.RECEPCIONISTA, salario: 18000 } }), // Claudia (3)
        prisma.empleado.create({ data: { personaId: 24, puesto: Puesto.ADMIN, salario: 30000 } }), // Roberto (4)
        prisma.empleado.create({ data: { personaId: 25, puesto: Puesto.DOCTOR, salario: 26000 } }), // Elena (5)
    ]);
    
    const doctorIds = empleadosCreados.filter(e => e.puesto === Puesto.DOCTOR).map(e => e.id); 
    // doctorIds ahora es [1, 2, 5]
    
    const getDoctorId = (index: number) => doctorIds[index % doctorIds.length];
    
    console.log(`✅ ${empleadosCreados.length} Empleados creados. IDs de doctor reales: ${doctorIds.join(', ')}`);


    // 4️⃣ Servicios clínicos (7 registros)
    const serviciosData = [
        { nombre: 'Limpieza dental', descripcion: 'Limpieza profesional básica', precio: 500 }, // 1
        { nombre: 'Extracción simple', descripcion: 'Extracción dental simple', precio: 1200 }, // 2
        { nombre: 'Blanqueamiento', descripcion: 'Tratamiento estético', precio: 2000 }, // 3
        { nombre: 'Ortodoncia - Revisión', descripcion: 'Control mensual de brackets', precio: 800 }, // 4
        { nombre: 'Consulta general', descripcion: 'Revisión general dental', precio: 300 }, // 5
        { nombre: 'Endodoncia', descripcion: 'Tratamiento de conducto', precio: 2500 }, // 6
        { nombre: 'Implante dental', descripcion: 'Colocación de implante', precio: 8000 }, // 7
    ];
    await prisma.servicioClinico.createMany({ data: serviciosData });
    const serviciosCreados = await prisma.servicioClinico.findMany(); // Obtenemos IDs reales
    const numServicios = serviciosCreados.length;
    console.log(`✅ ${numServicios} Servicios clínicos creados`);

    // 🔴 NUEVO: 5️⃣ Especialidades (4 registros)
    const especialidadesCreadas = await prisma.$transaction([
        prisma.especialidad.create({ data: { nombre: 'Odontología General', descripcion: 'Limpiezas, revisiones, empastes.' } }), // 1
        prisma.especialidad.create({ data: { nombre: 'Cirugía Oral', descripcion: 'Extracciones, implantes.' } }), // 2
        prisma.especialidad.create({ data: { nombre: 'Estética Dental', descripcion: 'Blanqueamiento y carillas.' } }), // 3
        prisma.especialidad.create({ data: { nombre: 'Ortodoncia', descripcion: 'Alineación dental y brackets.' } }), // 4
    ]);
    const especialidadIds = especialidadesCreadas.map(e => e.id);
    const [generalId, cirugiaId, esteticaId, ortodonciaId] = especialidadIds;
    console.log(`✅ ${especialidadesCreadas.length} Especialidades creadas. IDs: ${especialidadIds.join(', ')}`);

    // 🔴 NUEVO: 6️⃣ Asociación de Doctores y Servicios a Especialidades
    // Doctores a Especialidad
    await prisma.especialidadDoctor.createMany({ 
        data: [
            { doctorId: 1, especialidadId: generalId }, // Laura: General
            { doctorId: 1, especialidadId: esteticaId }, // Laura: Estética

            { doctorId: 2, especialidadId: generalId }, // Miguel: General
            { doctorId: 2, especialidadId: ortodonciaId }, // Miguel: Ortodoncia

            { doctorId: 5, especialidadId: cirugiaId }, // Elena: Cirugía Oral
            { doctorId: 5, especialidadId: generalId }, // Elena: General
        ]
    });
    console.log(`✅ 6 Asociaciones Doctor/Especialidad creadas.`);

    // Servicios a Especialidad
    await prisma.servicioEspecialidad.createMany({
        data: [
            { servicioId: 1, especialidadId: generalId }, // Limpieza -> General
            { servicioId: 2, especialidadId: cirugiaId }, // Extracción -> Cirugía
            { servicioId: 3, especialidadId: esteticaId }, // Blanqueamiento -> Estética
            { servicioId: 4, especialidadId: ortodonciaId }, // Ortodoncia -> Ortodoncia
            { servicioId: 5, especialidadId: generalId }, // Consulta G. -> General
            { servicioId: 6, especialidadId: generalId }, // Endodoncia -> General (Simplificado)
            { servicioId: 7, especialidadId: cirugiaId }, // Implante -> Cirugía
        ]
    });
    console.log(`✅ 7 Asociaciones Servicio/Especialidad creadas.`);


    // 7️⃣ Expedientes (20 registros, uno por cliente)
    for (let i = 1; i <= NUM_CLIENTES; i++) {
        const exp = await prisma.expediente.create({
            data: {
                pacienteId: i, 
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


    // 8️⃣ Detalles de Expediente (40 registros, 2 detalles por expediente)
    for (let i = 0; i < expedientesCreados.length; i++) {
        const expedienteId = expedientesCreados[i].id;
        const doctor1 = getDoctorId(i);
        const doctor2 = getDoctorId(i + 1);
        
        // Detalle 1: Control (Antiguo)
        await prisma.expedienteDetalle.create({
            data: {
                expedienteId: expedienteId,
                fecha: addDays(BASE_DATE, -(50 + i)), 
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
                fecha: addDays(BASE_DATE, -(10 + i)), 
                motivo: (i % 3 === 0) ? 'Dolor agudo en muela' : 'Estético - Blanqueamiento',
                diagnostico: (i % 3 === 0) ? 'Caries en molar' : 'Manchas por café',
                tratamiento: (i % 3 === 0) ? 'Empaste + Endodoncia' : 'Blanqueamiento láser',
                planTratamiento: (i % 3 === 0) ? 'Cita de seguimiento en 2 semanas' : 'Continuar con higiene',
                doctorId: doctor2, 
            },
        });
    }
    console.log(`✅ ${expedientesCreados.length * 2} Detalles de expediente creados`);

    

    // 9️⃣ Citas (60 registros, variedad de estados y fechas)
    for (let i = 1; i <= NUM_CLIENTES; i++) {
        const doctor = getDoctorId(i);
        const servicio = (i % numServicios) + 1;
        
        const fechaCompletada = addDays(BASE_DATE, -(30 + i)); 
        const fechaCancelada = addDays(BASE_DATE, -(7 + i)); 
        const fechaPendiente = addDays(BASE_DATE, (10 + i)); 

        // Cita 1: COMPLETADA (Historial - Se facturará)
        citasData.push({
            fecha: formatDateString(fechaCompletada), 
            hora: randomHora(),
            estado: EstadoCita.COMPLETADA,
            pacienteId: i,
            doctorId: doctor,
            servicioId: servicio,
        });
        
        // Cita 2: CANCELADA 
        if (i % 3 === 0) {
            citasData.push({
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
            fecha: formatDateString(fechaPendiente),
            hora: randomHora(),
            estado: EstadoCita.PENDIENTE,
            pacienteId: i,
            doctorId: doctor,
            servicioId: ((i + 2) % numServicios) + 1,
        });
    }
    await prisma.cita.createMany({ data: citasData });
    const citasCreadas = await prisma.cita.findMany({ where: { estado: EstadoCita.COMPLETADA }});
    console.log(`✅ ${citasData.length} Citas creadas`);


    // 🔴 NUEVO: 🔟 Facturas y DetalleFactura (Una por cada cita completada)
    const CAI_FIJO = generarNumero(15); 
    let numeroFactura = 1;

    for (const cita of citasCreadas) {
        const servicio = serviciosCreados.find(s => s.id === cita.servicioId);
        if (!servicio) continue;

        const subtotal = servicio.precio;
        const isv = servicio.precio * 0.15; // Asumimos ISV 15%
        const totalPagar = subtotal + isv;

        // 1. Crear Factura (Encabezado)
        const factura = await prisma.factura.create({
            data: {
                numeroFactura: String(numeroFactura++).padStart(8, '0'),
                cai: CAI_FIJO,
                fechaEmision: addDays(new Date(cita.fecha), 1), // Factura emitida un día después de la cita
                pacienteId: cita.pacienteId,
                doctorId: cita.doctorId,
                subtotal: subtotal,
                isv15: isv,
                totalPagar: totalPagar,
                // Relación 1:1 con la cita
                citaId: cita.id, 
            }
        });

        // 2. Crear DetalleFactura (Línea de servicio)
        await prisma.detalleFactura.create({
            data: {
                facturaId: factura.id,
                servicioId: servicio.id,
                descripcion: servicio.nombre,
                cantidad: 1,
                precioUnitario: servicio.precio,
                totalLinea: servicio.precio,
                aplicaISV: true,
            }
        });
    }
    console.log(`✅ ${citasCreadas.length} Facturas y sus Detalles creados para las Citas COMPLETADAS.`);


    console.log('\n✨ Todos los datos de prueba han sido cargados con éxito.');
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