// const socket = io('http://localhost:3000');
const socket = io('http://localhost:3000', {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: sessionStorage.getItem('auth-token')
      }
    }
  }
});

const url = window.location.href;
const parts = url.split("?=");
const number = parts[1];

console.log(number);

const fetchMessages = async (number) => {
    const messages = await axios
    .get(
      `http://localhost:3000/api/chat/${number}/messages`,
      {
        headers: {
          Authorization: `BEARER ${sessionStorage.getItem("auth-token")}`,
        },
      }
    )
    .then((response) => {
      console.log('rooms',response.data);
      return response.data;
    })
    .catch((error) => {
      console.log('errors',error);
    });
    console.log('messages', messages);
}

if (number) {
    console.log('number in room', number)
    fetchMessages(number);
} else {
    alert('Something went wrong! Please reload!');
}

const $messageForm = document.querySelector('#messageForm');
const $messaageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
// const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template',
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
// const { userName, room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });

// const autoscroll = () => {
//   // New message element
//   const $newMessage = $messages.lastElementChild;

//   // Height of the new message
//   const newMessageStyles = getComputedStyle($newMessage);
//   const newMessageMargin = parseInt(newMessageStyles.marginBottom);
//   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

//   // Visible height
//   const visibleHeight = $messages.offsetHeight;

//   // Height of messages container
//   const containerHeight = $messages.scrollHeight;

//   // How far have I scrolled?
//   const scrollOffset = $messages.scrollTop + visibleHeight;

//   if (containerHeight - newMessageHeight <= scrollOffset) {
//     $messages.scrollTop = $messages.scrollHeight;
//   }
// };

// socket.on('message', (message) => {
//   const html = Mustache.render(messageTemplate, {
//     userName: message.userName,
//     message: message.text,
//     createdAt: moment(message.createdAt).format('h:mm a'),
//   });
//   $messages.insertAdjacentHTML('beforeend', html);
//   autoscroll();
// });

// socket.on('locationMessage', (message) => {
//   const html = Mustache.render(locationMessageTemplate, {
//     userName: message.userName,
//     url: message.url,
//     createdAt: moment(message.createdAt).format('h:mm a'),
//   });
//   $messages.insertAdjacentHTML('beforeend', html);
//   autoscroll();
// });

// socket.on('roomData', ({ room, users }) => {
//   const html = Mustache.render(sidebarTemplate, { room, users });
//   document.querySelector('#sidebar').innerHTML = html;
// });

// $messageForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   $messageFormButton.setAttribute('disabled', 'disabled');

//   const message = e.target.elements.message.value;

//   socket.emit('sendMessage', message, (error) => {
//     $messageFormButton.removeAttribute('disabled');
//     $messaageFormInput.value = '';
//     $messaageFormInput.focus();

//     // Acknowledgement
//     if (error) {
//       return console.log(error);
//     }
//   });
// });

// $sendLocationButton.addEventListener('click', () => {
//   if (!navigator.geolocation) {
//     return alert('Location not supported');
//   }

//   $sendLocationButton.setAttribute('disabled', 'disabled');

//   let location = {};

//   navigator.geolocation.getCurrentPosition((position) => {
//     location.longitude = position.coords.longitude;
//     location.latitude = position.coords.latitude;

//     // Acknowledgement
//     socket.emit('sendLocation', location, () => {
//       $sendLocationButton.removeAttribute('disabled');
//     });
//   });
// });

// socket.emit('join', { userName, room }, (error) => {
//   if (error) {
//     alert(error);
//     location.href = '/';
//   }
// });

socket.on('connect', () => {
    console.log('Connected to server');

    socket.emit('joinRoom', number);
    socket.emit('getOnlineUsers', number);

  // Example: Sending a message
  const message = "Hello everyone!";
  // socket.emit('sendMessage', { roomId: number, message });
  });

  socket.on('onlineUsers', ({users}) => {
    console.log('getting users', users);
  });

