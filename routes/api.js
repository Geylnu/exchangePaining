const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const pako = require('pako')


const UserModel = require('../models/user')
const PaintingModel = require('../models/painting')
const favourModel = require('../models/favour')
const uuidv4 = require('uuid/v4');

router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

router.all('/*', function (req, res, next) {
  let userId = req.session.userId
  if (userId) {
    next()
  } else {
    UserModel.create({ uuid: uuidv4() }).then((user) => {
      req.session.userId = user.uuid
      next()
    })
  }
})


router.get('/painting', function (req, res, next) {
  function sendJson() {
    let paiting = req.session.tempArray.pop()
    let { data, uuid } = paiting
    getFavourTnfo(uuid, req.session.userId).then((result) => {
      let { favourNum, favour } = result
      res.json({ favour, data: JSON.parse(data), paintingId: uuid, favourNum })
    })
  }

  if (!req.session.tempArray || req.session.tempArray.length === 0) {
    if (req.session.paiting) {
      getRandomPainting(req.session.userId).then((result) => {
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
    PaintingModel.create({
      uuid: uuidv4(),
      userId: req.session.userId,
      data,
    }).then((paiting) => {
      req.session.paiting = paiting.uuid
      res.send({ status: 'success' })
    })
  }
});

router.post('/favour', function (req, res, next) {
  let { favour, paintingId } = req.body.data
  setFavour(paintingId, req.session.userId, favour).then((favourNum) => {
    res.json(favourNum)
  })
})

async function getFavourTnfo(paintingId, userId) {
  let favourNum = await getFavourNum(paintingId)
  let favour = await isFavour(paintingId, userId)
  if (favour && favourNum === 0) {
    debugger
  }
  return { favourNum, favour }
}

async function getFavourNum(paintingId) {
  let where = {
    paintingId,
    favour: true,
  }
  let result = await favourModel.findAll({ where })
  return result.length
}

async function isFavour(paintingId, userId) {
  let where = {
    paintingId, userId, favour: true
  }
  let result = await favourModel.findAll({ where })

  let favour = result.length === 1
  return favour
}

async function setFavour(paintingId, userId, favour) {
  let findData = await favourModel.findAll({ where: { paintingId, userId } })
  if (findData.length === 0) {
    let result = await favourModel.create({ paintingId, userId, favour })
    let favourNum = await getFavourNum(paintingId)
    return favourNum
  } else {
    let result = await favourModel.update({ paintingId, userId, favour }, { where: { paintingId, userId } })
    let favourNum = await getFavourNum(paintingId)
    return favourNum
  }
}

async function getRandomPainting(userId) {
  let where = {
    userId: {
      [Op.not]: userId
    }
  }
  let result = await PaintingModel.findAll({
    limit: 20, where,
    order: [
      Sequelize.fn('RANDOM'),
    ]
  })
  return result
}

function vaildData(data) {
  data = JSON.parse(data)
  let result = false
  if (data && data.length > 0) {
    lastStep = data[data.length - 1]
    let time = lastStep[lastStep.length - 1].time
    if (time > 3000) {
      result = true
    }
  }
  return result
}




module.exports = router;
