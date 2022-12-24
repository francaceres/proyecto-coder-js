const claveProductos = "productos"
const cardStockVacioHTML = ' <div class="card text-center">\n<div class="card-body">\n<h5 class="card-title">Aún no hay productos en el stock</h5>\n<p class="card-text">Agregue productos para poder listarlos</p>\n<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalAgregarProducto">Agregar</button>\n</div> '


class Producto{
    constructor(nombre, precio, descuento, imagen){
        this.id = parseInt(localStorage.getItem("acumuladorIds")) + 1 || 1;
        this.nombre = nombre;
        this.precio = parseInt(precio) || '';
        this.descuento = parseInt(descuento) || 0;
        if (this.descuento){
            this.precioDescuento = calcDescuento(this.precio, this.descuento)
        }else{
            this.precioDescuento = precio
        }
        this.imagen = imagen;
        localStorage.setItem("acumuladorIds", this.id)
    }
}

const calcDescuento = (precio, descuento) => precio - ((descuento / 100) * precio);

const accederValor = (id) => document.getElementById(id).value;

const accederStorage = (clave) => JSON.parse(localStorage.getItem(clave) || "[]");

const accederIdProd = (btnDisparador, nombreBtn) => parseInt(btnDisparador.substring(nombreBtn.length));

const cardCreator = ({id, imagen, nombre, precio, descuento, precioDescuento}) => {
    const card = document.createElement("div");
    card.className = "card col-3 m-2";
    card.innerHTML = ` <img src="${imagen}" class="card-img-top">
                        <div class="card-body">
                            <h5 class="card-title">${nombre} (ID-${id})</h5>
                            <p class="card-text">Precio: $${parseFloat(precio).toFixed(2)}
                            Descuento: ${descuento}%
                            Precio descontado: $${parseFloat(precioDescuento).toFixed(2)}</p>
                            <button type="button" class="btn btn-primary" id="btnModificar${id}">Modificar</button>
                            <button type="button" class="btn btn-danger ms-1" id="btnEliminar${id}">Eliminar</button>
                        </div> `;

    const contenedorProductos = document.getElementById("listadoProductos");
    contenedorProductos.append(card);
}

const altaProducto = (e) => {
    e.preventDefault();
    
    const productos = accederStorage(claveProductos)

    let productoNuevo = new Producto (accederValor("nombreProducto"), accederValor("precioProducto"), accederValor("descuentoProducto"), accederValor("imagenProducto"));
    
    if(productos.length == 0){
        const container = document.getElementById("listadoProductos")
        container.innerHTML = ""
    }
    cardCreator(productoNuevo);

    productos.push(productoNuevo);
    localStorage.setItem(claveProductos, JSON.stringify(productos));

    formProducto.reset();
}

const cargarProductos = () => {
    const productos = accederStorage(claveProductos)
    const container = document.getElementById("listadoProductos")
    if(productos.length !== 0){
        container.innerHTML = ""
    }
    for(const prod of productos){
        cardCreator(prod)
    } 
}

const bajaProducto = (e) => {
    const nombreAccion = "eliminar"

    if (e.target.id.includes(nombreAccion)){
        let productos = accederStorage(claveProductos)
        const idProd = accederIdTarget(e.target.id, nombreAccion)
        productos = productos.filter(prod => prod.id != idProd)
        localStorage.setItem(claveProductos, JSON.stringify(productos))
        bajaProductoDOM(e, productos.length)
    }
}

const bajaProductoDOM = (e, num) => {
    if (!num){
        const container = document.getElementById("listadoProductos")
        container.innerHTML = cardStockVacioHTML
    }else{
        e.target.parentElement.parentElement.remove()
    }
}

const modificarProducto = () => {
    Swal.fire({
        icon: "error",
        title: "Lo sentimos, esta función no está disponible aún"
    })
}

const eliminarProducto = async (idEvent, productos, e) => {Swal.fire({
    icon:"warning",
    iconColor: "red",
    title: "¿Está seguro de que desea eliminar el producto?",
    text: "Los productos eliminados no podrán recuperarse",
    showConfirmButton: true,
    confirmButtonText: "Sí, eliminar",
    showCancelButton: true,
    cancelButtonText: "Cancelar"
})
.then((res) => {
    if (res.isConfirmed){
        const idProd = accederIdProd(idEvent, "btnEliminar")
        productos = productos.filter(prod => prod.id != idProd)
        bajaProductoDOM(e, productos.length)
        localStorage.setItem(claveProductos, JSON.stringify(productos))
    }
})}


const clickHandler = (e) => {
    idEvent = e.target.id
    if (idEvent.includes("btn")){
        let productos = accederStorage(claveProductos)
        if (idEvent.includes("Eliminar")){
            eliminarProducto(idEvent, productos, e)
        }
        if (idEvent.includes("Modificar")){
            modificarProducto()
        }
    }
}

const cambioDivisa = async (e) => {
    const divisa = e.target.value
    let productos = accederStorage(claveProductos)
    const res = await fetch("https://www.dolarsi.com/api/api.php?type=valoresprincipales")
    const data = await res.json()
    const precioDolar = parseInt(data[1].casa.venta)
    switch(divisa){
        case "dolar":
            for(prod of productos){
                prod.precio = prod.precio / precioDolar
                prod.precioDescuento = calcDescuento(prod.precio, prod.descuento)
            }
            break
        case "peso":
            for(prod of productos){
                prod.precio = prod.precio * precioDolar
                prod.precioDescuento = calcDescuento(prod.precio, prod.descuento)
            }
            break
    }
    localStorage.setItem(claveProductos, JSON.stringify(productos))
    cargarProductos()
}

cargarProductos()

let formProducto = document.getElementById("agregarProducto");
formProducto.onsubmit = altaProducto;

document.onclick = clickHandler

const selectDivisa = document.getElementById("selectDivisa")
selectDivisa.onchange = cambioDivisa

