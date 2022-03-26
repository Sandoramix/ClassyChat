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

app.use(`/scss`, express.static(path.join(__dirname, `node_modules/bootstrap/scss/`)));
app.use(`/css`, express.static(path.join(__dirname, `node_modules/bootstrap/dist/css/`)));
app.use(`/js`, express.static(path.join(__dirname, `node_modules/bootstrap/dist/js`)));
app.use(`/js`, express.static(path.join(__dirname, `node_modules/jquery/dist`)));

var onlineUsers = new Map();

setInterval(() => {
	io.emit(`online users`, [...onlineUsers]);
}, 5000);

io.on(`connection`, (st) => {
	const ADDRESS = st.handshake.address;
	const id = st.id;

	var nickname;

	st.on(`disconnect`, (r) => {
		//console.log(`{${ADDRESS} : ${id}}- Disconnected - ${nickname}`);
		if (!nickname) return;
		io.emit(`user disconnected`, nickname);
		// console.log(`reason = ${r}`);
		onlineUsers.delete(id);
	});

	st.on(`new message`, (user, msg) => {
		// console.log(`[${ADDRESS}] new message: `, msg);
		io.emit(`new message`, id, user, msg);
	});

	st.on(`change username`, (old_user, new_user) => {
		console.log(`{${ADDRESS} : ${id}}- New username | ${old_user} -> ${new_user}`);
		io.emit(`change username`, old_user, new_user);

		nickname = new_user;
		onlineUsers.set(id, nickname);
	});

	st.on(`user connected`, (username) => {
		//console.log(`{${ADDRESS} : ${id}}- Connected - ${username}`);
		io.emit(`user connected`, username);

		nickname = username;
		onlineUsers.set(id, nickname);
	});

	st.on(`typing`, (username) => {
		// let hash = getHash(`${id}:${username}`);

		io.emit(`typing`, username, id);
		// console.log(`[${ADDRESS}] Typing - ${hash}`);
	});

	st.on(`not typing`, () => {
		// let hash = getHash(`${id}:${username}`);

		io.emit(`not typing`, id);
		// console.log(`[${ADDRESS}] Not-Typing - ${hash}`);
	});
	st.on(`get online users`, () => {
		st.emit(`online users`, [...onlineUsers]);
	});
});
// const crypto = require(`crypto`);

// function getHash(plaintext) {
// 	var hasher = crypto.createHmac(`sha256`, env.crypto_secret);

// 	return hasher.update(plaintext).digest(`base64`);
// }
