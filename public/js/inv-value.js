var app = new Vue({
    el: '#app',
    data: {
        items: [],
        sort: {
            column: "quantity",
            dir: 1
        },
        filterValue: true
    },
    mounted() {
        this.getInvItems();

    },
    computed: {
        filteredItems: function () {
            filtered = JSON.parse(JSON.stringify(this.items))
            filtered.forEach((item) => {
                if (item.price) {
                    price = item.price['7_days'].median
                    item.price = price
                    item.total = (price * item.quantity).toFixed(2)
                } else {
                    item.total = null
                }
            })
            filtered.sort((f, s) => {
                return parseFloat(f.total) < parseFloat(s.total)
            })
            if (this.filterValue) {
                return filtered.filter(item => {
                    return !!item.price
                })
            } else {
                return filtered
            }
        },
        totalValue: function () {
            total = 0
            items = this.filteredItems.slice()
            items.forEach(item => {
                if (item.total) total += parseFloat(item.total)
            })
            return total.toFixed(2)
        }
    },
    methods: {
        getInvItems: function () {
            axios
                .get('/api/inventory-value')
                .then(response => {
                    this.items = response.data
                })
        }
    }
})