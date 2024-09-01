const { where } = require("sequelize");
const uuid = require('uuid');
const brevo = require("sib-api-v3-sdk");
const bcrypt = require('bcrypt');

const sequelize = require('../util/database.js');
const Users = require('../models/users.js');
const ForgotPassword = require('../models/forgotPassword.js');

require('dotenv').config();


const defaultClient = brevo.ApiClient.instance;
const ApiKeyAuth = defaultClient.authentications['api-key'];
ApiKeyAuth.apiKey = process.env.FORGOT_PASSWORD_API_KEY;


exports.forgotPassword = async (req, res, next) => {
    try {

        const { email } = req.body;
        const user = await Users.findOne({ where: { email: email } });
        if (user) {
            const id = uuid.v4();
            await ForgotPassword.create({ id: id, active: true, userId: user.id });

            const apiInstance = new brevo.TransactionalEmailsApi();
            const sender = {
                email: "subhankarsharma24@gmail.com",
                name: "Sharma",
            };

            const receiver = [{
                email: req.body.email,
            }]

            const sentMail = await apiInstance.sendTransacEmail({
                sender,
                to: receiver,
                subject: "Reset Password",
                htmlContent: `<a href="${process.env.WEBSITE}/password/resetPassword/${id}">Reset password</a>`
            });

            return res.status(200).json({ message: "Password reset link sent to your email", data: sentMail });

        } else {
            return res.status(400).json({ message: "User not found" });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error!! try again" })
    }
};



exports.resetPassword = async (req, res, next) => {
    try {
        const id = req.params.id;
        const forgotPasswordRequest = await ForgotPassword.findOne({ where: { id: id } });
        //console.log(forgotPasswordRequest);

        if (forgotPasswordRequest) {
            await forgotPasswordRequest.update({ active: false });

            res.status(200).send(`<html>
                <script>
                    function formsubmitted(e){
                        e.preventDefault();
                        console.log('called')
                    }
                </script>

                <form action="/password/updatePassword/${id}" method="post">
                    <label for="newPassword">Enter New password</label>
                    <input name="newPassword" type="password" required></input>
                    <small>Minimum 8 characters long and must contain at least one number.</small> <br>
                    <button>Reset Password</button>
                </form>
            </html>`)

            res.end();
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};



exports.updatePassword = async (req, res, next) => {
    try {
        const resetPasswordRequest = await ForgotPassword.findOne({ where: { id: req.params.id } });
        if (resetPasswordRequest) {
            const user = await Users.findOne({ where: { id: resetPasswordRequest.userId } });

            if (user) {
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);  //encrypting the password
                await user.update({ password: hashedPassword });
                res.status(201).send(`
                    <html>
                    <head>
                        <title>Password Updated</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                background-color: #f0f0f0;
                            }
                            .message {
                                background-color: #d4edda;
                                border-color: #c3e6cb;
                                color: #155724;
                                padding: 20px;
                                border-radius: 5px;
                                text-align: center;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            }
                        </style>
                    </head>
                    <body>
                        <div class="message">
                            <h2>Password successfully updated.</h2>
                            <p>Log into your expense tracker account again.</p>
                        </div>
                    </body>
                    <script>
                            document.addEventListener('DOMContentLoaded', () => {
                                setTimeout(() => {
                                    window.location.href = "${process.env.WEBSITE}";
                                }, 3000);
                            });
                    </script>
                    </html>
                `);

                //res.status(200).json({Message: "Password successfully updated"});

            } else {
                res.status(400).json({ message: "User not found" });
            }

        } else {
            res.status(401).json({ error: "Reset password request is not valid" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }

};