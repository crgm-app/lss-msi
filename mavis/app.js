// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarTareas();
    cargarReuniones();
});

// Funciones para cambiar pestañas
function showTab(tabName) {
    // Ocultar todos los contenidos
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Desactivar todas las pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Activar la pestaña seleccionada
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ===== TAREAS =====
function agregarTarea() {
    const input = document.getElementById('nuevaTarea');
    const texto = input.value.trim();
    
    if (texto === '') {
        alert('Escribe una tarea');
        return;
    }
    
    // Obtener tareas existentes
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    // Agregar nueva tarea
    tareas.push({
        id: Date.now(),
        texto: texto,
        completada: false
    });
    
    // Guardar en localStorage
    localStorage.setItem('tareas', JSON.stringify(tareas));
    
    // Limpiar input
    input.value = '';
    
    // Recargar lista
    cargarTareas();
}

function cargarTareas() {
    const lista = document.getElementById('listaTareas');
    const tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    lista.innerHTML = '';
    
    tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.className = tarea.completada ? 'completada' : '';
        
        li.innerHTML = `
            <span class="tarea-text" onclick="toggleTarea(${tarea.id})">
                ${tarea.texto}
            </span>
            <button class="btn-eliminar" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
        `;
        
        lista.appendChild(li);
    });
}

function toggleTarea(id) {
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    
    tareas = tareas.map(tarea => {
        if (tarea.id === id) {
            tarea.completada = !tarea.completada;
        }
        return tarea;
    });
    
    localStorage.setItem('tareas', JSON.stringify(tareas));
    cargarTareas();
}

function eliminarTarea(id) {
    let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
    tareas = tareas.filter(tarea => tarea.id !== id);
    localStorage.setItem('tareas', JSON.stringify(tareas));
    cargarTareas();
}

// ===== REUNIONES =====
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
    
    // Ordenar por fecha
    reuniones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    
    document.getElementById('tituloReunion').value = '';
    document.getElementById('fechaReunion').value = '';
    
    cargarReuniones();
}

function cargarReuniones() {
    const lista = document.getElementById('listaReuniones');
    const reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    
    lista.innerHTML = '';
    
    if (reuniones.length === 0) {
        lista.innerHTML = '<li>No hay reuniones programadas</li>';
        return;
    }
    
    reuniones.forEach(reunion => {
        const li = document.createElement('li');
        const fechaObj = new Date(reunion.fecha);
        const fechaFormateada = fechaObj.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        li.innerHTML = `
            <div class="reunion-info">
                <strong>${reunion.titulo}</strong>
                <div class="reunion-fecha">📅 ${fechaFormateada}</div>
            </div>
            <button class="btn-eliminar" onclick="eliminarReunion(${reunion.id})">Eliminar</button>
        `;
        
        lista.appendChild(li);
    });
}

function eliminarReunion(id) {
    let reuniones = JSON.parse(localStorage.getItem('reuniones') || '[]');
    reuniones = reuniones.filter(reunion => reunion.id !== id);
    localStorage.setItem('reuniones', JSON.stringify(reuniones));
    cargarReuniones();
}