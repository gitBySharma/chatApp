require('dotenv').config();

const express = require('express');
const cors = require("cors");
const path = require('path');
const sequelize = require('./util/database.js');

const userRoutes = require('./routes/user.js');


const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(userRoutes);


sequelize.sync().
    then((result) => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }).catch((err) => {
        console.log(error);
    });



