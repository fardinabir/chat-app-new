NodeJS Chat Application
============

## Introduction
This is a node.js chat application powered by Kafka, Redis, and WebSocket(Socket.io). This provides robustness in realtime message processing and scalability which is the core requirement for almost every chat application for handling various chat interactions.
<p align="center">
  <a href="https://postimg.cc/XXrjccfC">
    <img src="https://i.postimg.cc/NG4KtdLp/Screenshot-2024-03-03-at-10-03-43-PM-100.png" width="341" height="400" alt="Screenshot">
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
- [Feedback](#feedback)
- [Contributors](#contributors)
- [Build Process](#build-process)
- [Backers](#backers-)
- [Sponsors](#sponsors-)
- [Acknowledgments](#acknowledgments)


---

## Installation
Clone this repo to your desktop and run `docker-compose up` to get the setup ready.

You might want to look into `docker-compose.yml` file to make change the ports you want to use and set up customize cluster.

---

## Usage
After you clone this repo to your desktop, go to its root directory and run `npm install` to install its dependencies.

Once the dependencies are installed, you can run  `npm start` to start the application. You will then be able to access it at localhost:3000

To give yourself administrator permissions on the chat, you will have to type `/role [your-name]` in the app console.

---

## License
>You can check out the full license [here](https://github.com/IgorAntun/node-chat/blob/master/LICENSE)

This project is licensed under the terms of the **MIT** license.
