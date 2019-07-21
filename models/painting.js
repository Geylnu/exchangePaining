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

Painting.sync()

  module.exports = Painting