"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.on("ReceiveUser", (user) => {
    const searchInput = document.getElementById('searchInput');
    const searchResultsUl = document.getElementById('searchResults'); 
    const inputGroup = searchInput.closest('.input-group'); 

    if (user == null) {
        searchResultsUl.innerHTML = '';
        const li = document.createElement('li');
        const noResultsDiv = document.createElement('div');
        noResultsDiv.classList.add('no-results');
        noResultsDiv.textContent = 'Nessun risultato trovato';
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

        const divCard = document.createElement('div');
        const img = document.createElement('div');
        const divInfo = document.createElement('div');
        const spanUsername = document.createElement('span');

        divCard.classList.add('sidebar-user-card');
        img.classList.add('avatar');
        divInfo.classList.add('user-info');
        spanUsername.classList.add('user-name');
        spanUsername.innerHTML = user.username;
        divInfo.appendChild(spanUsername);
        divCard.appendChild(img);
        divCard.appendChild(divInfo);

        document.querySelector("aside.sidebar").prepend(divCard);
        searchResultsUl.innerHTML = '';
        searchInput.value = '';
    });
    li.appendChild(a);
    searchResultsUl.appendChild(li);
    searchResultsUl.classList.add('show'); 
});

connection.start().then(function () {
    console.log("Connected");
}).catch(function (err) {
    return console.error(err.toString());
});

var input = document.querySelector("#searchInput");
var button = document.querySelector("#searchButton");

button.addEventListener("click", (event) => {
    event.preventDefault();
    connection.invoke("SearchUser", input.value).catch(function (err) {
        return console.error(err.toString());
    });
});


