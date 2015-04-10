var Bitstamp = Meteor.require("bitstamp");
var publicBitstamp = new Bitstamp();
var conf = EJSON.parse(Assets.getText("bitstamp.config"));
var privateBitstamp = new Bitstamp(conf.key, conf.secret, conf.client_id);

var ordersCheckHandle = null;
var ordersCheckCurrentPeriod = 0;
var checkOrdersEvery = function(seconds) {
  if (ordersCheckCurrentPeriod == seconds) return;
  if (ordersCheckHandle != null) {
    Meteor.clearInterval(ordersCheckHandle);
  }
  ordersCheckHandle = Meteor.setInterval(function() {
    Meteor.call("open_orders");
  }, seconds * 1000);
  ordersCheckCurrentPeriod = seconds;
};

Meteor.startup(function () {
  Tickers.remove({});
  Tickers._ensureIndex({ "timestamp": -1});
  Balances._ensureIndex({ "timestamp": -1});
  Meteor.call("balance");
  Meteor.call("user_transactions");
  Meteor.setInterval(function() {
    Meteor.call("ticker");
  }, 30*1000);
});

Meteor.methods({
  ticker: function() {
    publicBitstamp.ticker(Meteor.bindEnvironment(function(err, ticker) {
      if (err) throw err;
      var lastTicker = Tickers.findOne({}, {sort: {timestamp: -1}});
      if (!lastTicker || lastTicker.timestamp != ticker.timestamp) {
        Tickers.insert(ticker);
      }
    }));
  },
  balance: function() {
    privateBitstamp.balance(Meteor.bindEnvironment(function(err, balance) {
      if (err) throw err;
      var lastBalance = Balances.findOne({}, {sort: {"timestamp": -1}});
      if (!lastBalance || lastBalance.usd_available != balance.usd_available || lastBalance.btc_available != balance.btc_available) {
        balance.timestamp = Math.floor(Date.now() / 1000);
        Balances.insert(balance);
      }
    }));
  },
  buy: function(amount, price) {
    if (amount * price < 1) {
      console.log("Minimum order size is USD 1. Order not sent.");
      return;
    }
    privateBitstamp.buy(amount, price, Meteor.bindEnvironment(function(err, order) {
      if (err) throw err;
      if (order.error) {
        console.log(order.error);
      }
      else {
        console.log("Buy order created for $" + (amount * price));
        Orders.insert(order);
        Meteor.call("open_orders");
        Meteor.call("balance");
      }
    }));
  },
  sell: function(amount, price) {
    privateBitstamp.sell(amount, price, Meteor.bindEnvironment(function(err, order) {
      if (err) throw err;
      if (order.error) {
        console.log(order.error);
        return;
      }
      else {
        console.log("Sell order created for $" + (amount * price));
        Orders.insert(order);
        Meteor.call("open_orders");
        Meteor.call("balance");
      }
    }));
  },
  open_orders: function() {
    console.log("Checking open orders");
    privateBitstamp.open_orders(Meteor.bindEnvironment(function(err, orders) {
      if (err) throw err;
      Orders.remove({});
      if (orders.length > 0) {
        _.each(orders, function(o){
          Orders.insert(o);
        });
      }
    }));
  },
  cancel_order: function(order_id) {
    privateBitstamp.cancel_order(order_id, Meteor.bindEnvironment(function(err, success) {
      if (err) throw err;
      if (success) {
        console.log("Order was cancelled");
        Orders.remove({"id":order_id});
        Meteor.call("balance");
      }
      else {
        console.log("Bitstamp did NOT cancel the order");
      }
    }));
  },
  user_transactions: function() {
    privateBitstamp.user_transactions(10, Meteor.bindEnvironment(function(err, transactions) {
      if (err) throw err;
      _.each(transactions, function(t){
        Transactions.upsert({"id": t.id}, t);
      });
    }));
  },
});