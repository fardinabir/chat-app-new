const leaveBtn = document.querySelector(".leave-btn");
const createBtn = document.querySelector(".create-room");
const seeRoomBtn = document.querySelector(".see-room");
const roomList = document.getElementById('room-list');
const modal = document.getElementById("modal");
const closeBtn = document.querySelector(".close");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");

leaveBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.removeItem("auth-token");
  window.location.href = "login.html";
});

createBtn.addEventListener("click", function () {
  const roomName = document.getElementById("message-input").value;
  console.log("Room Name:", roomName);
  if (roomName === "") {
    console.log("room name is required");
    document.querySelector(
      ".error-text"
    ).innerHTML = `<p>Room name is required!</p>`;
  } else {
    axios
      .post(
        "http://localhost:3000/api/chat",
        {
          name: roomName,
        },
        {
          headers: {
            Authorization: `BEARER ${sessionStorage.getItem("auth-token")}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        alert("New room created");
      })
      .catch((error) => {
        document.querySelector(
          ".error-text"
        ).innerHTML = `<p>${error.response.data.error}</p>`;
      });
    // modal.style.display = "none";
    document.getElementById("message-input").value = "";
  }
});

seeRoomBtn.addEventListener('click', async () => {
    const availableRooms = await axios
    .get(
      "http://localhost:3000/api/chat",
      {
        headers: {
          Authorization: `BEARER ${sessionStorage.getItem("auth-token")}`,
        },
      }
    )
    .then((response) => {
      console.log('rooms',response.data);
      // alert("New room created");
      return response.data;
    })
    .catch((error) => {
      document.querySelector(
        ".available-error-text"
      ).innerHTML = `<p>${error.response.data.error}</p>`;
    });

    availableRooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room.name;
        li.addEventListener('click', () => {
            handleRoomClick(room);
        });
        roomList.appendChild(li);
    });
    
});

const handleRoomClick = async (room) => {
    console.log('Room Clicked');
    // await axios
    // .get(
    //   `http://localhost:3000/api/chat/${room.id}/messages`,
    //   {
    //     headers: {
    //       Authorization: `BEARER ${sessionStorage.getItem("auth-token")}`,
    //     },
    //   }
    // )
    // .then((response) => {
    //   console.log('rooms',response.data);
    //   // alert("New room created");
    //   // return response.data;
    // })
    // .catch((error) => {
    //   // document.querySelector(
    //   //   ".available-error-text"
    //   // ).innerHTML = `<p>${error.response.data.error}</p>`;
    // });
    window.location.href = `chat.html?=${room.id}`
}

//   createBtn.addEventListener("click", (e) => {
//     e.preventDefault();
//     modal.style.display = "block";
//   });

//   closeBtn.addEventListener("click", function() {
//       document.getElementById('roomNameInput').value='';
//       modal.style.display = "none";
//     });

//   cancelBtn.addEventListener("click", function() {
//     document.getElementById('roomNameInput').value='';
//     modal.style.display = "none";
//   });
