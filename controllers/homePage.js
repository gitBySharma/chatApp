const path = require('path');

exports.getHomePage = async (req, res, next) =>{
    res.sendFile(path.join(__dirname,'../public', 'homePage.html'));
}