//---------------------------
//Elements' events

/*----------
Button submit click*/
changeNicknameButton.on(`click`, newUsername);

/*----------
Textarea submit with enter ENTER key*/
messageForm.on(`submit`, (x) => submit(x));
sendMessageButton.on(`click`, submit);

/*----------
Scroll to last message*/
newMessageAlert.on(`click`, () => {
	isScrolling = false;
	messagesScrollBottom();
});

/*----------
NON/TYPING event*/
messageInputField.on(`input`, (ev) => {
	let text = messageInputField.val();
	if (text.trim() == ``) {
		socket.emit(`not typing`);
		return;
	}
	socket.emit(`typing`, username);
});
/*----------
Permit newline [ALT+ENTER] in text messages*/
let altDownKey = false;

messageInputField.on(`keydown`, (e) => {
	if (e.altKey) altDownKey = true;

	if (e.code !== `Enter`) return;
	let content = messageInputField.val();
	let pointer_pos = messageInputField.prop(`selectionStart`) || 0;
	content = `${content.substring(0, pointer_pos)}\n${content.substring(pointer_pos, content.length)}`;

	e.preventDefault();
	return altDownKey ? messageInputField.val(content) : submit();
});

messageInputField.on(`keyup`, (e) => {
	altDownKey = false;
	scrollBottom(messageInputField);
});

/*----------
Sidebar toggler*/
sidebarToggler.on(`click`, () => {
	sidebar.toggleClass(`active`);
});

/*----------*/
onlineUsersButton.on(`click`, () => {
	socket.emit(`get online users`);
	onlineUsersList.toggleClass(`show`);
});
//---------------------------
$(document).on(`click`, (event) => {
	var target = event.target;

	/*----------
	Sidebar toggler*/
	if (!sidebar.has(target).length && !sidebarToggler.has(target).length && $(target).attr(`id`) !== sidebar.attr(`id`)) {
		sidebar.removeClass(`active`);
	}

	if (!onlineUsersContainer.has(target).length && !onlineUsersList.has(target).length && !onlineUsersButton.has(target).length) {
		onlineUsersList.removeClass(`show`);
	}
});
//anon function [scroll direction && user scroll detect]
var scroll_direction = ``;
$(() => {
	let _top = $(window).scrollTop();

	messagesContainer.on(`scroll`, () => {
		let padding = parseInt(messagesContainer.css(`padding`), 10) * 2 + 5;
		let height = messagesContainer.height();
		let scrollPosition = messagesContainer.scrollTop();

		let currentScrollPosition = height + scrollPosition + padding;
		let maxScrollHeight = messagesContainer.prop(`scrollHeight`);

		if (currentScrollPosition >= maxScrollHeight && isScrolling) {
			isScrolling = false;
			newMessageAlert.addClass(`d-none`);
		}
		var _cur_top = messagesContainer.scrollTop();
		if (_top < _cur_top) {
			scroll_direction = `down|none`;
		} else {
			scroll_direction = `up`;
			isScrolling = true;
		}

		_top = _cur_top;
	});
});
let vh = window.innerHeight * 0.01;

document.documentElement.style.setProperty(`--vh`, `${vh}px`);
let vw = window.innerWidth * 0.01;
document.documentElement.style.setProperty(`--vw`, `${vw}px`);

window.addEventListener(`resize`, () => {
	let vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty(`--vh`, `${vh}px`);
	let vw = window.innerWidth * 0.01;
	document.documentElement.style.setProperty(`--vw`, `${vw}px`);
});
