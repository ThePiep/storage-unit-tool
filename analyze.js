// import someObject from ('./inventory_content.json');

var inventory_items = require('./inventory_content.json');
var items_game = require('./item_game.json');
var language_file = require('./csgo_english.json');

var result = {};

inventory_items.slice(0).forEach(function (item) {
    item_id = item.def_index
    console.log(item_id);
    let item_name;
    let item_code
    if (item_id == 1209 || item_id == 1349) {
        // Normal item_code #CSGO_Tool_Sticker
        sticker_id = item.stickers[0].sticker_id;
        console.log("Sticker_id: " + sticker_id)
        item_code = items_game.items_game.sticker_kits[sticker_id].item_name;
        item_name = language_file.lang.Tokens[item_code.slice(1)]

    }
    else if (item.hasOwnProperty("paint_index")) {
        prefab_weapon_code = items_game.items_game.items[item_id].prefab
        weapon_name_code = items_game.items_game.prefabs[prefab_weapon_code].item_name
        weapon_name = language_file.lang.Tokens[weapon_name_code.slice(1)]
        weapon_skin_id = item.paint_index;
        weapon_skin_code = items_game.items_game.paint_kits[weapon_skin_id].description_tag
        weapon_skin_name = language_file.lang.Tokens[weapon_skin_code.slice(1)]
        item_name = weapon_name + " | " + weapon_skin_name;
        console.log(item_name);
    } else {
        item_code = items_game.items_game.items[item_id].item_name
        console.log(item_code);
        item_name = language_file.lang.Tokens[item_code.slice(1)]
        console.log(item_name);
    }

    // let match = item_name + " " + item_code;
    let match = item_name;
    if (match in result) {
        result[match]++;
    } else {
        result[match] = 1;
    }
})

console.log(result);