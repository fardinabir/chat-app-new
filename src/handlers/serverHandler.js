// server_handler.js
const http = require('http');
const sequelize = require('../database/connection'); // Import Sequelize connection

async function startServer(PORT, server) {
    await sequelize.sync({ force: false }).then(() => {
        console.log('Sequelize models synchronized with the database');
        server.listen(PORT, () => {
            console.log('######################################################################');
            console.log(`####          Server is running on http://localhost:${PORT}          ####`);
            console.log('######################################################################');
        });
        return server; // Return the server object for graceful shutdown
    }).catch((error) => {
        console.error('Error synchronizing Sequelize models:', error.message);
        return
    });
   }

async function handleShutdown(server) {
    process.on('SIGINT', () => {
        console.log('Received SIGINT signal (Ctrl+C)');
        sequelize.close()
            .then(() => {
                console.log('Closed Sequelize connection');
                server.close(() => {
                    console.log('Server is shutting down gracefully');
                    process.exit(0);
                });
            })
            .catch((err) => {
                console.error('Error closing Sequelize connection:', err);
                server.close(() => {
                    console.error('Server is shutting down abruptly');
                    process.exit(1);
                });
            });
    });
}

module.exports = {
    startServer,
    handleShutdown,
};