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
var typingTimeout;

/*----------
Permit newline [ALT+ENTER] in text messages*/
let altDownKey = false;

//KEYDOWN
messageInputField.on(`keydown`, (e) => {
	clearTimeout(typingTimeout);
	socket.emit(`typing`, username);

	if (e.altKey) altDownKey = true;

	if (e.code !== `Enter`) return;
	let content = messageInputField.val();
	let pointer_pos = messageInputField.prop(`selectionStart`) || 0;
	content = `${content.substring(0, pointer_pos)}\n${content.substring(pointer_pos, content.length)}`;

	e.preventDefault();
	return altDownKey ? messageInputField.val(content) : submit();
});

//KEYUP
messageInputField.on(`keyup`, (e) => {
	typingTimeout = setTimeout(() => {
		socket.emit(`not typing`);
	}, 5000);

	if (messageInputField.val().trim() == ``) {
		clearTimeout(typingTimeout);
		socket.emit(`not typing`);
	}

	altDownKey = false;
	scrollBottom(messageInputField);
});

/*----------
Theme mode toggler*/
themeCheckbox.on(`click`, () => {
	let isChecked = themeCheckbox.is(`:checked`);
	if (isChecked) {
		localStorage.setItem(`themeMode`, `dark`);
		$(body).addClass(`darkTheme`);
	} else {
		localStorage.setItem(`themeMode`, `light`);
		$(body).removeClass(`darkTheme`);
	}
});

/*----------
Sidebar toggler*/
sidebarToggler.on(`click`, () => {
	sidebar.toggleClass(`active`);
});

/*----------
Online users toggler*/
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

	/*----------
	Online users toggler*/
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

/*----------
Change theme if the preference is stored in localStorage [on pageLoad]*/

(() => {
	let cached_theme = localStorage.getItem(`themeMode`);
	if (!cached_theme) {
		localStorage.setItem(`themeMode`, `light`);
		return;
	}

	switch (cached_theme) {
		case `dark`:
			body.addClass(`darkTheme`);
			themeCheckbox.prop(`checked`, true);
			break;
		default:
			body.removeClass(`darkTheme`);
			break;
	}
})();
/*----------
Automatically update the page height and width every time it's resized*/

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
