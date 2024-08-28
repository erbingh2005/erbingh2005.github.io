document.addEventListener("DOMContentLoaded", function () {
    let clientes = [];
    let ventas = [];
    let editandoVentaIndex = null;

    const contenido = document.getElementById("contenido");

    document.getElementById("btnClientes").addEventListener("click", mostrarClientes);
    document.getElementById("btnVentas").addEventListener("click", mostrarVentas);
    document.getElementById("btnCXC").addEventListener("click", mostrarCXCClientes);
    document.getElementById("btnReportes").addEventListener("click", mostrarReportes);

    function mostrarClientes() {
        contenido.innerHTML = `
            <h2>Registro de Clientes</h2>
            <form class="formulario" id="formClientes">
                <input type="text" id="nombreCliente" placeholder="Nombre" required>
                <input type="text" id="celularCliente" placeholder="Celular" maxlength="9" required>
                <select id="companiaCliente" required>
                    <option value="">Seleccione Compañía</option>
                    <option value="CLARO">CLARO</option>
                    <option value="TIGO">TIGO</option>
                </select>
                <button type="submit" class="btn-form">Guardar Cliente</button>
            </form>
        `;

        document.getElementById("celularCliente").addEventListener("input", formatearCelular);

        document.getElementById("formClientes").addEventListener("submit", function (e) {
            e.preventDefault();
            const nombre = document.getElementById("nombreCliente").value;
            const celular = document.getElementById("celularCliente").value;
            const compania = document.getElementById("companiaCliente").value;

            if (celular.replace(/\D/g, "").length !== 8) {
                alert("El celular debe contener exactamente 8 dígitos.");
                return;
            }

            if (clientes.some(cliente => cliente.celular === celular)) {
                alert("El celular ya está registrado.");
                return;
            }

            clientes.push({ nombre, celular, compania });
            alert("Cliente registrado correctamente.");
            mostrarClientes();
        });
    }

    function formatearCelular() {
        const celularInput = document.getElementById("celularCliente");
        let celular = celularInput.value.replace(/\D/g, "");

        if (celular.length > 8) {
            celular = celular.slice(0, 8);
        }

        if (celular.length > 4) {
            celular = ${celular.slice(0, 4)}-${celular.slice(4)};
        }

        celularInput.value = celular;
    }

    function mostrarVentas() {
        contenido.innerHTML = `
            <h2>Registro de Ventas</h2>
            <form class="formulario" id="formVentas">
                <input type="date" id="fechaVenta" required>
                <select id="clienteVenta" required>
                    <option value="">Seleccione Cliente</option>
                    ${clientes.map(cliente => <option value="${cliente.celular}">${cliente.nombre} - ${cliente.celular} (${cliente.compania})</option>).join('')}
                </select>
                <input type="number" id="valorRecarga" placeholder="Valor de la Recarga" required>
                <input type="number" id="comision" placeholder="Comisión" required>
                <input type="text" id="totalPagar" placeholder="Total a Pagar" readonly>
                <button type="submit" class="btn-form">Registrar Venta</button>
            </form>
        `;

        document.getElementById("valorRecarga").addEventListener("input", calcularTotal);
        document.getElementById("comision").addEventListener("input", calcularTotal);

        document.getElementById("formVentas").addEventListener("submit", function (e) {
            e.preventDefault();
            const fechaVenta = document.getElementById("fechaVenta").value;
            const clienteVenta = document.getElementById("clienteVenta").value;
            const valorRecarga = parseFloat(document.getElementById("valorRecarga").value);
            const comision = parseFloat(document.getElementById("comision").value);
            const totalPagar = valorRecarga + comision;

            if (editandoVentaIndex !== null) {
                ventas[editandoVentaIndex] = { fechaVenta, clienteVenta, valorRecarga, comision, totalPagar, estado: "Pendiente" };
                editandoVentaIndex = null;
                alert("Venta editada correctamente.");
            } else {
                ventas.push({ fechaVenta, clienteVenta, valorRecarga, comision, totalPagar, estado: "Pendiente" });
                alert("Venta registrada correctamente.");
            }

            mostrarVentas();
        });

        function calcularTotal() {
            const valorRecarga = parseFloat(document.getElementById("valorRecarga").value) || 0;
            const comision = parseFloat(document.getElementById("comision").value) || 0;
            const totalPagar = valorRecarga + comision;
            document.getElementById("totalPagar").value = totalPagar.toFixed(2);
        }
    }

    function mostrarReportes() {
        contenido.innerHTML = `
            <h2>Reporte de Ventas</h2>
            <div class="filtros">
                <label for="filtroVentas">Filtrar por estado:</label>
                <select id="filtroVentas">
                    <option value="Todas">Todas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Cancelada">Canceladas</option>
                </select>
                <label for="filtroClientes">Filtrar por cliente:</label>
                <select id="filtroClientes">
                    <option value="Todos">Todos</option>
                    ${clientes.map(cliente => <option value="${cliente.celular}">${cliente.nombre} - ${cliente.celular} (${cliente.compania})</option>).join('')}
                </select>
                <label for="filtroFecha">Filtrar por fecha:</label>
                <input type="date" id="filtroFecha">
                <button id="btnGenerarImagen">Generar Imagen de la Tabla</button>
            </div>
            <table id="tablaReportes">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total a Pagar</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaVentas"></tbody>
            </table>
        `;

        // Actualizar reporte cuando cambien los filtros
        document.getElementById("filtroVentas").addEventListener("change", actualizarReporteVentas);
        document.getElementById("filtroClientes").addEventListener("change", actualizarReporteVentas);
        document.getElementById("filtroFecha").addEventListener("change", actualizarReporteVentas);

        document.getElementById("btnGenerarImagen").addEventListener("click", generarImagenTabla);

        actualizarReporteVentas(); // Mostrar la tabla inicial sin filtros
    }

    function actualizarReporteVentas() {
        const filtroEstado = document.getElementById("filtroVentas").value;
        const filtroCliente = document.getElementById("filtroClientes").value;
        const filtroFecha = document.getElementById("filtroFecha").value;

        const tablaVentas = document.getElementById("tablaVentas");
        tablaVentas.innerHTML = ''; // Limpiar tabla

        ventas
            .filter(venta => 
                (filtroEstado === "Todas" || venta.estado === filtroEstado) && 
                (filtroCliente === "Todos" || venta.clienteVenta === filtroCliente) && 
                (!filtroFecha || venta.fechaVenta === filtroFecha))
            .forEach((venta, index) => {
                const clienteInfo = clientes.find(cliente => cliente.celular === venta.clienteVenta);
                tablaVentas.innerHTML += `
                    <tr class="${venta.estado === 'Cancelada' ? 'row-red' : ''}">
                        <td>${formatearFecha(venta.fechaVenta)}</td>
                        <td>${clienteInfo.nombre} (${clienteInfo.compania})</td>
                        <td>${venta.totalPagar.toFixed(2)}</td>
                        <td>${venta.estado}</td>
                        <td>
                            ${venta.estado === "Pendiente" ? `
                                <button onclick="editarVenta(${index})">Editar</button>
                                <button onclick="eliminarVenta(${index})">Eliminar</button>
                                <button onclick="cancelarVenta(${index})">Cancelar</button>
                            ` : ''}
                        </td>
                    </tr>
                `;
            });
    }

    function generarImagenTabla() {
        const tabla = document.getElementById("tablaReportes");

        html2canvas(tabla, {
            onrendered: function (canvas) {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "Reporte_Ventas.png";
                link.click();
            }
        });
    }

    window.eliminarVenta = function (index) {
        if (ventas[index].estado !== "Cancelada") {
            ventas.splice(index, 1);
            alert("Venta eliminada correctamente.");
            actualizarReporteVentas();
        }
    };

    window.cancelarVenta = function (index) {
        ventas[index].estado = "Cancelada";
        alert("Venta cancelada correctamente.");
        actualizarReporteVentas();
    };

    window.editarVenta = function (index) {
        const venta = ventas[index];
        editandoVentaIndex = index;

        contenido.innerHTML = `
            <h2>Editar Venta</h2>
            <form class="formulario" id="formEditarVentas">
                <input type="date" id="fechaVenta" value="${venta.fechaVenta}" required>
                <select id="clienteVenta" required>
                    ${clientes.map(cliente => <option value="${cliente.celular}" ${cliente.celular === venta.clienteVenta ? 'selected' : ''}>${cliente.nombre} - ${cliente.celular} (${cliente.compania})</option>).join('')}
                </select>
                <input type="number" id="valorRecarga" value="${venta.valorRecarga}" required>
                <input type="number" id="comision" value="${venta.comision}" required>
                <input type="text" id="totalPagar" value="${venta.totalPagar.toFixed(2)}" readonly>
                <button type="submit" class="btn-form">Guardar Cambios</button>
                <button type="button" class="btn-form" id="btnCancelarEdicion">Cancelar</button>
            </form>
        `;

        document.getElementById("valorRecarga").addEventListener("input", calcularTotalEditar);
        document.getElementById("comision").addEventListener("input", calcularTotalEditar);

        document.getElementById("btnCancelarEdicion").addEventListener("click", mostrarReportes); // Botón cancelar cierra la edición

        function calcularTotalEditar() {
            const valorRecarga = parseFloat(document.getElementById("valorRecarga").value) || 0;
            const comision = parseFloat(document.getElementById("comision").value) || 0;
            const totalPagar = valorRecarga + comision;
            document.getElementById("totalPagar").value = totalPagar.toFixed(2);
        }

        document.getElementById("formEditarVentas").addEventListener("submit", function (e) {
            e.preventDefault();

            const fechaVenta = document.getElementById("fechaVenta").value;
            const clienteVenta = document.getElementById("clienteVenta").value;
            const valorRecarga = parseFloat(document.getElementById("valorRecarga").value);
            const comision = parseFloat(document.getElementById("comision").value);
            const totalPagar = valorRecarga + comision;

            ventas[editandoVentaIndex] = { fechaVenta, clienteVenta, valorRecarga, comision, totalPagar, estado: "Pendiente" };
            editandoVentaIndex = null;

            alert("Venta editada correctamente.");
            mostrarReportes();
        });
    };

    function formatearFecha(fecha) {
        const partes = fecha.split("-");
        return ${partes[2]}/${partes[1]}/${partes[0]};
    }

    function mostrarCXCClientes() {
        contenido.innerHTML = `
            <h2>Cuentas por Cobrar</h2>
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Total a Cobrar</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientes.map(cliente => {
                        const totalPendiente = ventas
                            .filter(venta => venta.clienteVenta === cliente.celular && venta.estado === "Pendiente")
                            .reduce((total, venta) => total + venta.totalPagar, 0);

                        return totalPendiente > 0 ? `
                            <tr>
                                <td>${cliente.nombre} (${cliente.compania})</td>
                                <td>${totalPendiente.toFixed(2)}</td>
                                <td><button onclick="cobrarDeudaCliente('${cliente.celular}')">Cobrar Deuda</button></td>
                            </tr>
                        ` : '';
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    window.cobrarDeudaCliente = function (celularCliente) {
        ventas.forEach(venta => {
            if (venta.clienteVenta === celularCliente && venta.estado === "Pendiente") {
                venta.estado = "Cancelada";
            }
        });
        alert("Deuda cobrada para el cliente.");
        mostrarCXCClientes(); // Actualizar la vista después de cobrar la deuda
    };
});