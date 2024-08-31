const sendBtn = document.getElementById("sendBtn");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatMessagesDiv = document.getElementById('chatMessages');
const logoutBtn = document.getElementById("logoutBtn");
const normalChatBtn = document.getElementById("normalChatBtn");
const inviteBtn = document.getElementById("inviteBtn");

let currentGroupId = null;

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
            message: messageInput.value,
            groupId: currentGroupId
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


document.addEventListener('DOMContentLoaded', (event) => {
    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);

    const welcomeMsg = document.getElementById("welcomeMsg");
    welcomeMsg.textContent = `Welcome ${decodedToken.name}`;

    const cachedMessages = loadMessagesFromLocalStorage();
    if (cachedMessages && cachedMessages.length > 0) {
        displayMessages(cachedMessages);
    }

    fetchGroups();

    // setInterval(() => {
    fetchNewMessages(token);
    // }, 1000);

    NormalChatBtn_InviteBtn_State();

});


function displayMessages(messages) {
    const token = localStorage.getItem('token');
    const decodedToken = jwt_decode(token);

    messages.forEach((message) => {
        const li = document.createElement('li');

        const isCurrentUser = message.userId === decodedToken.id;  //check if the message is from current user

        li.innerHTML = `<strong>${isCurrentUser ? 'You' : (message.userName || 'Unknown user')}:</strong> ${message.message}`;
        chatMessagesDiv.appendChild(li);
    });
}


function saveMessagesToLocalStorage(messages) {
    const key = currentGroupId ? `groupMessages_${currentGroupId}` : 'normalMessages';
    try {
        const existingMessages = JSON.parse(localStorage.getItem(key)) || [];
        const updatedMessages = [...existingMessages, ...messages];
        localStorage.setItem(key, JSON.stringify(updatedMessages));

    } catch (error) {
        console.log(error);
        const maxMessages = 100;
        const limitedMessages = updatedMessages.slice(-maxMessages);
        localStorage.setItem(key, JSON.stringify(limitedMessages));
    }
}


function loadMessagesFromLocalStorage() {
    const key = currentGroupId ? `groupMessages_${currentGroupId}` : 'normalMessages';
    return JSON.parse(localStorage.getItem(key)) || [];
}


async function fetchNewMessages(token) {
    const existingMessages = loadMessagesFromLocalStorage();
    const lastMessageId = existingMessages.length ? existingMessages[existingMessages.length - 1].id : null;

    try {
        let url = '/message/getMessages';
        if (currentGroupId) {
            url = `/message/getGroupMessages/${currentGroupId}`
        }
        url += `?lastMessageId=${lastMessageId}`;

        const result = await axios.get(url, { headers: { 'Authorization': token } });

        const newMessages = result.data.savedMessages;

        if (newMessages.length > 0) {
            saveMessagesToLocalStorage(newMessages);
            displayMessages(newMessages);
        }

    } catch (error) {
        console.log(error);

    }

}



// <- groups ->
const createGroupBtn = document.getElementById('createGroupBtn');
const groupList = document.getElementById('groupList');


createGroupBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const groupName = prompt("Enter Group name: ");
    if (groupName) {
        try {
            const token = localStorage.getItem('token');
            const result = await axios.post('/group/createGroup', { name: groupName }, { headers: { 'Authorization': token } });
            if (result.data.success) {
                alert("Group created successfully");
                fetchGroups();
            }

        } catch (error) {
            console.log(error);
            alert("Error creating group, failed!!")

        }
    } else {
        alert("Please enter a valid group name");
    }
});


async function fetchGroups() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/groups/list', { headers: { 'Authorization': token } });
        if (response.data.success) {
            displayGroups(response.data.groups);
        }

    } catch (error) {
        console.log(error);
        alert("Failed to fetch groups!!");
    }
}


function displayGroups(groups) {
    groupList.innerHTML = '';
    groups.forEach(group => {
        const div = document.createElement('div');
        div.textContent = group.name;
        div.classList.add('group-item'); // Added class for styling
        div.id = "groupListId";
        div.addEventListener('click', () => switchGroups(group.id, group.name));
        groupList.appendChild(div);
    });
}


function switchGroups(groupId, groupName) {
    currentGroupId = groupId;
    chatMessagesDiv.innerHTML = '';
    const welcomeMsg = document.getElementById("welcomeMsg");
    welcomeMsg.textContent = groupName;
    localStorage.removeItem(`groupMessages_${groupId}`);
    fetchNewMessages(localStorage.getItem('token'));
    NormalChatBtn_InviteBtn_State();
}


function switchToNormalChat() {
    currentGroupId = null;
    chatMessagesDiv.innerHTML = '';
    const welcomeMsg = document.getElementById("welcomeMsg");
    const decodedToken = jwt_decode(localStorage.getItem('token'));
    welcomeMsg.textContent = `Welcome ${decodedToken.name}`;
    localStorage.removeItem('normalMessages'); // Clear stored messages when switching to normal chat
    fetchNewMessages(localStorage.getItem('token'));
    NormalChatBtn_InviteBtn_State();
}


function NormalChatBtn_InviteBtn_State() {
    if (currentGroupId) {
        normalChatBtn.style.display = 'block';
        inviteBtn.style.display = 'block';
    } else {
        normalChatBtn.style.display = 'none';
        inviteBtn.style.display = 'none';
    }
}

normalChatBtn.addEventListener('click', switchToNormalChat);

inviteBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const userEmail = prompt("Enter the email of the user you want to invite: ");

    if (userEmail) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/group/inviteToGroup/${currentGroupId}`, { email: userEmail }, { headers: { 'Authorization': token } });

            if (response.data.success) {
                alert("User invited successfully");

            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert(error.response.data.message);

                } else if (error.response.status === 404) {
                    alert(error.response.data.message);

                } else {
                    alert("Error occurred while inviting user");
                }
            } else {
                alert("Error inviting user, failed !!");
                console.log(error);
            }
        }

    } else {
        alert("email field can't be empty");
    }
});


// async function fetchGroupMessages(groupId) {
//     try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`/message/getGroupMessages/${groupId}`, { headers: { 'Authorization': token } });
//         if (response.data.success) {
//             displayMessages(response.data.savedMessages);
//         }

//     } catch (error) {
//         console.log(error);
//         alert("Unable to fetch group messages");
//     }
// }