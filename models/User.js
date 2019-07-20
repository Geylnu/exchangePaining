const Sequelize = require('sequelize');
const path = require('path')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname + './database/database.sqlite')
});

const User = sequelize.define('user', {
    uuid: {
        type: Sequelize.STRING,
        allowNull: false
    },
    data: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.sync({ force: true }).then(() => {
    return User.create({
        uuid: 'John',
        data: '[\'test\']'
    });
  });
