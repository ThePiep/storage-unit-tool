var express = require('express')
const path = require('path')
var router = express.Router()
var storageRouter = require('./storage')
var inventoryValueRouter = require('./inventory-value')


router.use('/storage', storageRouter)
router.use('/inventory-value', inventoryValueRouter)

module.exports = router