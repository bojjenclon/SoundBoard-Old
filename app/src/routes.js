import Vue from 'vue'

export default {
  '/': {
    component: Vue.component('board-view', require('./components/BoardView')),
    name: 'board-view'
  }
}
