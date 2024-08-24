const sendBtn = document.getElementById("sendBtn");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatMessagesDiv = document.getElementById('chatMessages');
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'homePage.html';
});


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
            displayMessages(response);
        }

    } catch (error) {
        console.log(error);
    }
});


function displayMessages(response) {
    const li = document.createElement('li');
    li.innerHTML = `${response.data.name}: ${response.data.savedMessages.message}`;
    chatMessagesDiv.appendChild(li);
}


document.addEventListener('DOMContentLoaded', (event) => {
    const token = localStorage.getItem('token');
    axios.get('/message/getMessages', { headers: { 'Authorization': token } })
        .then((result) => {
            const userName = result.data.name;
            result.data.savedMessages.forEach((message) => {
                const li = document.createElement('li');
                li.innerHTML = `${userName}: ${message.message}`;
                chatMessagesDiv.appendChild(li);
            })

        }).catch((err) => {
            alert(err);
        });
});