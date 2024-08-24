const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const password1 = document.getElementById("signup-password-1");
const password2 = document.getElementById("signup-password-2");
const passwordHelp = document.getElementById("passwordHelp");
const signupBtn = document.getElementById("signupBtn");

signupBtn.disabled = true; //initially disable the button

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        if (password1.value != password2.value) {
            alert("Password doesn't match, enter again");
            return;
        }

        const isValidPassword = validatePassword(password1.value);

        if (isValidPassword) {
            const userData = {
                name: signupName.value,
                email: signupEmail.value,
                password: password2.value
            }

            //clearing input fields
            signupName.value = '';
            signupEmail.value = '';
            password1.value = '';
            password2.value = '';

            const post = await axios.post('/user/signup', userData);
            if (post) {
                alert("Signed up successfully");
                //hide sign-up modal
                const signUpModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                signUpModal.hide();
                // Show sign-in modal
                document.getElementById('signupModal').addEventListener('hidden.bs.modal', function () {
                    let loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                });

                signupName.value = '';
                signupEmail.value = '';
                password1.value = '';
                password2.value = '';

            } else {
                alert("Failed to sign up" + post.data.error);
            }

        } else {
            passwordHelp.textContent = "Enter valid password";
            signupBtn.disabled = true;
        }

    } catch (error) {
        console.error(error);
    }
});


password1.addEventListener('keyup', () => {
    const isValidPassword = validatePassword(password1.value);
    if (isValidPassword) {
        passwordHelp.textContent = "";
        signupBtn.disabled = false;

    } else {
        passwordHelp.textContent = "Enter valid password";
        signupBtn.disabled = true;
    }
});


//function to check password strength & compatibility
function validatePassword(password) {
    const hasMinimumLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    return hasMinimumLength && hasNumber;
}




//login modal

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
        email: loginEmail.value,
        password: loginPassword.value
    }

    loginEmail.value = '';
    loginPassword.value = '';

    axios.post('/user/login', userData)
        .then((result) => {
            alert("Logged in successfully");
            localStorage.setItem('token', result.data.token);
            window.location.href = "chatPage.html";

        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });

});