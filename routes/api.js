const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize')


const User = require('../models/user')
const Painting = require('../models/painting')
const uuidv4 = require('uuid/v4');

router.all('/*', function (req, res, next) {
  let userId = req.session.userId
  if (userId) {
    next()
  } else {
    User.create({ uuid: uuidv4() }).then((user) => {
      req.session.userId = user.uuid
      next()
    })
  }
})


router.get('/painting', function (req, res, next) {
  let { id } = req.query
  if (!req.session.tempArray || req.session.tempArray.length === 0) {
    if (req.session.paiting) {
      Painting.findAll({
        limit: 20,
        order: [
          Sequelize.fn('RANDOM'),
        ]
      }).then((data) => {
        req.session.tempArray = data
        let paiting = req.session.tempArray.pop()
        res.json(paiting)
      })
    }
  }else{
    let data = req.session.tempArray.pop()
    res.json(data)
  }

})

router.post('/painting', function (req, res, next) {
  let data = req.body.data
  if (vaildData(data)) {
    Painting.create({
      uuid: uuidv4(),
      userId: req.session.userId,
      data: JSON.stringify(data),
    }).then((paiting) => {
      req.session.paiting = paiting.uuid
      res.send({ status: 'success' })
    })
  }
});

function vaildData(data) {
  return true
}




module.exports = router;
