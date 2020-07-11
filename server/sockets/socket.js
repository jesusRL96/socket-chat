const { io } = require('../server');
const {crearMensaje} = require('../utilidades/utilidades.js');
const { Usuarios } = require('../classes/usuarios.js');

let usuarios = new Usuarios();

io.on('connect', (client) => {

  client.on('entrarChat', (usuario, callback) => {
    console.log(usuario);
    if(!usuario.nombre || !usuario.sala) {
      return callback({
        err: true,
        mensaje: 'El nombre/sala es necesario'
      });
    }
    client.join(usuario.sala)
    let personas = usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);
    client.broadcast.to(usuario.sala).emit('listaPersonas', usuarios.getPersonasPorSala(usuario.sala));
    client.broadcast.to(usuario.sala).emit('crearMensaje',crearMensaje('Administrador', `${usuario.nombre} se unio`));
    callback(usuarios.getPersonasPorSala(usuario.sala));
  });

  client.on('crearMensaje', (data, callback) => {
    let persona = usuarios.getPersona(client.id);
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    callback(mensaje);
  });

  client.on('disconnect', () => {
    let personaBorrada = usuarios.borrarPersona(client.id);
    console.log('Persona borrada: ' + personaBorrada.nombre);
    client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Administrador', `${personaBorrada.nombre} salio`));
    client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
  })

  // Mensaje privado
  client.on('mensajePrivado', (data) => {
    let persona = usuarios.getPersona(client.id);
    client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
  });



});
