const axios = require('axios');
const fs = require('fs');
const csgo = require('./csgo');

let itemPrices = {}

fs.readFile('Item_prices-1624174863823.json', 'utf8', (err, data) => {
    if (err) throw err;
    itemPrices = JSON.parse(data)['items_list'];
    // console.log(itemPrices['Prisma Case'])
})

// axios.get('http://csgobackpack.net/api/GetItemsList/v2/', {
//     params: {
//         currency: 'EUR'
//     }
// }).then((res) => {
//     price_list = JSON.stringify(res.data, null, 4);
//     fs.writeFile('price_list.json', price_list, function (err) {
//         if (err) return console.log(err);
//         console.log('price list > price_list.json')
//     })
// }).catch((err) => {
//     console.log("Could not retrieve item prices")
// });



async function getFullCountedInventory(callback) {
    let inventory = csgo.getCountedInventoryItems()
    let storage_units = csgo.getStorageUnits()
    console.log('starting promises')
    for (const unit of storage_units.slice(1)) {
        let storage_content = await promGetCountedStorageItems(unit.id)
        count = 0
        storage_content.forEach(item => {
            count += item.quantity
        })
        console.log(`Storage size: ${unit.count}, loaded items: ${count}`);
        if (parseInt(unit.count) !== parseInt(count)) {
            console.log('\x1b[33m%s\x1b[0m', 'WARNING: Not all items loaded')
        }
        inventory = inventory.concat(storage_content)
    }
    console.log('done loading inventories')
    console.log(inventory.length)
    inventory = reduceCountedInventory(inventory)
    console.log(inventory.length)
    callback(inventory)

}

function reduceCountedInventory(inventory) {
    let inv = inventory.slice();
    let res = []
    inv.forEach((item) => {
        let inRes = false
        let inResId = 0
        for ([index, itemRes] of res.entries()) {
            if (item.def_index == itemRes.def_index) {
                inRes = true
                inResId = index
                break
            }
        }
        if (inRes) {
            res[inResId].quantity += item.quantity
        } else {
            let price = null
            if (itemPrices[item.item_name]) {
                price = itemPrices[item.item_name]['price']
            }
            res.push({
                item_name: item.item_name,
                def_index: item.def_index,
                item_type: item.item_type,
                quantity: item.quantity,
                price: price
            })
        }
    })
    return res
}

function promGetCountedStorageItems(storage_id) {
    return new Promise((resolve, reject) => {
        console.log(`Starting to get ${storage_id}`)
        csgo.getCountedStorageItems(storage_id, (result) => {
            console.log(`Resolved ${storage_id}`)
            resolve(result);
            reject('failed');
        })
    })
}


exports.getFullCountedInventory = getFullCountedInventory