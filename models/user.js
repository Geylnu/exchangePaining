const Sequelize = require('sequelize');
const path = require('path');
const config = require('../config')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname,'../database/database.sqlite')
});


const User = sequelize.define('user', {
    uuid: {
        type: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
});

User.sync().then(()=>{
    return User.findOrCreate({where:config})
})

module.exports = User
