const express = require('express')
var http = require('http')
var socketio = require('socket.io')
const path = require('path')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUsers, removeUsers, getUser, getUsersinRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {
    console.log('a user connected')
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))

        callback()
    })

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUsers({id: socket.id, username, room})

        if (error)
            return callback(error)

        socket.join(user.room)

        socket.emit('message', generateMessage('admin', 'Welcome!'))

        socket.to(user.room).broadcast.emit('message', generateMessage('admin', `${user.username} has joined`))

        io.to(user.room).emit('userData', {
            room: user.room,
            users: getUsersinRoom(user.room)
        })
    })

    socket.on('disconnect', () => {
        const user = removeUsers(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left!`))

            io.to(user.room).emit('userData', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
    })

    socket.on('location', (location, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))

        callback()
    })
})

server.listen(port, () => {
    console.log(`Application is up and running on port ${port}`)
})