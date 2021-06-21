const GlobalOffensive = require('globaloffensive')
const path = require('path')
const fs = require('fs')

const appDir = path.dirname(require.main.filename)
const items_game = require(path.join(appDir, 'item_game.json'))
const language_file = require(path.join(appDir, 'csgo_english.json'))

let steam = require('./steam')

let csgo = new GlobalOffensive(steam.client)

const inc = 25
const casketOppDelay = 500
const casketLoadDelay = 175
let acquiredItemsToStorage = false;

csgo.on('connectedToGC', function (details) {
    console.log('Successfully connected to game coordinator')

    function writeInvToFile() {
        let data = JSON.stringify(csgo.inventory, null, 4);
        fs.writeFile('inventory_content.json', data, function (err) {
            if (err) return console.log(err);
            console.log('csgo.inventory > inventory_content.json')
        });
    }
    // loadCasketContents(21943962273, writeInvToFile);
    writeInvToFile();
})

csgo.on('itemAcquired', function (item) {
    // Bij het kopen van een item krijg je itemAcquired, er is geen manier om dit te scheiden van storage unit retrieval
    // Als purchasesToStorageBox == true && !item.casket_id
    // Misschien mogelijk om item.tradable_after + 2 weeks te checken...
    // Sowieso handig om op item.tradable_after te checken
    if (acquiredItemsToStorage && !item.casket_id) {
        console.log(`itemAquired!: ${item.id}`)
        storageUnits = getStorageUnits().reverse()
        for (i = 0; i < storageUnits.length - 1; i++) {
            unit = storageUnits[i]
            if (unit.count < 1000) {
                depositItem(unit.id, item.id)
                break;
            }
        }
    }
})

function getAquiredItemsToStorage() {
    return acquiredItemsToStorage;
}

function setAquiredItemsToStorage(bool) {
    acquiredItemsToStorage = !!bool;
}

// csgo.on('itemChanged', function (oldItem, item) {
//     console.log(`itemChanged!`)
//     console.log({ oldItem: oldItem, item: item })
// })

// csgo.on('itemCustomizationNotification', function (itemIds, notificationType) {
//     console.log(`itemChanged!`)
//     console.log({ itemIds: itemIds, notificationType: notificationType })
// })

function getRawInventory() {
    if (csgo.haveGCSession) {
        console.log("Still connected to GC")
        return csgo.inventory.slice()
    } else {
        console.log("ERROR: Not connected to GC")
        return null;
    }
}

function getParsedInventory() {
    let inventory = getRawInventory()
    inventory.forEach(function (item) {
        let def_index = item.def_index
        let item_name
        let item_code
        let item_type
        if (def_index == 1209 || def_index == 1349) {
            // Normal item_code #CSGO_Tool_Sticker
            sticker_id = item.stickers[0].sticker_id;
            item_code = items_game.items_game.sticker_kits[sticker_id].item_name;
            item_name = language_file.lang.Tokens[item_code.slice(1)]
            item_type = "Sticker"
        } else if (item.hasOwnProperty("paint_index")) {
            prefab_weapon_code = items_game.items_game.items[def_index].prefab
            weapon_name_code = items_game.items_game.prefabs[prefab_weapon_code].item_name
            weapon_name = language_file.lang.Tokens[weapon_name_code.slice(1)]
            weapon_skin_id = item.paint_index
            weapon_skin_code = items_game.items_game.paint_kits[weapon_skin_id].description_tag
            weapon_skin_name = language_file.lang.Tokens[weapon_skin_code.slice(1)]
            item_name = weapon_name + " | " + weapon_skin_name
            item_type = "Weapon Skin"
        } else {
            item_code = items_game.items_game.items[def_index].item_name
            item_name = language_file.lang.Tokens[item_code.slice(1)]
            item_type = "Weapon Case"
        }

        item.id = parseInt(item.id)
        item.item_name = item_name
        item.item_type = item_type
    })
    return inventory
}

function getCountedInventoryItems() {
    let inventory = getParsedInventory()
    let result = []
    let count = 0
    let index = {}
    inventory.filter(function (item) {
        return !item.casket_id
    }).forEach(function (item) {
        let match = item.item_name
        if (match in index) {
            let pos = index[match]
            result[pos].quantity++
            result[pos].item_ids.push(item.id)
        } else {
            index[match] = count
            result.push({
                item_name: item.item_name,
                def_index: item.def_index,
                item_type: item.item_type,
                quantity: 1,
                item_ids: [item.id]
            })
            count++
        }
    })
    return result
}

function getCountedStorageItems(storage_id, callback) {
    loadCasketContents(storage_id, function casketLoaded() {
        setTimeout(() => {
            let inventory = getParsedInventory()
            let result = []
            let count = 0
            let index = {}
            inventory.filter(function (item) {
                return item.casket_id == storage_id
            }).forEach(function (item) {
                let match = item.item_name
                if (match in index) {
                    let pos = index[match]
                    result[pos].quantity++
                    result[pos].item_ids.push(item.id)
                } else {
                    index[match] = count
                    result.push({
                        item_name: item.item_name,
                        def_index: item.def_index,
                        item_type: item.item_type,
                        quantity: 1,
                        item_ids: [item.id]
                    })
                    count++
                }
            })
            callback(result)
        }, casketLoadDelay)
    })
}

function loadCasketContents(storage_id, callback) {
    csgo.getCasketContents(storage_id, function (err, items) {
        if (err) console.error('Casket load error!', err)
        else console.log(`Succesfully loaded casket:${storage_id}`)
        callback();
    })
}

function getStorageUnits() {
    result = []
    result.push({
        id: 0,
        name: "Inventory",
        count: countInventory()
    })
    getRawInventory().filter(function (item) {
        return item.def_index === 1201
    }).forEach(function (item) {
        result.push({ id: item.id, name: item.custom_name, count: item.casket_contained_item_count })
    })
    // console.log(result)
    return result
}

function countInventory() {
    return csgo.inventory.filter((item) => {
        return !item.casket_id
    }).length
}

function depositItem(storage_id, item_id, delay = 0) {
    setTimeout(() => {
        if (csgo.haveGCSession) {
            console.log(`Depositing item:${item_id} to storage unit:${storage_id}`)
            csgo.addToCasket(storage_id, item_id)
        } else {
            console.log("ERROR: Not connected to GC")
            return null;
        }
    }, delay)
}

function depositItems(storage_id, item_ids, callback) {
    delay = 0
    item_ids.forEach(function (item_id) {
        delay = delay + inc
        depositItem(storage_id, item_id, delay)
    })
    setTimeout(() => {
        callback()
    }, delay + casketOppDelay)
}

function retrieveItem(storage_id, item_id, delay = 0) {
    setTimeout(() => {
        if (csgo.haveGCSession) {
            console.log(`Retrieving item:${item_id} from storage unit:${storage_id}`)
            csgo.removeFromCasket(storage_id, item_id)
        } else {
            console.log("ERROR: Not connected to GC")
            return null;
        }
    }, delay)
}

function retrieveItems(storage_id, item_ids, callback) {
    delay = 0
    item_ids.forEach(function (item_id) {
        delay = delay + inc
        retrieveItem(storage_id, item_id, delay)
    })
    setTimeout(() => {
        callback()
    }, delay + casketOppDelay)
}

exports.getParsedInventory = getParsedInventory;
exports.getCountedInventoryItems = getCountedInventoryItems;
exports.getCountedStorageItems = getCountedStorageItems;
exports.depositItems = depositItems;
exports.retrieveItems = retrieveItems;
exports.getStorageUnits = getStorageUnits;
exports.getAquiredItemsToStorage = getAquiredItemsToStorage;
exports.setAquiredItemsToStorage = setAquiredItemsToStorage;
