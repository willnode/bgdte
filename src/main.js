import Vue from 'vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSync, faFolderOpen, faSave, faFilter, faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import draggable from 'vuedraggable'
import 'bootstrap/dist/css/bootstrap.min.css'

library.add(faSync, faFolderOpen, faSave, faFilter, faPlus, faTrash, faEdit)

Vue.component('fa-icon', FontAwesomeIcon)
Vue.component('draggable', draggable)

Vue.config.productionTip = false

window.app = new Vue({
  render: h => h(App),
})
window.app.$mount('#app')
