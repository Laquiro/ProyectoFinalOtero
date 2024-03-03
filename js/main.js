// Definición de una lista vacía para almacenar los productos
let listaCompras = [];

// Función para cargar la lista desde el Local Storage al cargar la página
function cargarListaDesdeLocalStorage() {
    const listaGuardada = localStorage.getItem('listaCompras');
    if (listaGuardada) {
        listaCompras = JSON.parse(listaGuardada);
        // Actualizar la lista en la interfaz
        actualizarLista();
    }
}

// Función para guardar la lista en el Local Storage
function guardarListaEnLocalStorage() {
    localStorage.setItem('listaCompras', JSON.stringify(listaCompras));
}

// Función para cargar productos desde el archivo JSON
function cargarProductosDesdeJSON() {
    fetch('json/productos.json')
        .then(response => response.json())
        .then(data => {
            // Vaciar solo la lista de productos cargados desde JSON
            listaCompras = listaCompras.filter(producto => !data.some(jsonProducto => jsonProducto.id === producto.id));

            // Agregar productos cargados desde JSON
            listaCompras = listaCompras.concat(data);

            // Actualizar la lista en la interfaz
            actualizarLista();
            // Guardar lista actualizada en el Local Storage
            guardarListaEnLocalStorage();
        })
        .catch(error => console.error('Error al cargar productos desde JSON:', error));
}

// cargar la lista desde el Local Storage y productos desde JSON
window.addEventListener('load', () => {
    cargarListaDesdeLocalStorage();
    cargarProductosDesdeJSON();
});

// agregar un producto a la lista o editar si ya existe
function agregarProducto() {
    const nombreProducto = document.getElementById("producto").value.trim();
    const precioProducto = parseFloat(document.getElementById("precio").value.trim());
    let cantidadProducto = 1; // cantidad por defecto = 1

    // obtener la cantidad ingresada 
    const cantidadIngresada = document.getElementById("cantidad").value.trim();
    if (cantidadIngresada !== "") {
        cantidadProducto = parseInt(cantidadIngresada);
    }

    // Verificar que la cantidad no sea negativa
    if (cantidadProducto < 0) {
        mostrarMensaje("La cantidad de productos no puede ser negativa.", "error");
        return;
    }

    // Verificar que el nombre del producto no esté vacío
    if (nombreProducto === "") {
        mostrarMensaje("Por favor, ingrese un nombre de producto válido.", "error");
        return;
    }

    // Verificar si el producto ya existe en la lista
    const productoExistente = listaCompras.find(producto => producto.nombre.toLowerCase() === nombreProducto.toLowerCase());
    if (productoExistente) {
        // Mostrar cuadro de edición si el producto existente
        editarProducto(productoExistente.id);
    } else {
        // Si el producto no existe verifica que tenga precio
        if (isNaN(precioProducto) || precioProducto <= 0) {
            mostrarMensaje("Por favor, ingrese un precio numérico mayor que cero.", "error");
            return;
        }

        const idProducto = Date.now();

        // Agregar el producto
        listaCompras.push({ id: idProducto, nombre: nombreProducto, precio: precioProducto, cantidad: cantidadProducto });

        // Actualizar la lista en la interfaz y guardar en el Local Storage
        actualizarLista();
        guardarListaEnLocalStorage();

        // Mostrar notificación de éxito
        mostrarMensaje("Producto agregado correctamente", "exito");
    }
}

// Eliminar un producto 
function eliminarProducto(idProducto) {
    listaCompras = listaCompras.filter(producto => producto.id !== idProducto);
    actualizarLista();
    guardarListaEnLocalStorage();
    mostrarMensaje("Producto eliminado correctamente", "exito");
}

// Buscar productos
function buscarProducto() {
    const textoBusqueda = document.getElementById("buscar").value.trim().toLowerCase();
    const productosFiltrados = listaCompras.filter(producto =>
        producto.nombre.toLowerCase().includes(textoBusqueda)
    );
    actualizarLista(productosFiltrados, "resultados-busqueda");
}

// Editar un producto 
function editarProducto(idProducto) {
    const producto = listaCompras.find(producto => producto.id === idProducto);

    Swal.fire({
        title: 'Editar producto',
        html: `<input id="swal-input1" class="swal2-input" placeholder="Nombre del producto" value="${producto.nombre}">
               <input id="swal-input2" class="swal2-input" placeholder="Precio del producto" value="${producto.precio}">
               <input id="swal-input3" class="swal2-input" placeholder="Cantidad del producto" value="${producto.cantidad}">`,
        focusConfirm: false,
        showCloseButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Okay',
        preConfirm: () => {
            const nuevoNombre = Swal.getPopup().querySelector('#swal-input1').value;
            const nuevoPrecio = Swal.getPopup().querySelector('#swal-input2').value;
            const nuevaCantidad = Swal.getPopup().querySelector('#swal-input3').value;
            if (!nuevoNombre || isNaN(nuevoPrecio) || nuevoPrecio <= 0 || isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
                Swal.showValidationMessage("Por favor, ingrese un nombre de producto válido, un precio y cantidad numéricos mayores que cero.");
            }
            return { nuevoNombre: nuevoNombre, nuevoPrecio: nuevoPrecio, nuevaCantidad: nuevaCantidad };
        }
    }).then(result => {
        if (result.isConfirmed) {
            producto.nombre = result.value.nuevoNombre;
            producto.precio = parseFloat(result.value.nuevoPrecio);
            producto.cantidad = parseInt(result.value.nuevaCantidad);
            actualizarLista();
            mostrarMensaje("Producto editado correctamente", "exito");
        }
    });
}

// Actualizar la lista en la interfaz
function actualizarLista(productos = listaCompras, contenedorId = "lista-compras") {
    let listaHTML = "";
    let totalPrecio = 0;

    productos.forEach((producto) => {
        listaHTML += `
            <div>
                <span>${producto.nombre}</span>
                <span>$${producto.precio.toFixed(2)}</span>
                <span>Cantidad: ${producto.cantidad}</span>
                <button class="interno eliminar-btn" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                <button class="interno editar-btn" onclick="editarProducto(${producto.id})">Editar</button>
            </div>
        `;
        totalPrecio += producto.precio * producto.cantidad;
    });

    document.getElementById(contenedorId).innerHTML = listaHTML;
    if (contenedorId === "lista-compras") {
        document.getElementById("total").textContent = `Total: $${totalPrecio.toFixed(2)}`;
    }
}

// Mostrar mensaje utilizando Toastify
function mostrarMensaje(mensaje, tipo) {
    Toastify({
        text: mensaje,
        duration: 1500,
        close: true,
        gravity: "top",
        backgroundColor: tipo === "exito" ? "linear-gradient(to right, #00b09b, #96c93d)" : "linear-gradient(to right, #ff5f6d, #ffc371)",
    }).showToast();
}

// Limpiar campos de entrada
function limpiarCampos() {
    document.getElementById("producto").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("cantidad").value = "1"; // Restaurar cantidad por defecto a 1
}

// Ordenar la lista
function ordenarLista() {
    const orden = document.getElementById("ordenar").value;
    listaCompras.sort((a, b) => (orden === "precio-menor" ? a.precio - b.precio : b.precio - a.precio));
    actualizarLista();
}

// Event listeners
document.getElementById("agregar").addEventListener("click", agregarProducto);
document.getElementById("ordenar").addEventListener("change", ordenarLista);
document.getElementById("buscar-btn").addEventListener("click", buscarProducto);
