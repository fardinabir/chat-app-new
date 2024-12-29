const socket = io({
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
      `/api/chat/${number}/messages`,
      {
        headers: {
          Authorization: `BEARER ${sessionStorage.getItem("auth-token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("errors", error);
    return null;
  }
};

const $messageForm = document.querySelector("#messageForm");
const $messaageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

async function loadData(number) {
  try {
    const fetchedData = await fetchMessages(number);
    if (fetchedData) {
      console.log("Fetched data:", fetchedData);
      $messages.innerHTML = '';
      fetchedData.reverse();
      $messages.innerHTML = "";
      fetchedData.map(async (msg) => {
        try {
          if (msg.is_event) {
          const htmlNew = Mustache.render(messageTemplate, {
            userName: "",
            message: msg.message_text,
            createdAt: "",
          });
          
          // Create a temporary element to apply styles
          const tempElement = document.createElement('div');
          tempElement.innerHTML = htmlNew;
          
          // Change the style of the desired element
          const messageBodyElement = tempElement.querySelector('.message__body');
          messageBodyElement.style.fontSize = '16px';
          messageBodyElement.style.textAlign = 'center';
          messageBodyElement.style.color = 'grey';
          
          // Insert the modified HTML into the messages container
          $messages.insertAdjacentHTML('beforeend', tempElement.innerHTML);
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

loadData(number)

// TODO: when user re-enters the chat, chat got cleared, a BE call should be done, when first time/ message div is empty list
async function appendNewMsg(msg) {
  console.log("Injecting new message at the end: ", msg)
  try {
    if (msg.isEvent) {
    const htmlNew = Mustache.render(messageTemplate, {
      userName: "",
      message: msg.messageText,
      createdAt: "",
    });
    
    // Create a temporary element to apply styles
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlNew;
    
    // Change the style of the desired element
    const messageBodyElement = tempElement.querySelector('.message__body');
    messageBodyElement.style.fontSize = '16px';
    messageBodyElement.style.textAlign = 'center';
    messageBodyElement.style.color = 'grey';
    
    // Insert the modified HTML into the messages container
    $messages.insertAdjacentHTML('beforeend', tempElement.innerHTML);
    autoscroll();
    } else {
      const html = Mustache.render(messageTemplate, {
        userName: msg.userMail,
        message: msg.messageText,
        createdAt: moment().format("h:mm a"),
      });
      $messages.insertAdjacentHTML("beforeend", html);
      autoscroll();
    }
  } catch (error) {
    console.error("Error rendering message:", error);
  }
}

// todo: fix the case when scroller is in some previous chats, autoscroller doesn't work automatically
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

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("------submitting-------")
  // $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", { roomName, message });
  $messaageFormInput.value = "";
  // useData(number);
});

socket.on("connect", () => {
  console.log("Connected to server....");

  // triggers joinRoom handler, that sets chatRoom and active status
  socket.emit("joinRoom", { roomName });
});

socket.on("onlineUsers", ({ roomName, users }) => {
  console.log("rendering online users.....", { roomName, users });

  const html = Mustache.render(sidebarTemplate, { roomName, users });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.on('receiveMessage', (message) => {
  // Handle received message, e.g., log it or perform custom actions
  console.log('---------Received message:', message);

  // TODO: use this message to show up in the inboxes

  // Broadcast the received message to all clients in the same room
  appendNewMsg(message);
});


