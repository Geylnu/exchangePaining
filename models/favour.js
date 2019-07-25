const Sequelize = require('sequelize');
const path = require('path')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname,'../database/database.sqlite')
});

const favour = sequelize.define('favour', {
    paintingId: {
        type: Sequelize.UUIDV4,
        allowNull: false,
    },
    userId:{
        type: Sequelize.UUIDV4,
        allowNull: false,
    },
    favour:{
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
});

favour.sync()

  module.exports = favour