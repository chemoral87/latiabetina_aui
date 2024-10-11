import Vue from 'vue'

const moment = require('moment')
require('moment/locale/es')
Vue.use(require('vue-moment'), { moment })

Vue.filter('price', function (value) {
  const val = (value / 1).toFixed(2)
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
})

Vue.filter('humanize', function (value) {
  if (!value) return ''
  return moment(String(value)).fromNow()
})

Vue.filter('daysDiff', function (value, otherValue) {
  if (!value || !otherValue) return ''
  const date1 = moment(value)
  const date2 = moment(otherValue)
  return date2.diff(date1, 'days')
})

Vue.filter('daysDiffFromNow', function (value) {
  if (!value) return ''
  const now = moment().startOf('day')
  const date = moment(value).startOf('day')
  return now.diff(date, 'days')
})

Vue.filter('hoursDiffFromNow', function (value) {
  if (!value) return ''
  const now = moment().startOf('day')
  const date = moment(value).startOf('day')
  return now.diff(date, 'hours')
})
// Vue.filter("currency", function(value) {
//   // tanks @li-x for his simple formating function
//   return value.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
//   // return value.toLocaleString("en-UK", { style: "currency", currency: "EUR" });
//   // you can add something like .replace(/,/g, ' ') after toLocaleString method to customize your formatted number
// });
Vue.filter('toCurrency', function (value) {
  // if (typeof value !== "number") {
  //   return value;
  // }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })
  return formatter.format(value)
})

Vue.filter('uppercase', function (value) {
  if (!value) return ''
  return value.toString().toUpperCase()
})
