var socket = io();
var changeNickButton = $('#changeNickBtn');
changeNickButton.on('click', newUsername);

var username = getUsername();
myName();
titleUpdatepdate();
var messages = document.getElementById('messages');
var form = $('#form');
var input = $('#input');

const submitButton = $(`#btn_send`);
submitButton.on(`click`, submit);
form.on(`submit`, (x) => submit(x));

function submit(e) {
	if (!e) {
		e = input.text();
	}
	e.preventDefault();
	let text = input.val();

	if (text) {
		text = text.substring(0, 255);
		socket.emit('chat message', getUsername(), text);
		input.val(``);
	}
}

socket.on(`change username`, (old_username, new_username) => {
	let msg = setInfoPart(old_username);

	//-------------------------------------
	//CONTENT
	let content = document.createElement('h5');
	content.classList.add(`right`, `information`, `text-info`);
	content.textContent = `Has changed it's username into \`${new_username}\``;
	msg.appendChild(content);
	//-------------------------------------

	messages.appendChild(msg);
	window.scrollTo(0, document.body.scrollHeight);
});

socket.on(`chat message`, (username, message) => {
	let msg = setInfoPart(username, true);

	//-------------------------------------
	//CONTENT
	let content = document.createElement('h5');
	content.classList.add(`right`, `content`);
	content.textContent = message;
	msg.appendChild(content);
	//-------------------------------------

	messages.appendChild(msg);
	window.scrollTo(0, document.body.scrollHeight);
});

socket.emit(`user connected`, username);

socket.on(`user connected`, (username) => {
	let msg = setInfoPart(username);

	//-------------------------------------
	//CONTENT
	let content = document.createElement('h5');
	content.classList.add(`right`, `information`, `text-secondary`);
	content.textContent = `Connected to chat! `;
	msg.appendChild(content);
	//-------------------------------------

	messages.appendChild(msg);
	window.scrollTo(0, document.body.scrollHeight);
});

//--------------------------------
//UTILS
function setInfoPart(nickname, flag) {
	let msg = document.createElement('li');
	msg.classList.add('msg');

	//INFO
	let left = document.createElement('div');
	left.classList.add(`left`);

	let time = document.createElement('h4');
	let user = document.createElement('h4');
	let separator = document.createElement('h4');

	//time
	let date = new Date();

	time.textContent = `${date.getHours().toString().padStart(2, `0`)}:${date.getMinutes().toString().padStart(2, `0`)}`;
	time.classList.add(`time`, `text-secondary`);

	left.appendChild(time);

	//user
	user.textContent = nickname;

	user.classList.add(`user`, `text-danger`);
	left.appendChild(user);

	//separator
	if (flag) {
		separator.textContent = `:`;
		separator.classList.add(`separator`);

		left.appendChild(separator);
	}
	msg.appendChild(left);

	return msg;
}

function getUsername() {
	let user = localStorage.getItem('username');
	if (!user || user == `null`) {
		while (user == 'null' || !user || user.replace(' ', '') == '') {
			user = prompt('Username: ');
			localStorage.setItem('username', user);
		}
	}

	changeNickButton.text(user);
	titleUpdate();
	myName();
	return user;
}

function newUsername() {
	let old = username && username != `null` ? username : null;
	localStorage.removeItem(`username`);
	username = getUsername();
	if (!old) return;
	socket.emit(`change username`, old, username);
}

function titleUpdate() {
	document.title = `ClassyChat - ${username}`;
}
function myName() {
	socket.emit(`get ip`, username);
}
