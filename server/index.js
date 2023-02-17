const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();

// basic http auth
// app.use((req, res, next) => {

//     // -----------------------------------------------------------------------
//     // authentication middleware

//     // TODO store user/pass in env vars (process.env)
//     const auth = { login: 'express', password: 'webpack' } // change this

//     // parse login and password from headers
//     const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
//     const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

//     // Verify login and password are set and correct
//     if (login && password && login === auth.login && password === auth.password) {
//         // Access granted...
//         return next()
//     }

//     // Access denied...
//     res.set('WWW-Authenticate', 'Basic realm="401"') // change this
//     res.status(401).send('Authentication required.') // custom message

//     // -----------------------------------------------------------------------

// });

// Have Node serve the files for our Webpacked app
app.use(express.static(path.resolve(__dirname, '../client/dist')));

app.get('/page1', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'page1.html'));
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

// Socketing
const server = app.listen(PORT, () => {
    console.log('Server w/ socket listening on port ' + PORT);
});
const io = socketIO(server);
io.on('connection', (socket) => {

    // Handshake
    console.log('An user connected');
    socket.emit('Hello from server');
    socket.on('Hello from client', (...payload) => {
        console.log('Client said hi');
    });

    // Listen for client data
    socket.on('clientData', (...payload) => {
        socket.emit('serverData', classifications);
    })
});