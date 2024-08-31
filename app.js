require('dotenv').config();

const express = require('express');
const cors = require("cors");
const path = require('path');
const sequelize = require('./util/database.js');

const User = require('./models/users.js');
const Chats = require('./models/chats.js');
const Groups = require('./models/groups.js');
const UserGroup = require('./models/userGroup.js');


const userRoutes = require('./routes/user.js');
const homePageRoutes = require('./routes/homePage.js');
const chatRoutes = require('./routes/chats.js');
const groupRoutes = require('./routes/groups.js');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(homePageRoutes);
app.use(userRoutes);
app.use(chatRoutes);
app.use(groupRoutes);

User.hasMany(Chats);
Chats.belongsTo(User);

Groups.hasMany(Chats);
Chats.belongsTo(Groups);

User.belongsToMany(Groups, {through: UserGroup});
Groups.belongsToMany(User, {through: UserGroup});


sequelize.sync().
    then((result) => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }).catch((err) => {
        console.log(err);
    });



