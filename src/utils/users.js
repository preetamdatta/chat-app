const users = []

const addUsers = ({id, username, room}) => {
    if(!username || !room) {
        return {
            error: 'username and room are required!'
        }
    }

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    const existingUsers = users.filter( user => user.username === username && user.room === room)

    if(existingUsers.length > 0) {
        return {
            error : 'Username is in use'
        }
    }

    user = {id, username, room}

    users.push(user)   
    
    return { user }
}

const removeUsers = (id) => {
    const index = users.findIndex(user => user.id === id)

    if(index !== -1)
        return users.splice(index, 1)[0]

     
}

const getUser = (id) => users.find(user => user.id === id)

const getUsersinRoom = (room) => users.filter(user => user.room === room)

module.exports = {
    addUsers,
    removeUsers,
    getUser,
    getUsersinRoom
}