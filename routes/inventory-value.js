const express = require('express')
const router = express.Router()
const steam = require('../controllers/steam')
const csgo = require('../controllers/csgo')
let inv_value = require('../controllers/inventory-value')


router.get('/', (req, res) => {
    inv_value.getFullCountedInventory((inventory) => {
        res.json(inventory);
    });
})

module.exports = router