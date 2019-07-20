const Sequelize = require('sequelize');
const path = require('path')

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

User.sync({ force: true }).then(() => {
    return User.create({
        uuid: '5e4c6455-10d9-495d-b5c8-b1480c7ea243',
        role: 1
    });
});

module.exports = User
