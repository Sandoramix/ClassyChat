const env = require('./config/config');

const express = require('express');
const fs = require(`fs`);
const path = require('path');

const app = express();
const socket = require('socket.io');

const http = require(`http`);

const http_server = http.createServer(app).listen(env.HTTP_PORT, env.HOST, () => {
	console.log(`Running server on http://localhost:${env.HTTP_PORT}`);
});

const io = new socket.Server(http_server, { pingTimeout: 180000, pingInterval: 25000 });

app.use(express.static('./client/'));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

io.on(`connection`, (socket) => {
	const ADDRESS = socket.handshake.address;

	var nickname;

	socket.on(`disconnect`, (r) => {
		console.log(`{${ADDRESS} : ${socket.id}}- Disconnected - ${nickname}`);
		if (!nickname) return;
		io.emit(`user disconnected`, nickname);
		// console.log(`reason = ${r}`);
	});

	socket.on(`new message`, (user, msg) => {
		// console.log(`[${ADDRESS}] new message: `, msg);
		io.emit(`new message`, user, msg);
	});

	socket.on(`change username`, (old_user, new_user) => {
		console.log(`{${ADDRESS} : ${socket.id}}- New username | ${old_user} -> ${new_user}`);
		io.emit(`change username`, old_user, new_user);

		nickname = new_user;
	});

	socket.on(`user connected`, (username) => {
		console.log(`{${ADDRESS} : ${socket.id}}- Connected - ${username}`);
		io.emit(`user connected`, username);

		nickname = username;
	});

	socket.on(`typing`, (username) => {
		// let hash = getHash(`${socket.id}:${username}`);

		io.emit(`typing`, username, socket.id);
		// console.log(`[${ADDRESS}] Typing - ${hash}`);
	});

	socket.on(`not typing`, (username) => {
		// let hash = getHash(`${socket.id}:${username}`);

		io.emit(`not typing`, username, socket.id);
		// console.log(`[${ADDRESS}] Not-Typing - ${hash}`);
	});
});
// const crypto = require(`crypto`);

// function getHash(plaintext) {
// 	var hasher = crypto.createHmac(`sha256`, env.crypto_secret);

// 	return hasher.update(plaintext).digest(`base64`);
// }
