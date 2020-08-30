const socket = io()

const $messageForm = document.querySelector('#messageForm')
const $sendButton = $messageForm.querySelector('button')
const $messageBox = $messageForm.querySelector('input')
const $shareLocation = document.querySelector('#shareLocation')
const $messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newmessageStyle = getComputedStyle($newMessage)

    const newMessageMargin = parseInt(newmessageStyle.marginBottom)

    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.emit('join', { username, room }, (error) => {
    alert(error)
    location.href = '/'
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, { 
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('userData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $sendButton.setAttribute('disabled', 'disabled')

    const message = document.querySelector('#messageBox').value

    socket.emit('sendMessage', message, () => {
        console.log('Message is delivered!')
        //$sendButton.removeAttribute('disabled')
        $messageBox.value = ''
        $messageBox.focus()
    })
})

$shareLocation.addEventListener('click', () => {
    if(!navigator.geolocation) 
        return console.log('Geolocation is not supported by your browser')

    $shareLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!')
            $shareLocation.removeAttribute('disabled')
        })
    })
})

$messageBox.addEventListener('input', () => {
    if($messageBox.value.length > 0)
        $sendButton.removeAttribute('disabled')
        
    if($messageBox.value.length === 0)
        $sendButton.setAttribute('disabled', 'disabled')
})