const Sequelize = require('sequelize');
const path = require('path')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname,'../database/database.sqlite')
});

const Painting = sequelize.define('painting', {
    uuid: {
        type: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    userId:{
        type: Sequelize.UUIDV4,
        allowNull: false,
    },
    data: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    favour: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
});

Painting.sync({ force: true }).then(() => {
    return Painting.create({
        uuid: 'dcb2b0df-3efb-471d-8f51-58eca1309866',
        userId: '5e4c6455-10d9-495d-b5c8-b1480c7ea243',
        data: '[\'test\']'
    });
  });

  module.exports = Painting