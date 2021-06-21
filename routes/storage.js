let express = require('express')
let router = express.Router()
let steam = require('../controllers/steam')
let csgo = require('../controllers/csgo')

/* Get items in inventory, excluding storage box content */
router.get('/', function (req, res) {
    let inventory = csgo.getCountedInventoryItems();
    res.json(inventory)
})

/* Get items of specified storage box */
router.get('/unit/:id', function (req, res) {
    csgo.getCountedStorageItems(req.params.id, function (storage) {
        res.json(storage)
    });

})

/* Get an array with all storage unit ids, names and number of items */
router.get('/storage_units', function (req, res) {
    res.json(csgo.getStorageUnits());
})

/* Receives: json data describing which items to deposit in specified storage box.*/
router.put('/deposit/:storage_id', function (req, res) {
    csgo.depositItems(req.params.storage_id, req.body, () => {
        res.json(req.body)
    })
})

router.put('/retrieve/:storage_id', function (req, res) {
    csgo.retrieveItems(req.params.storage_id, req.body, () => {
        res.json(req.body)
    })
})

module.exports = router