Turbo Chat
============

## Introduction
A node.js chat application powered by Kafka, Redis, and WebSocket(Socket.io). This provides robustness in realtime message processing and scalability which is the core requirement for almost every chat application for handling various chat interactions.
<p align="center">
  <a href="https://postimg.cc/XXrjccfC">
    <img src="https://i.postimg.cc/NG4KtdLp/Screenshot-2024-03-03-at-10-03-43-PM-100.png" width="271" height="310" alt="Screenshot">
  </a>
</p>


## Features
- User friendly UI for interaction
- User Registration
- User Login/ Authentication
- Room specific chat services
- Private messaging
- Active online users tracking
- Low latency message retrieval using Redis caching
- Scalable message processing with Kafka

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Socket Events](#socket-events)
- [User Interface](#user-interface)
- [Component Design](#component-design)
- [Conclusion](#conclusion)


---

## Installation
Clone this repo or download it to your pc and run `docker-compose up` to get the setup ready.

You might want to look into `docker-compose.yml` and `DockerfileServer` files to make change the ports you want to use and set up a customize cluster.


---

## Usage

### APIs

For accessing recent chat, login, create user and active users, there is 5 APIs provided from the backend.
  
 - http://localhost:3000/api/login
 - http://localhost:3000/api/register
 - http://localhost:3000/api/chat/ - POST, GET
 - http://localhost:3000/api/chat/:id/messages


>The detailed API documentation is available here :  [Postman API doc](https://documenter.getpostman.com/view/25350564/2sA2xb7bUX)


### Socket Events
To ensure prompt retrieval and transmission of messages, socket events are managed to effectively facilitate the communication process.

##### Listener Events :
 - *receiveMessage* - for listening to upcoming messages
 - *onlineUsers* - update come when users enter or leave the room
 - *recentMessages* - when user hits to *getRecentMessages* event to get updated data, he gets recent message data in this event

#### Emmiting Events :
 - *sendMessage* - client/frontend triggers this to send new message
 - *joinRoom* - when new user join a room this event is triggered
 - *getRecentMessages* - to provide recent messages
 - *getOnlineUsers* - to emmit online users update

When a user opened a new socket connection he is treated as online and after closing the tab
or connection break the user is treated as offline. 

>The detailed Socket documentation is available here :  [Chat App Socket Collection](https://www.postman.com/pathaopay/workspace/sockets-for-chat-app/collection/65e171da7003c3c1ddba3634?action=share&creator=25350564)

### User Interface
Once the installation process is done, you can interact with the application through the UI. All the features, events and endpoints are integrated in the front-end UI to get the full fledge functionality of the websocket based interaction.
Explore the intuitive UI by navigating to [localhost:3000](http://localhost:3000) and unlock the full potential of websocket-based interactions.
For a complete interactions follow the steps below:
 - Register a new user
 - Login with the credentials
 - Create new room
 - See available rooms
 - Join a room by clicking the room name
 - Interact with the chatbox
 - Open another tab to join another user

### Configuration
The config file for the app is available at the project's root directory path. The configuration for database, redis, kafka is given for the docker setup. Feel free to customize these settings according to your requirements by editing the config.js file.

---
## Component Design
In this chat application, user interaction commences through a user-friendly UI, initiating requests that traverse the backend server. This server spins both an HTTP/REST server and a WebSocket server, both accessible at port 3000. The REST server seamlessly provides access to various APIs, while the WebSocket server takes charge of real-time messaging functionality.

To enhance the responsiveness of our messaging system, we leverage the combined power of Redis and MySQL databases. When a user generates a message, it undergoes a dynamic journey through our application architecture. Initially, the message is published into Kafka, our event streaming platform. Subsequently, dedicated consumers within our servers capture the message, enabling us to relay it promptly to the intended user through the WebSocket connection.



[![ChatApp.jpg](https://i.postimg.cc/JnHypVjp/ChatApp.jpg)](https://postimg.cc/47ZN30Lc)

To further optimize our messaging service and reduce latency, the message flow is intricately synchronized and reflected within Redis.

The thoughtfully designed mapping and data flow mechanisms within our application serve the crucial purpose of correlating active users with their respective socket IDs. This carefully crafted approach ensures real-time tracking of active users within specific chat rooms through the robust capabilities of Redis.

<p align="center">
  <a href="https://postimg.cc/XXrjccfC">
    <img src="https://i.postimg.cc/qv2jZSxM/Screenshot-2024-03-02-at-8-35-57-PM.png" width="385 height="240" alt="Screenshot">
  </a>
</p>

When pivotal events like `joinRoom` or `disconnect` occur in the WebSocket layer, Redis maintains an up-to-date record of active users. This process ensures dynamic and responsive monitoring of the active user base within chat rooms.

This synergistic integration of diverse components provides a seamless and efficient communication experience for our users.
## Conclusion
In conclusion, this application offers a powerful and scalable solution for real-time messaging. With features like user tracking, low-latency message retrieval, and robust Kafka integration, it stands as a testament to modern chat application requirements.






