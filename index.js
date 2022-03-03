const express = require('express');
const path = require('path');

const http = require('http');

const app = express();
const server = http.Server(app);
const s_io = require('socket.io');

const io = s_io(server);

app.use(express.static('./web'));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

const PORT = 8080;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
	console.log(`Running server on http://${HOST}:${PORT}`);
});
io.on(`connection`, (socket) => {
	const address = socket.handshake.address;

	socket.on(`disconnect`, () => {
		console.log(`user disconnected: ${address}`);
	});
	socket.on(`chat message`, (user, msg) => {
		io.emit(`chat message`, user, msg);
	});
	socket.on(`change username`, (old_user, new_user) => {
		io.emit(`change username`, old_user, new_user);
	});
	socket.on(`get ip`, (username) => {
		if (username == 'null' || !username) return;
		console.log(`Connection - ${username}: ${address}`);
	});
	socket.on(`user connected`, (username) => {
		io.emit(`user connected`, username);
	});
	socket.on(`user disconnected`, (username) => {
		io.emit(`user disconnected`, username);
	});

	// io.emit('chat message', { username: `sasha`, msg: `ciao` });
	// io.emit(`change username`, `sasha`, `Sasha`);
});
