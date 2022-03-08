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
		socket.emit(`not typing`, username);
		return;
	}
	socket.emit(`typing`, username);
});

//---------------------------

//---------------------------
//Socket.io event listeners
socket.on(`change username`, (old_username, new_username) => {
	let msg = setInfoPart(old_username);

	//-------------------------------------
	//CONTENT
	let content = $(`<h6>`);
	content.addClass(`right information text-info`);
	content.text(`Has changed it's username into \`${new_username}\``);
	msg.append(content);
	//-------------------------------------
	messages.append(msg);
	scroll_bottom();
});

socket.on(`new message`, (username, message) => {
	let msg = setInfoPart(username, true);

	//-------------------------------------
	//CONTENT
	let content = $(`<h5>`);
	content.addClass(`right content`);
	content.text(message);
	msg.append(content);
	//-------------------------------------

	messages.append(msg);
	scroll_bottom();
});

//user connected
socket.emit(`user connected`, username);
socket.on(`user connected`, (username) => {
	conn_disc_part(username, true);
});

//user disconnected
socket.on(`user disconnected`, (username) => {
	conn_disc_part(username, false);
});
socket.on(`typing`, (user, id) => {
	if (typing_users.size > 1 || typing_users.has(id)) return;

	let msg = `${user.length > 10 ? `${user.substring(0, 9)}...` : user} sta scrivendo...`;
	let div = $(`<div>`);
	div.text(msg);
	typing_users_cnt.append(div);

	typing_users.set(id, div);
});

socket.on(`not typing`, (user, id) => {
	if (!typing_users.has(id)) return;
	console.log();
	typing_users.get(id).remove();
	typing_users.delete(id);
});

//--------------------------------
//UTILS
//send message if user disconnected/connected
function conn_disc_part(user, flag) {
	let msg = setInfoPart(user);
	//-------------------------------------
	//CONTENT
	let content = $(`<h5>`);
	content.addClass(`right information text-secondary`);
	content.text(flag ? `Connected to chat! ` : `Disconnected from chat!`);
	msg.append(content);
	//-------------------------------------

	messages.append(msg);
	scroll_bottom();
}

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
function setInfoPart(nickname, flag) {
	let msg = $(`<li>`);
	msg.addClass(`msg`);

	//INFO
	let left = $(`<div>`);
	left.addClass(`left`);

	let time = $(`<h4>`);
	let user = $(`<h4>`);
	let separator = $(`<h4>`);

	//time
	let date = new Date();

	time.text(`${date.getHours().toString().padStart(2, `0`)}:${date.getMinutes().toString().padStart(2, `0`)}`);
	time.addClass(`time text-secondary`);

	left.append(time);

	//user
	user.text(nickname);

	user.addClass(`user text-danger`);
	left.append(user);

	//separator
	if (flag) {
		separator.text(`:`);
		separator.addClass(`separator`);

		left.append(separator);
	}
	msg.append(left);

	return msg;
}

//get username [from localStorage or prompt if missing]
function getUsername() {
	let user = null;
	while (user == `null` || !user || user.trim() == '') {
		let tmp = localStorage.getItem(`username`);
		if (tmp && (tmp != `null` || tmp.trim() != ``)) {
			user = tmp;
			break;
		}
		user = prompt('Username: ', username);
	}
	user = user.replace(` `, `_`);
	setUsername(user);

	changeNickButton.text(user.length > 10 ? `${user.substring(0, 9)}...` : user);
	titleUpdate(user);

	return user;
}
function setUsername(user) {
	username = user;
	localStorage.setItem(`username`, user);
}
//change username
function newUsername() {
	let old = username || null;
	localStorage.removeItem(`username`);
	username = getUsername();

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
	$(`html`).scrollTop(messages.height());
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

	$(window).on(`scroll`, () => {
		if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
			isScrolling = false;
			new_msg_popup.addClass(`d-none`);
		}
		var _cur_top = $(window).scrollTop();
		if (_top < _cur_top) {
			_direction = 'down';
		} else {
			_direction = 'up';
			isScrolling = true;
		}
		_top = _cur_top;
	});
});
