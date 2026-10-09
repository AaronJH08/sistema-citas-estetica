
const form = document.querySelector("#booking-form");
const lista = document.querySelector("#appointments-list");
const contenedorHoras = document.querySelector("#button-horas");
const selectorServicio = document.querySelector("#service");
const selectorFecha = document.querySelector("#date");
const inputNombre = document.querySelector("#name");

let horaSeleccionada = null;
let indiceEditando = null;

let citas = JSON.parse(localStorage.getItem("citas")) || [];



function obtenerDatosServicio(service) {

    if (service === "corte") {
        return {
            precio: 150,
            duracion: 40
        };
    }

    if (service === "corte-barba") {
        return {
            precio: 220,
            duracion: 60
        };
    }

    if (service === "barba") {
        return {
            precio: 100,
            duracion: 30
        };
    }

    return null;
}



selectorServicio.addEventListener("change", function() {
    generarHorarios();
});


selectorFecha.addEventListener("change", function() {
    generarHorarios();
});



function generarHorarios() {

    const service = selectorServicio.value;
    const date = selectorFecha.value;

    contenedorHoras.innerHTML = "";

    if (service === "" || date === "") {
        horaSeleccionada = null;
        return;
    }

    const datosServicio = obtenerDatosServicio(service);

    if (!datosServicio) {
        return;
    }

    const duracion = datosServicio.duracion;


    //Citras del día seleccionado
    //excepto la que estamos editando

    const citasDelDia = citas.filter(function(cita, index) {

        if (index === indiceEditando) {
            return false;
        }

        return cita.fecha === date;
    });


    //Horario de trabajo:
    //10:00 = 600 minutos
    //19:00 = 1140 minutos 

    for (
        let horaDisponible = 600;
        horaDisponible + duracion <= 1140;
        horaDisponible = horaDisponible + duracion
    ) {

        const inicioNuevaCita = horaDisponible;
        const finNuevaCita = inicioNuevaCita + duracion;

        let ocupado = false;



        citasDelDia.forEach(function(cita) {

            if (!cita.hora || !cita.duracion) {
                return;
            }

            const partesHora = cita.hora.split(":");

            const horaCita = parseInt(partesHora[0]);
            const minutosCita = parseInt(partesHora[1]);

            const inicioCita = horaCita * 60 + minutosCita;
            const finCita = inicioCita + cita.duracion;


            //Detectar empalme 

            if (
                !(
                    finNuevaCita <= inicioCita ||
                    inicioNuevaCita >= finCita
                )
            ) {
                ocupado = true;
            }
        });



        if (ocupado === false) {

            const hora = Math.floor(horaDisponible / 60);
            const minutos = horaDisponible % 60;

            let minutosTexto;

            if (minutos === 0) {
                minutosTexto = "00";
            } else {
                minutosTexto = minutos;
            }

            const textoHora = hora + ":" + minutosTexto;

            const botonHora = document.createElement("button");

            botonHora.type = "button";
            botonHora.textContent = textoHora;



            if (horaSeleccionada === textoHora) {
                botonHora.classList.add("seleccionado");
            }


            botonHora.addEventListener("click", function() {

                const botonesHoras =
                    contenedorHoras.querySelectorAll("button");

                botonesHoras.forEach(function(boton) {
                    boton.classList.remove("seleccionado");
                });

                botonHora.classList.add("seleccionado");

                horaSeleccionada = botonHora.textContent;

                console.log(
                    "Hora seleccionada:",
                    horaSeleccionada
                );
            });


            contenedorHoras.appendChild(botonHora);
        }
    }
}


form.addEventListener("submit", function(event) {

    event.preventDefault();


    const name = inputNombre.value;
    const service = selectorServicio.value;
    const date = selectorFecha.value;



    if (service === "") {
        alert("Por favor, selecciona un servicio.");
        return;
    }



    if (horaSeleccionada === null) {
        alert("Por favor, selecciona una hora.");
        return;
    }


    const datosServicio = obtenerDatosServicio(service);

    const precio = datosServicio.precio;
    const duracion = datosServicio.duracion;



    if (indiceEditando !== null) {

        const citaOriginal = citas[indiceEditando];



        const fechaHoraCita =
            new Date(
                citaOriginal.fecha +
                "T" +
                citaOriginal.hora +
                ":00"
            );

        const ahora = new Date();

        const diferencia =
            fechaHoraCita.getTime() - ahora.getTime();

        const dosHoras =
            2 * 60 * 60 * 1000;


        if (diferencia < dosHoras) {

            alert(
                "No puedes modificar esta cita porque faltan menos de 2 horas."
            );

            indiceEditando = null;
            return;
        }


        //Actualizar la cita 

        citas[indiceEditando] = {
            nombre: name,
            servicio: service,
            fecha: date,
            hora: horaSeleccionada,
            costo: precio,
            duracion: duracion
        };


        localStorage.setItem(
            "citas",
            JSON.stringify(citas)
        );


        mostrarCitas();
        generarHorarios();


        alert("La cita fue actualizada correctamente.");


        indiceEditando = null;
        horaSeleccionada = null;

        form.reset();
        contenedorHoras.innerHTML = "";

        return;
    }


    const cita = {

        nombre: name,
        servicio: service,
        fecha: date,
        hora: horaSeleccionada,
        costo: precio,
        duracion: duracion

    };


    citas.push(cita);


    localStorage.setItem(
        "citas",
        JSON.stringify(citas)
    );


    mostrarCitas();

    generarHorarios();


    alert(
        "Cita confirmada\n\n" +
        "Cliente: " + cita.nombre + "\n" +
        "Servicio: " + cita.servicio + "\n" +
        "Fecha: " + cita.fecha + "\n" +
        "Hora: " + cita.hora + "\n" +
        "Precio: $" + cita.costo
    );


    form.reset();

    horaSeleccionada = null;

    contenedorHoras.innerHTML = "";
});


function mostrarCitas() {

    lista.innerHTML = "";


    citas.forEach(function(cita, index) {

        const elemento = document.createElement("div");

        elemento.classList.add("appointment");


        elemento.innerHTML = `
            <h3>${cita.nombre}</h3>
            <p>Servicio: ${cita.servicio}</p>
            <p>Fecha: ${cita.fecha}</p>
            <p>Hora: ${cita.hora}</p>
            <p>Precio: $${cita.costo}</p>
        `;


        const botonEliminar =
            document.createElement("button");

        botonEliminar.textContent =
            "Eliminar cita";


        botonEliminar.addEventListener(
            "click",
            function() {

                const confirmar =
                    confirm(
                        "¿Seguro que quieres eliminar esta cita?"
                    );

                if (!confirmar) {
                    return;
                }


                citas.splice(index, 1);


                localStorage.setItem(
                    "citas",
                    JSON.stringify(citas)
                );


                mostrarCitas();
                generarHorarios();
            }
        );


        elemento.appendChild(botonEliminar);


        const botonEditar =
            document.createElement("button");

        botonEditar.textContent =
            "Editar cita";


        botonEditar.addEventListener(
            "click",
            function() {

                const citaEditar = citas[index];


                //Comprobar si faltan menos de 2 horas 

                const fechaHoraCita =
                    new Date(
                        citaEditar.fecha +
                        "T" +
                        citaEditar.hora +
                        ":00"
                    );

                const ahora = new Date();

                const diferencia =
                    fechaHoraCita.getTime() -
                    ahora.getTime();

                const dosHoras =
                    2 * 60 * 60 * 1000;


                if (diferencia < dosHoras) {

                    alert(
                        "Esta cita ya no puede modificarse porque faltan menos de 2 horas."
                    );

                    return;
                }


                indiceEditando = index;


                // Cargar datos en formulario 

                inputNombre.value =
                    citaEditar.nombre;

                selectorServicio.value =
                    citaEditar.servicio;

                selectorFecha.value =
                    citaEditar.fecha;

                horaSeleccionada =
                    citaEditar.hora;


                //Regenerar horarios 

                generarHorarios();

                form.scrollIntoView({
                    behavior: "smooth"
                });


                console.log(
                    "Editando cita:",
                    indiceEditando
                );
            }
        );


        elemento.appendChild(botonEditar);


        lista.appendChild(elemento);
    });
}

mostrarCitas();