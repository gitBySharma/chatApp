const User = require('../models/users.js');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.userSignup = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists, enter a new email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(200).json({ signUpData: data, success: true })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}