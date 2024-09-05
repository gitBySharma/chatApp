const sendBtn = document.getElementById("sendBtn");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatMessagesDiv = document.getElementById('chatMessages');
const dropdownMenuButton = document.getElementById("dropdownMenuButton");
const logoutBtn = document.getElementById("logoutBtn");
const normalChatBtn = document.getElementById("normalChatBtn");
const inviteBtn = document.getElementById("inviteBtn");
const promoteBtn = document.getElementById("promoteBtn");
const demoteBtn = document.getElementById("demoteBtn");
const removeUserBtn = document.getElementById("removeUserBtn");
const leaveGroupBtn = document.getElementById("leaveGroupBtn");
const deleteGroupBtn = document.getElementById("deleteGroupBtn");
const createGroupBtn = document.getElementById('createGroupBtn');
const groupList = document.getElementById('groupList');
const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");


let currentGroupId = null;
let fetchNewMessagesInterval;


logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('normalMessages');
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

    fetchNewMessagesInterval = setInterval(() => {
        fetchNewMessages(token);
    }, 1000);

    dropdownMenuButton_State();


    //multimedia sharing features -->
    attachBtn.addEventListener('click', (event) => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const token = localStorage.getItem('token');

        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post('/file/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': token }
                });

                if (response.data.success) {
                    messageInput.value = response.data.fileUrl;
                }

            } catch (error) {
                console.log("File upload error", error)
            }
        }
    });

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


// attachBtn.addEventListener('click', (event) => {
//     // event.preventDefault();
//     fileInput.click();
// });


// fileInput.addEventListener('click', async (event) => {
//     // event.preventDefault();
//     const file = event.target.files[0];
//     const token = localStorage.getItem('token');

//     if (file) {
//         try {
//             const formData = new FormData();
//             formData.append('file', file);

//             const response = await axios.post('/file/upload', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data', 'Authorization': token }
//             });

//             if (response.data.success) {
//                 messageInput.value = response.data.fileUrl;
//             }

//         } catch (error) {
//             console.log("File upload error", error)
//         }
//     }
// });



// <- groups ->

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
    dropdownMenuButton_State();
}


function switchToNormalChat() {
    currentGroupId = null;

    chatMessagesDiv.innerHTML = '';
    const welcomeMsg = document.getElementById("welcomeMsg");
    const decodedToken = jwt_decode(localStorage.getItem('token'));
    welcomeMsg.textContent = `Welcome ${decodedToken.name}`;

    localStorage.removeItem('normalMessages'); // Clear stored messages when switching to normal chat

    fetchNewMessages(localStorage.getItem('token'));
    dropdownMenuButton_State();
}


function dropdownMenuButton_State() {
    if (currentGroupId) {
        dropdownMenuButton.style.display = 'block';
    } else {
        dropdownMenuButton.style.display = 'none';
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
                alert("User added successfully");

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


promoteBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const userEmail = prompt("Enter the email of the user to be made admin:");

    if (userEmail) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/admin/promote/${currentGroupId}`, { email: userEmail }, { headers: { 'Authorization': token } });
            if (response.data.success) {
                alert(`${userEmail} is now an admin`);
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert(error.response.data.message);

                } else if (error.response.status === 404) {
                    alert(error.response.data.message);

                } else {
                    alert("Error occurred while promoting user");
                }
            } else {
                alert("Error promoting user, failed !!");
                console.log(error);
            }

        }

    } else {
        alert("email field can't be empty");
    }
});


demoteBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const userEmail = prompt("Enter the email of the user to be demoted:");

    if (userEmail) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/admin/demote/${currentGroupId}`, { email: userEmail }, { headers: { 'Authorization': token } });
            if (response.data.success) {
                alert(`${userEmail} successfully removed from admin`);
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert(error.response.data.message);

                } else if (error.response.status === 404) {
                    alert(error.response.data.message);

                } else {
                    alert("Error occurred while demoting user");
                }
            } else {
                alert("Error demoting user, failed !!");
                console.log(error);
            }

        }

    } else {
        alert("email field can't be empty");
    }
});


removeUserBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const userEmail = prompt("Enter the email of the user to be removed:");

    if (userEmail) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/admin/removeUser/${currentGroupId}`, { email: userEmail }, { headers: { 'Authorization': token } });
            if (response.data.success) {
                alert(`${userEmail} is removed from the group successfully`);
                fetchGroups();
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert(error.response.data.message);

                } else if (error.response.status === 404) {
                    alert(error.response.data.message);

                } else {
                    alert("Error occurred while removing user");
                }
            } else {
                alert("Error removing user, failed !!");
                console.log(error);
            }

        }

    } else {
        alert("email field can't be empty");
    }
});


leaveGroupBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const confirmation = confirm("Are you sure you want to leave the group?");

    if (confirmation) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/group/leaveGroup/${currentGroupId}`, {}, { headers: { 'Authorization': token } });

            if (response.data.success) {
                alert("You have left the group successfully");
                fetchGroups();
                switchToNormalChat();
                clearInterval(fetchNewMessagesInterval);
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert(error.response.data.message);

                } else if (error.response.status === 404) {
                    alert(error.response.data.message);

                } else {
                    alert("Error occurred while leaving group");

                }
            } else {
                alert("Error leaving group, failed !!");
                console.log(error);
            }

        }
    }
});


deleteGroupBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const confirmation = confirm("Are you sure you want to delete the group?");

    if (confirmation) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/group/deleteGroup/${currentGroupId}`, { headers: { 'Authorization': token } });

            if (response.data.success) {
                alert("Group deleted successfully");
                // fetchGroups();
                // switchToNormalChat();
                // return;
                localStorage.removeItem(`groupMessages_${currentGroupId}`);
                window.location.reload();
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert(error.response.data.message);

                } else if (error.response.status === 404) {
                    alert(error.response.data.message);

                } else {
                    alert("Error occurred in deletion");

                }
            } else {
                alert("Error deleting group, failed !!");
                console.log(error);
            }

        }
    }
});