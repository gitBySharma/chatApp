const sendBtn = document.getElementById("sendBtn");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatMessagesDiv = document.getElementById('chatMessages');
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('chatMessages');
    window.location.href = 'homePage.html';
});

//function to clear LS if tab is closed
window.onbeforeunload = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('chatMessages');
}

messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const message = {
            message: messageInput.value
        }

        const response = await axios.post('/message/sendMessage', message, { headers: { Authorization: token } });

        if (response.data.success) {
            messageInput.value = '';
            displayMessages([response.data.savedMessages]);  //display new messages
            saveMessagesToLocalStorage([response.data.savedMessages]);  //save messages to localStorage
        }

    } catch (error) {
        console.log(error);
        alert("Failed to send message");
    }
});


// function displayMessages(response) {
//     const li = document.createElement('li');
//     li.innerHTML = `<strong>${response.data.name}:</strong> ${response.data.savedMessages.message}`;
//     chatMessagesDiv.appendChild(li);
// }


document.addEventListener('DOMContentLoaded', (event) => {
    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);

    const welcomeMsg = document.getElementById("welcomeMsg");
    welcomeMsg.textContent = `Welcome ${decodedToken.name}`;

    const cachedMessages = loadMessagesFromLocalStorage();
    if (cachedMessages && cachedMessages.length > 0) {
        displayMessages(cachedMessages);
    }

    setInterval(() => {
        fetchNewMessages(token);
        // axios.get('/message/getMessages', { headers: { 'Authorization': token } })
        //     .then((result) => {
        //         chatMessagesDiv.innerHTML = '';

        //         result.data.savedMessages.forEach((message) => {
        //             const li = document.createElement('li');
        //             li.innerHTML = `<strong>${message.userName}:</strong> ${message.message}`;
        //             chatMessagesDiv.appendChild(li);
        //         })

        //     }).catch((err) => {
        //         console.log(err);
        //     });
    }, 1000);

});


function displayMessages(messages) {
    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);
    messages.forEach((message) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${message.userName || decodedToken.name}:</strong> ${message.message}`;
        chatMessagesDiv.appendChild(li);
    });
}


function saveMessagesToLocalStorage(messages) {
    try {
        const existingMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        const updatedMessages = [...existingMessages, ...messages];
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

    } catch (error) {
        console.log(error);
        const maxMessages = 100;
        const limitedMessages = updatedMessages.slice(-maxMessages);
        localStorage.setItem('chatMessages', JSON.stringify(limitedMessages));
    }
}


function loadMessagesFromLocalStorage() {
    return JSON.parse(localStorage.getItem('chatMessages')) || [];
}


async function fetchNewMessages(token) {
    const existingMessages = loadMessagesFromLocalStorage();
    const lastMessageId = existingMessages.length ? existingMessages[existingMessages.length - 1].id : null;

    try {
        const result = await axios.get(`/message/getMessages?lastMessageId=${lastMessageId}`, { headers: { 'Authorization': token } });

        const newMessages = result.data.savedMessages;

        if (newMessages.length > 0) {
            saveMessagesToLocalStorage(newMessages);
            displayMessages(newMessages);
        }

    } catch (error) {
        console.log(error);

    }

}