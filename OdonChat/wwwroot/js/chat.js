"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol()).build();

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

//receive a message from an user
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

    const divMsg = document.createElement("div");
    divMsg.classList.add("message");
    divMsg.classList.add("message-received");

    if (message.imgbase64 != null) { //if the message contain an image
        const img = document.createElement("img");
        img.src = "data:image/*;base64," + message.imgbase64;
        img.classList.add("img-chat");
        divMsg.appendChild(img);
    }

    if (message.message != null && message.message != "") {
        if (imgByte != null) { //adding separator between image and text
            const hr = document.createElement("hr");
            hr.classList.add("separator");
            divMsg.appendChild(hr);
        }
        const span = document.createElement("span");
        span.textContent = message.message;
        span.classList.add("text-message");
        divMsg.appendChild(span);
    }

    divMessages.appendChild(divMsg);
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
    const span = document.createElement('span');
    const img = document.createElement('img');
    span.classList.add("user-result");
    li.classList.add('dropdown-item');
    img.classList.add('avatar');
    img.src = "data:image/*;Base64," + user.avatar;
    img.onerror = "this.src='img/avatar.png'";
    li.appendChild(img);
    span.textContent = user.username;
    li.addEventListener('click', (event) => {
        event.preventDefault(); 

        searchResultsUl.classList.remove('show');
        searchInput.focus();

        createChat(user.id, user.username, user.avatar);
        searchResultsUl.innerHTML = '';
        searchInput.value = '';
    });
    li.appendChild(span);
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

//when a user send a message to other user
async function sendMessage(el) {
    const inputChat = document.querySelector(".show-chat .message-input");
    const userSelected = document.querySelector(".selected .user-name");

    const inputImg = document.querySelector('#file-upload');
    const img = inputImg.files[0]; 

    //Encoding img to Base64
    var imgByte = (img != null) ? await img.arrayBuffer() : null;
    var imgBase64 = base64ArrayBuffer(imgByte);

    connection.invoke("SendMessage", userSelected.textContent, inputChat.value, new Uint8Array(imgByte), new Date().toJSON()).then(() => {
        const divMessages = document.querySelector(".show-chat .messages");
        const divMsg = document.createElement("div");
        divMsg.classList.add("message");
        divMsg.classList.add("message-sent");

        if (imgByte != null) { //if the message contain an image
            const img = document.createElement("img");
            img.src = "data:image/*;base64," + imgBase64;
            img.classList.add("img-chat");
            divMsg.appendChild(img);
        }

        if (inputChat.value != null && inputChat.value != "") {
            if (imgByte != null) { //adding separator between image and text
                const hr = document.createElement("hr");
                hr.classList.add("separator");
                divMsg.appendChild(hr);
            }
            const span = document.createElement("span");
            span.textContent = inputChat.value;
            span.classList.add("text-message");
            divMsg.appendChild(span);
        }

        divMessages.appendChild(divMsg);
        inputChat.value = "";
        inputImg.value = "";
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

    //creating user card on the left bar
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

    //creating div popup for preview image
    const popup = document.createElement("div");
    popup.classList.add("popup");
    const p = document.createElement("p");
    const span = document.createElement("span");
    span.textContent = "Preview image"
    p.appendChild(span);
    const i = document.createElement("i");
    i.classList.add("fa-regular");
    i.classList.add("fa-x");
    i.onclick = () => { hidePopupImg() };
    p.appendChild(i);
    popup.appendChild(p);
    const hr = document.createElement("hr");
    hr.classList.add("separator");
    popup.appendChild(hr);
    const imgPreview = document.createElement("img");
    imgPreview.classList.add("img-preview");
    popup.appendChild(imgPreview);
    divInput.appendChild(popup);

    //creating input type file
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = "image/*";
    inputFile.onchange = showPopupImg(inputFile);
    inputFile.id = "file-upload";
    divInput.appendChild(inputFile);
    const label = document.createElement("label");
    label.htmlFor = "file-upload";
    label.classList.add("upload-button", "fa-solid", "fa-paperclip");
    divInput.appendChild(label);

    divChat.appendChild(divMessages);
    divInput.appendChild(input);
    divInput.appendChild(button);
    divChat.appendChild(divInput);
    const chatArea = document.querySelector(".chat-area");
    chatArea.appendChild(divChat);
}


//From here: https://gist.github.com/jonleighton/958841
/*function base64ArrayBuffer(arrayBuffer) {
    if (arrayBuffer == null)
        return null;

    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}*/

function showPopupImg(inputFile) {
    const divPopup = document.querySelector("div.show-chat .popup");
    const imgPreview = document.querySelector("div.show-chat .img-preview");

    if (inputFile.files.length > 0) {
        imgPreview.src = URL.createObjectURL(inputFile.files[0]);
        divPopup.style.display = 'block';
    }

}

function hidePopupImg() {
    const divPopup = document.querySelector("div.show-chat .popup");
    const imgPreview = document.querySelector("div.show-chat .img-preview");
    imgPreview.src = "";
    divPopup.style.display = 'none';



}