const express = require('express')
const app = express()
const cors = require('cors')
/* const helmet = require('helmet') */

//middleware
app.use(cors())
//app.use(helmet());

//config
app.set('puerto', process.env.PORT || 3001)

app.get('/', (req,res)=>{
    res.send("<h1>Bien</h1>")
})

//webSocketConfig
const { createServer } = require('http')
const { Server } = require('socket.io')
const httpServer = createServer(app)

//rutas
const ruta = require('./router')
app.use('/', ruta)

//helpers
let usuarios = []

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
        return usuarios.splice(index, 1)[0]
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

//webSocket
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000'
    }
})

io.on("connection", (socket) => {
    console.log(`usuario con id ${socket.id} conectado`)

    socket.on('client:join', ({usuario, room}, callback)=>{
        //console.log(usuario, room)

        const {error, user} = addUsuario({id: socket.id, usuario, room})
   
        if(error) return callback(error)

        socket.join(user.room)
        socket.emit('mensaje', {user: 'admin', text: `${user.usuario}, bienvenido al chat en el room ${user.room} `})
        socket.broadcast.to(user.room).emit('mensaje', {user: 'admin', text: `${user.usuario} se unio al chat`} )
        //console.log(`Usuario con id ${socket.id} se unio al room ${room}`)

        //decir los usuarios que hay en el room
        io.to(user.room).emit('dataRoom', {room: user.room, usuarios: getUsuarioInRoom(user.room)})

        callback()
    })

    socket.on('client:mensaje', (mensaje, callback)=>{
        const user = getUsuario(socket.id)

        io.to(user.room).emit('mensaje', {user: user.usuario, text: mensaje})

        //decir los usuarios que hay en el room
        io.to(user.room).emit('dataRoom', {room: user.room, usuarios: getUsuarioInRoom(user.room)})

        callback()
    })

    ///desconectarse
    socket.on("disconnect", () =>{
        /* console.log(`usuario con id ${socket.id} desconectado`) */
        const user = removeUsuario(socket.id)

        if(user){
            io.to(user.room).emit('mensaje', {user: 'admin', text: `usuario ${user.usuario} se ha desconectado`})
        }
    })
});



httpServer.listen(app.get('puerto'), ()=>{
    console.log(`app corriendo en el puerto`, app.get('puerto'))
})