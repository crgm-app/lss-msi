// Variables globales
let filtroActual = 'todos';
let vistaActual = 'mes';
let fechaActual = new Date();

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    actualizarFechaHeader();
    cargarTareas();
    cargarReuniones();
    setInterval(actualizarFechaHeader, 60000); // Actualizar cada minuto
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
    event.target.classList.add('active');
    
    if (tabName === 'calendario') {
        actualizarTituloFecha();
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
        estado: 'pendiente', // pendiente, en_progreso, completada
        fechaCreacion: new Date().toISOString()
    });
    
    localStorage.setItem('tareas', JSON.stringify(tareas));
    input.value = '';
    cargarTareas();
}

function filtrarTareas(filtro) {
    filtroActual = filtro;
    
    // Actualizar botones de filtro
    const botones = document.querySelectorAll('.filtro-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    cargarTareas();
}

function cargarTareas() {
    const lista = document.getElementById('listaTareas');
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    // Aplicar filtro
    if (filtroActual !== 'todos') {
        tareas = tareas.filter(t => t.estado === filtroActual);
    }
    
    // Actualizar estadísticas
    actualizarEstadisticas();
    
    lista.innerHTML = '';
    
    if (tareas.length === 0) {
        lista.innerHTML = '<div class="mensaje-vacio">No hay tareas en esta categoría</div>';
        return;
    }
    
    tareas.forEach(tarea => {
        const div = document.createElement('div');
        div.className = `tarea-item ${tarea.estado}`;
        
        const estadoTexto = {
            'pendiente': 'Por hacer',
            'en_progreso': 'Haciendo',
            'completada': 'Hecho'
        };
        
        div.innerHTML = `
            <div class="tarea-header">
                <div class="tarea-texto">${tarea.texto}</div>
                <span class="estado-badge ${tarea.estado}">${estadoTexto[tarea.estado]}</span>
            </div>
            <div class="tarea-acciones">
                ${tarea.estado !== 'pendiente' ? '<button class="btn-accion btn-pendiente" onclick="cambiarEstado(' + tarea.id + ', \'pendiente\')">Por hacer</button>' : ''}
                ${tarea.estado !== 'en_progreso' ? '<button class="btn-accion btn-progreso" onclick="cambiarEstado(' + tarea.id + ', \'en_progreso\')">Haciendo</button>' : ''}
                ${tarea.estado !== 'completada' ? '<button class="btn-accion btn-completar" onclick="cambiarEstado(' + tarea.id + ', \'completada\')">Completar</button>' : ''}
                <button class="btn-accion btn-eliminar" onclick="eliminarTarea(' + tarea.id + ')">🗑️</button>
            </div>
        `;
        
        lista.appendChild(div);
    });
}

function cambiarEstado(id, nuevoEstado) {
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
        pendiente: tareas.filter(t => t.estado === 'pendiente').length,
        en_progreso: tareas.filter(t => t.estado === 'en_progreso').length,
        completada: tareas.filter(t => t.estado === 'completada').length
    };
    
    const container = document.getElementById('estadisticas');
    container.innerHTML = `
        <div class="stat-card pendiente">
            <div class="stat-numero">${stats.pendiente}</div>
            <div class="stat-label">Por hacer</div>
        </div>
        <div class="stat-card en_progreso">
            <div class="stat-numero">${stats.en_progreso}</div>
            <div class="stat-label">Haciendo</div>
        </div>
        <div class="stat-card completada">
            <div class="stat-numero">${stats.completada}</div>
            <div class="stat-label">Hechos</div>
        </div>
    `;
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
    
    const opciones = {
        mes: { month: 'long', year: 'numeric' },
        semana: { day: 'numeric', month: 'long', year: 'numeric' },
        dia: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    };
    
    let texto = fechaActual.toLocaleDateString('es-ES', opciones[vistaActual]);
    
    if (vistaActual === 'semana') {
        const finSemana = new Date(fechaActual);
        finSemana.setDate(finSemana.getDate() + 6);
        texto = `${fechaActual.getDate()} - ${finSemana.getDate()} de ${fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    }
    
    titulo.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
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
    
    if (titulo === '' || fecha === '') {
        alert('Completa todos los campos');
        return;
    }
    
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    
    reuniones.push({
        id: Date.now(),
        titulo: titulo,
        fecha: fecha
    });
    
    reuniones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    
    document.getElementById('tituloReunion').value = '';
    document.getElementById('fechaReunion').value = '';
    
    cargarReuniones();
}

function cargarReuniones() {
    const lista = document.getElementById('listaReuniones');
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    
    // Filtrar por vista
    reuniones = reuniones.filter(reunion => {
        const fechaReunion = new Date(reunion.fecha);
        
        if (vistaActual === 'dia') {
            return fechaReunion.toDateString() === fechaActual.toDateString();
        } else if (vistaActual === 'semana') {
            const inicioSemana = new Date(fechaActual);
            const finSemana = new Date(fechaActual);
            finSemana.setDate(finSemana.getDate() + 6);
            return fechaReunion >= inicioSemana && fechaReunion <= finSemana;
        } else { // mes
            return fechaReunion.getMonth() === fechaActual.getMonth() && 
                   fechaReunion.getFullYear() === fechaActual.getFullYear();
        }
    });
    
    lista.innerHTML = '';
    
    if (reuniones.length === 0) {
        lista.innerHTML = '<div class="mensaje-vacio">No hay reuniones programadas en este período</div>';
        return;
    }
    
    const ahora = new Date();
    
    reuniones.forEach(reunion => {
        const fechaReunion = new Date(reunion.fecha);
        const esPasada = fechaReunion < ahora;
        const esHoy = fechaReunion.toDateString() === ahora.toDateString();
        
        const div = document.createElement('div');
        div.className = `reunion-item ${esPasada ? 'pasada' : ''} ${esHoy ? 'hoy' : ''}`;
        
        const fechaFormateada = fechaReunion.toLocaleString('es-ES', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        div.innerHTML = `
            <div class="reunion-header">
                <div class="reunion-titulo">${reunion.titulo}</div>
            </div>
            <div class="reunion-fecha">
                📅 ${fechaFormateada}
                ${esHoy ? '<span style="color: #ff9800; font-weight: bold; margin-left: 10px;">• HOY</span>' : ''}
                ${esPasada && !esHoy ? '<span style="color: #999; margin-left: 10px;">• Pasada</span>' : ''}
            </div>
            <div class="reunion-acciones">
                <button class="btn-accion btn-eliminar" onclick="eliminarReunion(${reunion.id})">🗑️ Eliminar</button>
            </div>
        `;
        
        lista.appendChild(div);
    });
}

function eliminarReunion(id) {
    if (!confirm('¿Eliminar esta reunión?')) return;
    
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    reuniones = reuniones.filter(reunion => reunion.id !== id);
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    cargarReuniones();
}