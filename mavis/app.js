// Variables globales
let filtroTareasActual = 'todos';
let filtroReunionesActual = 'todas';
let vistaActual = 'mes';
let fechaActual = new Date();

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    actualizarFechaHeader();
    cargarTareas();
    cargarReuniones();
    setInterval(actualizarFechaHeader, 60000);
});

// Actualizar fecha en header
function actualizarFechaHeader() {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date().toLocaleDateString('es-ES', opciones);
    const elem = document.getElementById('fechaActual');
    if (elem) {
        elem.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    }
}

// Cambiar pestaña principal
function showMainTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName.toLowerCase())) {
            tab.classList.add('active');
        }
    });
    
    if (tabName === 'calendario') {
        actualizarTituloFecha();
        cargarReuniones();
    }
}

// ===== TAREAS =====
function agregarTarea() {
    const input = document.getElementById('nuevaTarea');
    const texto = input.value.trim();
    
    if (texto === '') {
        alert('Escribe una tarea');
        return;
    }
    
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    tareas.push({
        id: Date.now(),
        texto: texto,
        estado: 'por_hacer',
        fechaCreacion: new Date().toISOString()
    });
    
    localStorage.setItem('tareas', JSON.stringify(tareas));
    input.value = '';
    cargarTareas();
}

function filtrarTareas(filtro) {
    filtroTareasActual = filtro;
    
    const botones = document.querySelectorAll('#tareas .filtro-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    cargarTareas();
}

function cargarTareas() {
    const lista = document.getElementById('listaTareas');
    let todasTareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    let tareas = todasTareas;
    if (filtroTareasActual !== 'todos') {
        tareas = todasTareas.filter(t => t.estado === filtroTareasActual);
    }
    
    actualizarEstadisticas();
    
    lista.innerHTML = '';
    
    if (tareas.length === 0) {
        lista.innerHTML = '<div class="mensaje-vacio">No hay tareas en esta categoría</div>';
        return;
    }
    
    const estadoTexto = {
        'por_hacer': 'Por hacer',
        'en_progreso': 'Haciendo',
        'completada': 'Hecho',
        'pospuesta': 'Pospuesta',
        'anulada': 'Anulada'
    };
    
    tareas.forEach(tarea => {
        const div = document.createElement('div');
        div.className = 'tarea-item ' + tarea.estado;
        
        let botonesHTML = '';
        
        if (tarea.estado !== 'por_hacer') {
            botonesHTML += '<button class="btn-accion btn-por-hacer" onclick="cambiarEstadoTarea(' + tarea.id + ', \'por_hacer\')">Por hacer</button>';
        }
        if (tarea.estado !== 'en_progreso') {
            botonesHTML += '<button class="btn-accion btn-progreso" onclick="cambiarEstadoTarea(' + tarea.id + ', \'en_progreso\')">Haciendo</button>';
        }
        if (tarea.estado !== 'completada') {
            botonesHTML += '<button class="btn-accion btn-completar" onclick="cambiarEstadoTarea(' + tarea.id + ', \'completada\')">Completar</button>';
        }
        if (tarea.estado !== 'pospuesta') {
            botonesHTML += '<button class="btn-accion btn-posponer" onclick="cambiarEstadoTarea(' + tarea.id + ', \'pospuesta\')">Posponer</button>';
        }
        if (tarea.estado !== 'anulada') {
            botonesHTML += '<button class="btn-accion btn-anular" onclick="cambiarEstadoTarea(' + tarea.id + ', \'anulada\')">Anular</button>';
        }
        botonesHTML += '<button class="btn-accion btn-eliminar" onclick="eliminarTarea(' + tarea.id + ')">🗑️</button>';
        
        div.innerHTML = '<div class="tarea-header"><div class="tarea-texto">' + tarea.texto + '</div><span class="estado-badge ' + tarea.estado + '">' + estadoTexto[tarea.estado] + '</span></div><div class="tarea-acciones">' + botonesHTML + '</div>';
        
        lista.appendChild(div);
    });
}

function cambiarEstadoTarea(id, nuevoEstado) {
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    tareas = tareas.map(tarea => {
        if (tarea.id === id) {
            tarea.estado = nuevoEstado;
        }
        return tarea;
    });
    
    localStorage.setItem('tareas', JSON.stringify(tareas));
    cargarTareas();
}

function eliminarTarea(id) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    tareas = tareas.filter(tarea => tarea.id !== id);
    localStorage.setItem('tareas', JSON.stringify(tareas));
    cargarTareas();
}

function actualizarEstadisticas() {
    const tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    const stats = {
        por_hacer: tareas.filter(t => t.estado === 'por_hacer').length,
        en_progreso: tareas.filter(t => t.estado === 'en_progreso').length,
        completada: tareas.filter(t => t.estado === 'completada').length,
        pospuesta: tareas.filter(t => t.estado === 'pospuesta').length,
        anulada: tareas.filter(t => t.estado === 'anulada').length
    };
    
    const container = document.getElementById('estadisticas');
    container.innerHTML = '<div class="stat-card por_hacer"><div class="stat-numero">' + stats.por_hacer + '</div><div class="stat-label">Por hacer</div></div><div class="stat-card en_progreso"><div class="stat-numero">' + stats.en_progreso + '</div><div class="stat-label">Haciendo</div></div><div class="stat-card completada"><div class="stat-numero">' + stats.completada + '</div><div class="stat-label">Hechos</div></div><div class="stat-card pospuesta"><div class="stat-numero">' + stats.pospuesta + '</div><div class="stat-label">Pospuestas</div></div><div class="stat-card anulada"><div class="stat-numero">' + stats.anulada + '</div><div class="stat-label">Anuladas</div></div>';
}

// ===== CALENDARIO =====
function cambiarVista(vista) {
    vistaActual = vista;
    
    const botones = document.querySelectorAll('.vista-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    actualizarTituloFecha();
    cargarReuniones();
}

function actualizarTituloFecha() {
    const titulo = document.getElementById('tituloFecha');
    if (!titulo) return;
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    if (vistaActual === 'mes') {
        titulo.textContent = meses[fechaActual.getMonth()] + ' de ' + fechaActual.getFullYear();
    } else if (vistaActual === 'semana') {
        const finSemana = new Date(fechaActual);
        finSemana.setDate(finSemana.getDate() + 6);
        titulo.textContent = fechaActual.getDate() + ' - ' + finSemana.getDate() + ' de ' + meses[fechaActual.getMonth()] + ' ' + fechaActual.getFullYear();
    } else {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        titulo.textContent = dias[fechaActual.getDay()] + ', ' + fechaActual.getDate() + ' de ' + meses[fechaActual.getMonth()] + ' ' + fechaActual.getFullYear();
    }
}

function cambiarFecha(direccion) {
    const incremento = {
        dia: 1,
        semana: 7,
        mes: 30
    };
    
    fechaActual.setDate(fechaActual.getDate() + (incremento[vistaActual] * direccion));
    actualizarTituloFecha();
    cargarReuniones();
}

function irHoy() {
    fechaActual = new Date();
    actualizarTituloFecha();
    cargarReuniones();
}

function agregarReunion() {
    const titulo = document.getElementById('tituloReunion').value.trim();
    const fecha = document.getElementById('fechaReunion').value;
    const hora = document.getElementById('horaReunion').value;
    
    if (titulo === '' || fecha === '' || hora === '') {
        alert('Completa todos los campos');
        return;
    }
    
    const fechaCompleta = fecha + 'T' + hora;
    
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    
    reuniones.push({
        id: Date.now(),
        titulo: titulo,
        fecha: fechaCompleta,
        estado: 'pendiente'
    });
    
    reuniones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    
    document.getElementById('tituloReunion').value = '';
    document.getElementById('fechaReunion').value = '';
    document.getElementById('horaReunion').value = '';
    
    cargarReuniones();
}

function filtrarReuniones(filtro) {
    filtroReunionesActual = filtro;
    
    const botones = document.querySelectorAll('#calendario .filtros .filtro-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    cargarReuniones();
}

function cargarReuniones() {
    const lista = document.getElementById('listaReuniones');
    let todasReuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    
    // Filtrar por vista (mes, semana, día)
    let reuniones = todasReuniones.filter(reunion => {
        const fechaReunion = new Date(reunion.fecha);
        
        if (vistaActual === 'dia') {
            return fechaReunion.toDateString() === fechaActual.toDateString();
        } else if (vistaActual === 'semana') {
            const inicioSemana = new Date(fechaActual);
            const finSemana = new Date(fechaActual);
            finSemana.setDate(finSemana.getDate() + 6);
            return fechaReunion >= inicioSemana && fechaReunion <= finSemana;
        } else {
            return fechaReunion.getMonth() === fechaActual.getMonth() && 
                   fechaReunion.getFullYear() === fechaActual.getFullYear();
        }
    });
    
    // Filtrar por estado
    if (filtroReunionesActual !== 'todas') {
        reuniones = reuniones.filter(r => r.estado === filtroReunionesActual);
    }
    
    lista.innerHTML = '';
    
    if (reuniones.length === 0) {
        lista.innerHTML = '<div class="mensaje-vacio">No hay reuniones programadas en este período</div>';
        return;
    }
    
    const ahora = new Date();
    const estadoTexto = {
        'pendiente': 'Pendiente',
        'realizada': 'Realizada',
        'no_asistio': 'No asistió',
        'pospuesta': 'Pospuesta'
    };
    
    reuniones.forEach(reunion => {
        const fechaReunion = new Date(reunion.fecha);
        const esHoy = fechaReunion.toDateString() === ahora.toDateString();
        
        const div = document.createElement('div');
        div.className = 'reunion-item ' + reunion.estado;
        if (esHoy && reunion.estado === 'pendiente') {
            div.className += ' hoy';
        }
        
        const opciones = {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const fechaFormateada = fechaReunion.toLocaleString('es-ES', opciones);
        
        let estadoHTML = '';
        if (esHoy && reunion.estado === 'pendiente') {
            estadoHTML = '<span style="color: #ff9800; font-weight: bold; margin-left: 10px;">• HOY</span>';
        }
        
        let botonesHTML = '';
        if (reunion.estado !== 'realizada') {
            botonesHTML += '<button class="btn-accion btn-completar" onclick="cambiarEstadoReunion(' + reunion.id + ', \'realizada\')">Realizada</button>';
        }
        if (reunion.estado !== 'no_asistio') {
            botonesHTML += '<button class="btn-accion btn-anular" onclick="cambiarEstadoReunion(' + reunion.id + ', \'no_asistio\')">No asistió</button>';
        }
        if (reunion.estado !== 'pospuesta') {
            botonesHTML += '<button class="btn-accion btn-posponer" onclick="cambiarEstadoReunion(' + reunion.id + ', \'pospuesta\')">Posponer</button>';
        }
        if (reunion.estado !== 'pendiente') {
            botonesHTML += '<button class="btn-accion btn-por-hacer" onclick="cambiarEstadoReunion(' + reunion.id + ', \'pendiente\')">Pendiente</button>';
        }
        botonesHTML += '<button class="btn-accion btn-eliminar" onclick="eliminarReunion(' + reunion.id + ')">🗑️</button>';
        
        div.innerHTML = '<div class="reunion-header"><div class="reunion-titulo">' + reunion.titulo + '</div><span class="estado-badge ' + reunion.estado + '">' + estadoTexto[reunion.estado] + '</span></div><div class="reunion-fecha">📅 ' + fechaFormateada + estadoHTML + '</div><div class="reunion-acciones">' + botonesHTML + '</div>';
        
        lista.appendChild(div);
    });
}

function cambiarEstadoReunion(id, nuevoEstado) {
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    
    reuniones = reuniones.map(reunion => {
        if (reunion.id === id) {
            reunion.estado = nuevoEstado;
        }
        return reunion;
    });
    
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    cargarReuniones();
}

function eliminarReunion(id) {
    if (!confirm('¿Eliminar esta reunión?')) return;
    
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    reuniones = reuniones.filter(reunion => reunion.id !== id);
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    cargarReuniones();
}