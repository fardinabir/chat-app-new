const socket = io("http://localhost:3000", {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: sessionStorage.getItem("auth-token"),
      },
    },
  },
});

let searchParams = new URLSearchParams(window.location.search);

let number = searchParams.get("roomId");
let roomName = searchParams.get("roomName");

const fetchMessages = async (number) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/chat/${number}/messages`,
      {
        headers: {
          Authorization: `BEARER ${sessionStorage.getItem("auth-token")}`,
        },
      }
    );
    console.log("rooms", response.data);
    return response.data;
  } catch (error) {
    console.log("errors", error);
    return null;
  }
};

const $messageForm = document.querySelector("#messageForm");
const $messaageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
// const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

async function useData(number) {
  try {
    const fetchedData = await fetchMessages(number);
    if (fetchedData) {
      console.log("Fetched data:", fetchedData);
      fetchedData.reverse();
      $messages.innerHTML = "";
      fetchedData.map(async (msg) => {
        try {
          if (msg.is_event) {
            const html = Mustache.render(messageTemplate, {
              userName: "",
              message: message.text,
              createdAt: "",
            });
            document.querySelector(".message__body").style.fontSize = "12px";
            document.querySelector(".message__body").style.textAlign = "center";
            $messages.insertAdjacentHTML("beforeend", html);
            autoscroll();
          } else {
            const html = Mustache.render(messageTemplate, {
              userName: msg.sender_mail,
              message: msg.message_text,
              createdAt: moment(msg.createdAt).format("h:mm a"),
            });
            $messages.insertAdjacentHTML("beforeend", html);
            autoscroll();
          }
        } catch (error) {
          console.error("Error rendering message:", error);
        }
      });
    } else {
      console.error("Failed to fetch data.");
    }
  } catch (error) {
    console.error("Error handling fetched data:", error);
  }
}

useData(number);

// Options
// const { userName, room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    userName: message.userName,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    userName: message.userName,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", { roomId: number, message });
  $messaageFormInput.value = "";
  // useData(number);
});

socket.on("connect", () => {
  console.log("Connected to server");

  socket.emit("joinRoom", { roomId: number });
  socket.emit("getOnlineUsers", { roomId: number });

  // Example: Sending a message
  const message = "Hello everyone!";
  // socket.emit('sendMessage', { roomId: number, message });
});

socket.on("onlineUsers", ({ roomId, users }) => {
  console.log("getting users", { roomId, users });

  const html = Mustache.render(sidebarTemplate, { roomName, users });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.on("receiveMessage", (message) => {
  // Handle received message, e.g., log it or perform custom actions
  console.log("---------Received message:", message);

  // Broadcast the received message to all clients in the same room
  // const { roomId } = message;
  // io.to(roomId).emit('receiveMessage', message);
  useData(number);
});
