let usuarios = [];


const addUsuario = ({id, usuario, room}) => {
    //Aqui hago esto => Raudel Gomez => raudelgomez
    usuario = usuario.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Encuentrame en el room un usuario con el mismo nombre de usuario
    const UsuarioExistente = usuarios.find(user => user.room === room && user.usuario === usuario)

    if(UsuarioExistente){
        return {error: 'Ese nombre de usuario ya no esta disponible'}
    }

    const user = {id, usuario, room}
    usuarios.push(user)

    return {user}
}

const removeUsuario = (id) => {
    const index = usuarios.findIndex(user=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUsuario = (id) => {
    const user = usuarios.find(user => user.id === id)
    return user
}

const getUsuarioInRoom = (room) => {
    const users = usuarios.filter(user => user.room === room)
    return users
}

module.exports = {addUsuario, removeUsuario, getUsuario, getUsuarioInRoom}