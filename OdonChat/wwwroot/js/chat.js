"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.addEventListener('DOMContentLoaded', () => {
    var inputs = document.querySelectorAll(".message-input");

    for (let input of inputs) {
        input.addEventListener('keypress', function (event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                event.preventDefault();
                sendMessage(input.parentElement.parentElement);
            }
        });
    }
});

connection.on("ReceiveMessage", (message) => {
    var divMessages = document.querySelector("[id='" + message.chatId + "'] .messages");
    var card = document.querySelector("#card-" + message.chatId);

    if (card == null) {
        card = document.querySelector("#card-" + message.userFromId);
        divMessages = document.querySelector("[id='" + message.userFromId + "'] .messages");

        if (card == null) { 
            createChat(message.userFromId, message.usernameFrom, message.avatar);
            card = document.querySelector("#card-" + message.userFromId);
            divMessages = document.querySelector("[id='" + message.userFromId + "'] .messages");
        }
    }

    card.style.background = "yellow";
    var p = document.createElement("p");
    p.classList.add("message-received");
    p.textContent = message.message;

    divMessages.appendChild(p);

});

connection.on("ReceiveUser", (user) => {
    const searchInput = document.getElementById('searchInput');
    const searchResultsUl = document.getElementById('searchResults'); 
    const inputGroup = searchInput.closest('.input-group'); 
    searchResultsUl.innerHTML = '';

    if (user == null) {
        const li = document.createElement('li');
        const noResultsDiv = document.createElement('div');
        noResultsDiv.classList.add('no-results');
        noResultsDiv.textContent = 'No user found';
        li.appendChild(noResultsDiv);
        searchResultsUl.appendChild(li);
        return;
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.classList.add('dropdown-item');
    a.textContent = user.username;
    a.href = '#'; 
    a.addEventListener('click', (event) => {
        event.preventDefault(); 

        searchResultsUl.classList.remove('show');
        searchInput.focus();

        createChat(user.id, user.username, user.avatar);
        searchResultsUl.innerHTML = '';
        searchInput.value = '';
    });
    li.appendChild(a);
    searchResultsUl.appendChild(li);
    searchResultsUl.classList.add('show'); 
}); //end ReceiveUser

connection.start().then(function () {
    console.log("Connected");
}).catch(function (err) {
    return console.error(err.toString());
});

var input = document.querySelector("#searchInput");
var button = document.querySelector("#searchButton");

input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();
        button.click();
    }
});

button.addEventListener("click", (event) => {
    event.preventDefault();
    connection.invoke("SearchUser", input.value).catch(function (err) {
        return console.error(err.toString());
    });
});


/*const buttonSendMessage = document.querySelectorAll(".send-button");

buttonSendMessage.addEventListener("click", (event) => {
    event.preventDefault();
    const inputChat = document.querySelector(".message-input");
    const userSelected = document.querySelector(".selected .user-name");

    connection.invoke("SendMessage", userSelected.textContent, inputChat.value, new Date().toJSON()).then(() => {
        const divMessages = document.querySelector(".messages");
        const p = document.createElement("p");
        p.classList.add("message-sended");
        p.textContent = inputChat.value;
        divMessages.appendChild(p);
        inputChat.value = "";
    }).catch(function (err) {
        return console.error(err.toString());
    });
});*/

function sendMessage(el) {
    const inputChat = document.querySelector(".show-chat .message-input");
    const userSelected = document.querySelector(".selected .user-name");

    connection.invoke("SendMessage", userSelected.textContent, inputChat.value, new Date().toJSON()).then(() => {
        const divMessages = document.querySelector(".show-chat .messages");
        const p = document.createElement("p");
        p.classList.add("message-sent");
        p.textContent = inputChat.value;
        divMessages.appendChild(p);
        inputChat.value = "";
    }).catch(function (err) {
        return console.error(err.toString());
    });
}
function showChat(el) {
    var id = el.id.substr(5);
    const oldUserSelected = document.querySelector(".sidebar .selected");
    const divToHide = document.querySelector("div.show-chat");
    const divToShow = document.getElementById(id);

    if(divToHide != null)
        divToHide.classList.remove("show-chat");

    if (oldUserSelected != null)
        oldUserSelected.classList.remove("selected");

    el.style.removeProperty("background-color");
    divToShow.classList.add("show-chat");
    el.classList.add("selected");
}

function createChat(userId, username, avatar) {
    const divCard = document.createElement('div');
    const img = document.createElement('img');
    const divInfo = document.createElement('div');
    const spanUsername = document.createElement('span');

    divCard.classList.add('sidebar-user-card');
    divCard.id = "card-" + userId;
    img.classList.add('avatar');
    img.src = "data:image/*;Base64," + avatar;
    img.onerror = "this.src='img/avatar.png'";
    divInfo.classList.add('user-info');
    spanUsername.classList.add('user-name');
    spanUsername.innerHTML = username;
    divInfo.appendChild(spanUsername);
    divCard.appendChild(img);
    divCard.appendChild(divInfo);
    divCard.onclick = () => { showChat(divCard) };

    document.querySelector("aside.sidebar").prepend(divCard);

    //creating chat div
    const divChat = document.createElement("div");
    divChat.classList.add("message-input-container");
    divChat.id = userId;

    const divMessages = document.createElement("div");
    divMessages.classList.add("messages");

    const divInput = document.createElement("div");
    divInput.classList.add("input-chat");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("message-input");
    input.placeholder = "Write a message...";

    const button = document.createElement("button");

    //pressing Enter inside the input to send a message
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            button.click();
        }
    });

    button.classList.add("send-button");
    button.onclick = () => { sendMessage(divChat) };
    button.textContent = "Send";


    divChat.appendChild(divMessages);
    divInput.appendChild(input);
    divInput.appendChild(button);
    divChat.appendChild(divInput);
    const chatArea = document.querySelector(".chat-area");
    chatArea.appendChild(divChat);
}