const User = require('../models/users.js');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.userSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {

        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists, register using different email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(200).json({ message: "Signup successful", success: true })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}


function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name: name }, process.env.JWT_SECRET);
}



exports.userLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email: email } });

        //case1 - if the emailId is incorrect
        if (!user) {
            return res.status(404).json({ error: "Incorrect email, User not found", success: false });
        }

        //case2 if the emailId is correct
        const match = await bcrypt.compare(password, user.password);  //matching the entered password with the hashed password stored in database
        if (match) {
            return res.status(200).json({ data: user, message: "User logged in successfully", success: true, token: generateAccessToken(user.id, user.name) });

        } else {
            return res.status(401).json({ error: "Incorrect password", success: false });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}