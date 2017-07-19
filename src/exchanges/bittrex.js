const bittrex = require('node.bittrex.api')
const _ = require('lodash')

const Pair = require('../../lib/pair')

const { key, secret } = require('../getKeys')('bittrex')
bittrex.options({
  apikey: key,
  apisecret: secret
})

/**
 * NOTE: When dealing with pairs, they must be flipped before returned.
 */

class Bittrex {

  buy() {
    return privateMethods.addOrder.apply(this, ['buy', ...arguments])
  }

  sell() {
    return privateMethods.addOrder.apply(this, ['sell', ...arguments])
  }

  balances() {
    return new Promise((resolve, reject) => {
      bittrex.getbalances( response => {
        if(response.success) {
          let currencies = _.map(response.result, (currency) => {
            return {
              asset: currency.Currency,
              balance: parseFloat(currency.Balance),
              available: parseFloat(currency.Available),
              pending: parseFloat(currency.Pending)
            }
          })
          resolve(currencies)
        } else
          reject(response.message)
      })
    })
  }

  assets() {
    return new Promise((resolve, reject) => {
      bittrex.getcurrencies( response => {
        if(response.success) {
          let assets = _.reduce(response.result, (result, data) => (
            data.IsActive ? result.concat([ data.Currency ]) : result
          ), [])
          resolve(assets)
        } else {
          reject(response.message)
        }
      })
    })
  }

  pairs() {
    return new Promise((resolve, reject) => {
      bittrex.getmarkets( response => {
        if(response.success) {
          let pairs = _.map(response.result, market => (
            Pair.flip(market.MarketName.replace('-','_'))
          ))
          resolve(pairs)
        } else
          reject(response.message)
      })
    })
  }

  depth(pair, count=50) {
    pair = Pair.flip(pair).replace('_','-')
    return new Promise((resolve, reject) => {
      bittrex.getorderbook({ market: pair, type: 'both', depth: count },
        (response) => {
          if(response.success) {
            let depth = response.result
            _.each(depth, (entries, type) => {
              depth[type] = _.map(entries, entry => {
                return [
                  parseFloat(entry.Rate),
                  parseFloat(entry.Quantity)
                ]
              })
            })
            resolve(depth)
          } else {
            reject(response.message)
          }
        })
    })
  }

}

module.exports = Bittrex

const privateMethods = {

  addOrder(type, pair, amount, rate) {
    pair = Pair.flip(pair).replace('_','-')
    return new Promise((resolve, reject) => {
      bittrex[`${type}limit`]({
        market: pair,
        quantity: amount,
        rate
      }, response => {
        if(response.success) {
          let txid = response.result.uuid
          resolve({
            txid
          })
        } else {
          reject(response.message)
        }
      })
    })
  }

}
