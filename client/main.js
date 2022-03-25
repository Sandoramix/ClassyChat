//---------------------------

/*----------
DECLARATIONS*/
const body = $(`#body`);
const messagesContainer = $(`#messagesContainer`);
const messageForm = $(`#form`);
const messageInputField = $(`#messageInputField`);
const _messageInputField = document.getElementById(`messageInputField`);

const changeNicknameButton = $(`#changeNickButton`);
const sendMessageButton = $(`#sendMessageButton`);
const typingUsersContainer = $(`#typingUsersContainer`);

const newMessageAlert = $(`#new-message`);
var isScrolling = false;

/*----------*/
const sidebar = $(`#sidebar`);
const sidebarToggler = $(`#sidebarToggler`);
const sidebarPanel = $(`#sidebarPanel`);

/*----------*/
const onlineUsersContainer = $(`#onlineUsersContainer`);
const onlineUsersButton = $(`#onlineUsersButton`);
const onlineUsersList = $(`#onlineUsers`);
/*----------*/

const themeCheckbox = $(`#themeSwitch`);

/*----------*/

/*----------*/

const socket = io();
var username = getUsername();

var typingUsersList = new Map();

//---------------------------
//Socket.io event listeners
socket.on(`change username`, (old_username, new_username) => {
	let msg = newMessage(``, `SYSTEM`, `${old_username} has changed it's username into '${new_username}'`, true);

	messagesContainer.append(msg);
	messagesScrollBottom();
});

socket.on(`new message`, (id, username, message) => {
	messagesContainer.append(newMessage(id, username, message));
	messagesScrollBottom();
});

//user connected
socket.emit(`user connected`, username);
socket.on(`user connected`, (username) => {
	messagesContainer.append(newMessage(``, `SYSTEM`, `${username} connected to chat!`, true));
	messagesScrollBottom();
});

//user disconnected
socket.on(`user disconnected`, (username) => {
	messagesContainer.append(newMessage(``, `SYSTEM`, `${username} disconnected from chat!`, true));
});
socket.on(`typing`, (username, id) => {
	if (typingUsersList.size > 1 || typingUsersList.has(id)) return;

	let msg = `${username.length > 10 ? `${username.substring(0, 9)}...` : username} sta scrivendo...`;
	let div = $(`<div>`);
	div.text(msg);
	typingUsersContainer.append(div);

	typingUsersList.set(id, div);
});

socket.on(`not typing`, (id) => {
	if (!typingUsersList.has(id)) return;

	typingUsersList.get(id).remove();
	typingUsersList.delete(id);
});

socket.on(`online users`, (onlineUsers) => {
	onlineUsers.forEach((user) => {
		let id = user[0];
		let username = user[1];

		if (!onlineUsersList.has($(`#${id}`)).length) {
			onlineUsersList.append($(`<li>`, { id }).text(username));
			return;
		}
		$(`#${id}`).text(username);
	});

	let ids = $.map(onlineUsers, ([el]) => {
		return el;
	});

	onlineUsersList.children(`li`).each(function () {
		if (!ids.includes($(this).attr(`id`))) {
			$(this).remove();
		}
	});
});
//--------------------------------

/*----------
MAIN FUNCTIONS*/

//send message
function submit(event) {
	if (event) {
		//prevent from page redirection
		event.preventDefault();
	}

	let text = messageInputField.val().toString();
	if (text.trim() == ``) return;
	text = text.substring(0, 255);

	while (text.includes(`\n\n\n`)) {
		text = text.replace(`\n\n`, `\n`);
	}

	socket.emit(`new message`, username, text);
	messageInputField.val(``);

	isScrolling = false;
	messagesScrollBottom();
	socket.emit(`not typing`, username);
}

//set message info [left] part with or without separator [flag]
function newMessage(id, username, message, system_message) {
	let msg = $(`<li>`, { class: `msg ${system_message ? `log` : ``} ${id === socket.id ? `owner` : ``}` });

	//INFO

	let user = $(`<h4>`, { class: `user` });
	let time = $(`<h6>`, { class: `time` });

	//user
	user.text(username);

	//time
	let date = new Date();
	time.text(`${date.getHours().toString().padStart(2, `0`)}:${date.getMinutes().toString().padStart(2, `0`)}`);

	//msg header
	let msg_header = $(`<div>`, { class: `msg-header` });
	msg_header.append(user, time);

	//msg content
	let content = $(`<h5>`, { class: `content` });
	content.text(message);

	msg.append(msg_header, $(`<hr />`), content);

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

		if (user.length > 10) {
			alert(`Maximum username's characters length = 10`);
		}
	}
	user = user.replace(` `, `_`);

	username = user;
	localStorage.setItem(`username`, user);

	changeNicknameButton.text(user.length > 10 ? `${user.substring(0, 9)}...` : user);
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

/*----------
UTILS FUNCTIONS*/

//update page title with username
function titleUpdate(user) {
	document.title = `ClassyChat - ${user}`;
}

//scroll to bottom
function messagesScrollBottom() {
	if (isScrolling) {
		newMessagePopup();
		return;
	}
	newMessageAlert.addClass(`d-none`);
	scrollBottom(messagesContainer);
}

function scrollBottom(element) {
	element.scrollTop(element.prop(`scrollHeight`));
}
// new message popup if user is scrolling
function newMessagePopup() {
	if (!isScrolling) return;
	newMessageAlert.removeClass(`d-none`);
}
