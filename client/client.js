//---------------------------
const body = $(`#body`);
const messages = $(`#messages`);
const form = $(`#form`);
const input = $(`#input`);
const changeNickButton = $(`#changeNickBtn`);
const submitButton = $(`#btn_send`);
const typing_users_cnt = $(`#typing-users`);

const new_msg_popup = $(`#new-message`);
var isScrolling = false;

const socket = io();
var username = getUsername();

var typing_users = new Map();
//---------------------------
//Element's events
changeNickButton.on(`click`, newUsername);

form.on(`submit`, (x) => submit(x));
submitButton.on(`click`, submit);

new_msg_popup.on(`click`, () => {
	isScrolling = false;
	scroll_bottom();
});

input.on(`input`, (ev) => {
	let text = input.val();
	if (text.trim() == ``) {
		socket.emit(`not typing`);
		return;
	}
	socket.emit(`typing`, username);
});

//---------------------------

//---------------------------
//Socket.io event listeners
socket.on(`change username`, (old_username, new_username) => {
	let msg = newMessage(``, `SYSTEM`, `${old_username} has changed it's username into '${new_username}'`, true);

	//-------------------------------------
	messages.append(msg);
	scroll_bottom();
});

socket.on(`new message`, (id, username, message) => {
	//-------------------------------------
	messages.append(newMessage(id, username, message));
	scroll_bottom();
});

//user connected
socket.emit(`user connected`, username);
socket.on(`user connected`, (username) => {
	messages.append(newMessage(``, `SYSTEM`, `${username} connected to chat!`, true));
	scroll_bottom();
});

//user disconnected
socket.on(`user disconnected`, (username) => {
	messages.append(newMessage(``, `SYSTEM`, `${username} disconnected from chat!`, true));
});
socket.on(`typing`, (username, id) => {
	if (typing_users.size > 1 || typing_users.has(id)) return;

	let msg = `${username.length > 10 ? `${username.substring(0, 9)}...` : username} sta scrivendo...`;
	let div = $(`<div>`);
	div.text(msg);
	typing_users_cnt.append(div);

	typing_users.set(id, div);
});

socket.on(`not typing`, (id) => {
	if (!typing_users.has(id)) return;
	console.log();
	typing_users.get(id).remove();
	typing_users.delete(id);
});

//--------------------------------
//UTILS

//send message
function submit(e) {
	if (e) {
		//prevent from page redirection
		e.preventDefault();
	}
	text = input.val().toString();
	if (text.trim() == ``) return;
	text = text.substring(0, 255);
	socket.emit(`new message`, username, text);
	input.val(``);
	isScrolling = false;
	scroll_bottom();
	socket.emit(`not typing`, username);
}

//set message info [left] part with or without separator [flag]
function newMessage(id, username, message, system_message) {
	let msg = $(`<li>`, { class: `msg ${system_message ? `log` : ``} ${id === socket.id ? `owner` : ``}` });

	//INFO

	let user = $(`<h4>`, { class: `user` });
	let time = $(`<h5>`, { class: `time` });

	//user
	user.text(username);

	//Content
	let content = $(`<h5>`, { class: `content` });
	content.text(message);

	//time
	let date = new Date();
	time.text(`${date.getHours().toString().padStart(2, `0`)}:${date.getMinutes().toString().padStart(2, `0`)}`);

	msg.append(user);
	if (!system_message) {
		msg.append($(`<hr />`));
	}
	msg.append(content, time);

	return msg;
}

//get username [from localStorage or prompt if missing]
function getUsername(old_username) {
	let user = null;
	while (user == `null` || !user || user.trim() == '' || user.length > 10) {
		let tmp = localStorage.getItem(`username`);
		if (tmp && (tmp != `null` || tmp.trim() != ``)) {
			user = tmp;
			break;
		}
		user = prompt('Username: (max 10 characters) ', username) || old_username;

		console.log(user);

		if (user.length > 10) {
			alert(`Maximum username's characters length = 10`);
		}
	}
	user = user.replace(` `, `_`);

	username = user;
	localStorage.setItem(`username`, user);

	changeNickButton.text(user.length > 10 ? `${user.substring(0, 9)}...` : user);
	titleUpdate(user);

	return user;
}
//change username
function newUsername() {
	let old = username || null;
	localStorage.removeItem(`username`);
	username = getUsername(old);

	if (old == username) return;
	socket.emit(`change username`, old, username);
}

//update page title with username
function titleUpdate(user) {
	document.title = `ClassyChat - ${user}`;
}

//scroll to bottom
function scroll_bottom() {
	if (isScrolling) {
		newMessagePopup();
		return;
	}
	new_msg_popup.addClass(`d-none`);
	messages.scrollTop(messages.prop(`scrollHeight`));
}

// new message popup if user is scrolling
function newMessagePopup() {
	if (!isScrolling) return;
	new_msg_popup.removeClass(`d-none`);
}

//anon function [scroll direction && user scroll detect]
$(() => {
	var _top = $(window).scrollTop();
	var _direction;

	messages.on(`scroll`, () => {
		if (messages.scrollTop() + messages.height() >= messages.prop(`scrollHeight`)) {
			isScrolling = false;
			new_msg_popup.addClass(`d-none`);
		}
		var _cur_top = messages.scrollTop();
		if (_top < _cur_top) {
			_direction = 'down';
		} else {
			_direction = 'up';
			isScrolling = true;
		}
		_top = _cur_top;
	});
});
