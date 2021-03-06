const Api = require('yunbi-api-module')
const _ = require('lodash')

/**
 * NOTE: When dealing with pairs, replace '/' with an underscore.
 */

class Yunbi {

  constructor({ key, secret }) {
    this.yunbi = new Api(key, secret)
  }

  // Public Methods

  ticker(pair) {
    pair = pair.replace('_','').toLowerCase()

    return new Promise((resolve, reject) => {
      this.yunbi.getTicker(pair,
        (err, ticker) => {
          if(err) {
            reject(err)
          } else {
            let { ticker: { last, buy, sell, high, low, vol }, at } = ticker
            resolve({
              last: parseFloat(last),
              ask: parseFloat(buy),
              bid: parseFloat(sell),
              high: parseFloat(high),
              low: parseFloat(low),
              volume: parseFloat(vol),
              timestamp: new Date(at * 1000).getTime()
            })
          }
        })
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      this.pairs()
        .then( pairs => {
          let assets = _.reduce(pairs, (result, p) => result.concat(p.split('_')), [])
          assets = _.uniq(assets)
          resolve(assets)
        })
        .catch(reject)
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      this.yunbi.getMarkets(
        (err, markets) => {
          if(err) {
            reject(err)
          } else {
            markets = _.map(markets, m => {
              let alt
              let [base, quote] = m.name.split('/')

              base = (alt = Yunbi.alts[base]) ? alt : base
              quote = (alt = Yunbi.alts[quote]) ? alt : quote

              return `${base}_${quote}`
            })
            resolve(markets)
          }
        })
    }).catch(console.log)
  }

  depth(pair, count=50) {
    pair = pair.replace('_','').toLowerCase()
    return new Promise((resolve, reject) => {
      this.yunbi.getDepth(pair, null,
        (err, depth) => {
          if(err) {
            reject(err)
          } else {
            depth = {
              asks: depth.asks.splice(0, count),
              bids: depth.bids.splice(0, count)
            }
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => _.map(entry, parseFloat))
            })
            resolve(depth)
          }
        })
    })
  }

  // Authenticated Methods

  // buy() {
  //   return privateMethods.addOrder.apply(this, ['buy', ...arguments])
  // }
  //
  // sell() {
  //   return privateMethods.addOrder.apply(this, ['sell', ...arguments])
  // }
  //
  // balances(account) {
  //   return new Promise((resolve, reject) => {
  //     this.yunbi.getAccount(
  //       (err, account) => {
  //         if(err) {
  //           reject(err)
  //         } else {
  //           resolve(
  //             _.reduce(account.accounts, (result, a) => {
  //               let a = parseFloat(data.available), o = parseFloat(data.onOrders)
  //               {"currency":"cny", "balance":"100243840.0", "locked":"0.0"},
  //               let { currency, balance, locked } = a
  //               balance = parseFloat(balance)
  //               locked = parseFloat(locked)
  //
  //               result[currency] = {
  //                 balance,
  //                 available: balance - locked,
  //                 pending: locked
  //               }
  //
  //               return result
  //             }, {})
  //           )
  //         }
  //       })
  //   })
  // }

  address(asset) {
    return new Promise((resolve, reject) => {
      // TODO: fetch addresses
      reject('Not implemented.')
    })
  }

}

module.exports = Yunbi

Yunbi.alts = {
  '1S??': '1ST'
}

const privateMethods = {

  // addOrder(type, pair, amount, rate) {
  //   pair = pair.replace('_','').toLowerCase()
  //   return new Promise((resolve, reject) => {
  //     this.yunbi.createOrder(pair, type, amount, rate, null
  //       (err, response) => {
  //         if(err) {
  //           reject(error)
  //         } else {
  //           resolve(true)
  //         }
  //       })
  //   })
  // }

}
