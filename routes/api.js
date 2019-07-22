const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const pako = require('pako')


const User = require('../models/user')
const Painting = require('../models/painting')
const uuidv4 = require('uuid/v4');

router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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
  function sendJson(){
    let paiting = req.session.tempArray.pop()
    let { favour, data } = paiting
    res.json({ favour, data: JSON.parse(data) })
  }


  let { id } = req.query
  if (!req.session.tempArray || req.session.tempArray.length === 0) {
    if (req.session.paiting) {
      let where = {
        userId: {
          [Op.not]: req.session.userId
        }
      }
      Painting.findAll({
        limit: 20,where,
        order: [
          Sequelize.fn('RANDOM'),
        ]
      }).then((result) => {
        req.session.tempArray = result
        sendJson()
      })
    }
  } else {
    sendJson()
  }

})

router.post('/painting', function (req, res, next) {

  let data = pako.inflate(req.body.data, { to: 'string' })
  if (vaildData(data)) {
    Painting.create({
      uuid: uuidv4(),
      userId: req.session.userId,
      data,
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
