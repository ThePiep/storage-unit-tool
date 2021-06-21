var app = new Vue({
    el: '#app',
    data: {
        storageList: [
        ],
        selectedInventory: 0,
        items: [],
        selectedItems: [],
        sort: {
            column: "quantity",
            dir: 1
        },
    },
    mounted() {
        this.getStorageList();
        this.updateItemList();
        console.log("mounted!")
    },
    computed: {
        depositing: function () {
            return !this.selectedInventory
        },
        storageBoxes: function () {
            return this.storageList.slice(1)
        },
        selectedItemsArray: function () {
            selected = []
            this.selectedItems.forEach((item) => {
                if (item.amount) {
                    selected = selected.concat(item.item_ids.slice(0, parseInt(item.amount)))
                } else {
                    selected = selected.concat(item.item_ids)
                }
            })
            return selected
        },
        sortedItems: function () {
            if (this.sort.dir != 0 && this.items.length && !!this.items[0][this.sort.column]) {
                console.log(this.sort.column)
                let sorted = this.items
                sorted.sort((f, s) => {
                    return f[this.sort.column] < s[this.sort.column]
                })
                console.log(sorted)
                return sorted

            } else {
                return this.items
            }
        },

    },
    methods: {
        getStorageList: function () {
            axios
                .get('/api/storage/storage_units')
                .then(response => {
                    this.storageList = response.data
                })
        },
        selectStorage: function (id) {
            this.selectedInventory = id
            this.items = []
            this.selectedItems = []
            this.updateItemList()
        },
        updateItemList: function () {
            if (!this.selectedInventory) {
                axios
                    .get('/api/storage')
                    .then(response => {
                        this.items = response.data
                        console.log(this.items)
                    })
            } else {
                axios
                    .get(`/api/storage/unit/${this.selectedInventory}`)
                    .then(response => {
                        this.items = response.data
                        console.log(this.items)
                    })
            }
        },
        depositItems: function (storage_id) {
            console.log(`Depositing items: ${this.selectedItemsArray} into storage:${storage_id}`)
            this.items = []
            axios
                .put(`/api/storage/deposit/${storage_id}`, this.selectedItemsArray)
                .then(() => {
                    console.log("items have been deposited")
                    this.selectedItems = []
                    this.updateItemList()
                    this.getStorageList()
                })
        },
        retrieveItems: function () {
            console.log(`Retrieving items: ${this.selectedItemsArray} from storage:${this.selectedInventory}`)
            this.items = []
            axios
                .put(`/api/storage/retrieve/${this.selectedInventory}`, this.selectedItemsArray)
                .then(() => {
                    this.selectedItems = []
                    this.updateItemList()
                    this.getStorageList()
                })
        }
    }
})