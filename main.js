const app = Vue.createApp({
    data() {
        return {
            pendingList: [],
            inPreparationList: [],
            readyList: [],
            loading: null,
            selectedOrder: null  
        };
    },
    computed: {
        pendingResult() {
           return this.pendingList;
        },
        inPreparationResult(){
            return this.inPreparationList;
        },
        readyResult(){
            return this.readyList;
        }
    },
    async mounted() {
        this.pendingList = await this.getOrder("pending_kitchen");
        this.inPreparationList = await this.getOrder("in_preparation");
        this.readyList = await this.getOrder("ready");
    },
    methods: {
        async getOrder(status) {
            let response = await fetch(`http://localhost:3000/api/v1/restaurants/REST99/orders/?status=${status}`);
            let data = await response.json();
            let list = []
            data.forEach(orderInfo => {
                var order = new Object();
                order.code = orderInfo.code;
                order.customer = orderInfo.customer.name;
                order.status = orderInfo.status;
                order.phone_number = orderInfo.customer.phone_number;
                order.hour = this.timeAgo(orderInfo.order_date)
                order.items = [];
                orderInfo.order_items.forEach(item => {
                    order.items.push(item.description);
                });
                list.push(order);
            });
            return list
        },
        async showOrderDetails(code) {
            let response = await fetch(`http://localhost:3000/api/v1/restaurants/REST99/orders/${code}`);
            let data = await response.json()
            this.selectedOrder = data;  
        },
        async clearSelectedOrder() {
            this.pendingList = await this.getOrder("pending_kitchen");
            this.inPreparationList = await this.getOrder("in_preparation");
            this.readyList = await this.getOrder("ready");
            this.selectedOrder = null; 
        },
        async markOrderAsInPreparation(code){
            let response = await fetch(`http://localhost:3000/api/v1/restaurants/REST99/orders/${code}/to_preparation`, { method: "POST" });
            let data = await response.json();
            if(data){
                this.selectedOrder = data;  
            }
              
        },
        async markOrderAsReady(code){
            let response = await fetch(`http://localhost:3000/api/v1/restaurants/REST99/orders/${code}/to_ready`, { method: "POST" });
            let data = await response.json();
            if(data){
                this.selectedOrder = data;
            }
        },
        timeAgo(date) {
            const orderDate = new Date(date);
            const now = new Date();
            const diffInMs = now - orderDate;
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            
            if (diffInHours < 1) {
                const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
                return diffInMinutes === 1 ? "1 minuto atrás" : `${diffInMinutes} minutos atrás`;
            } else if (diffInHours < 24) {
                return diffInHours === 1 ? "1 hora atrás" : `${diffInHours} horas atrás`;
            } else {
                const diffInDays = Math.floor(diffInHours / 24);
                return diffInDays === 1 ? "1 dia atrás" : `${diffInDays} dias atrás`;
            }
        }        
        
    }
});

app.mount('#app');
