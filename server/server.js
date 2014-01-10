var Bitstamp = Meteor.require('bitstamp');
var publicBitstamp = new Bitstamp();
var conf = EJSON.parse(Assets.getText('bitstamp.config'));
var privateBitstamp = new Bitstamp(conf.key, conf.secret, conf.client_id);

Meteor.startup(function () {
  Meteor.setInterval(function() {
    Meteor.call("ticker");
  }, 30*1000);
  Meteor.setInterval(function() {
    Meteor.call("balance");
  }, 59*1000);
  Meteor.setInterval(function() {
    Meteor.call("open_orders");
  }, 27*1000);
  Meteor.call("user_transactions");
});

Meteor.methods({
  ticker: function() {
    publicBitstamp.ticker(Meteor.bindEnvironment(function(err, ticker) {
      if (err) throw err;
      var lastTicker = Tickers.findOne({}, {sort: {timestamp: -1}});
      if (lastTicker.timestamp != ticker.timestamp) {
        Tickers.insert(ticker);
      }
    }));
  },
  balance: function() {
    privateBitstamp.balance(Meteor.bindEnvironment(function(err, balance) {
      if (err) throw err;
      balance.timestamp = Math.floor(Date.now() / 1000);
      Balances.insert(balance);
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
        console.log(order.error.__all__);
      }
      else {
        console.log("Buy order created for $" + (amount * price));
        Orders.insert(order);
        Meteor.call("balance");
      }
    }));
  },
  sell: function(amount, price) {
    privateBitstamp.sell(amount, price, Meteor.bindEnvironment(function(err, order) {
      if (err) throw err;
      if (order.error) {
        console.log(order.error.__all__);
        return;
      }
      else {
        console.log("Sell order created for $" + (amount * price));
        Orders.insert(order);
        Meteor.call("balance");
      }
    }));
  },
  open_orders: function() {
    privateBitstamp.open_orders(Meteor.bindEnvironment(function(err, orders) {
      if (err) throw err;
      Orders.remove({});
      _.each(orders, function(o){
        Orders.insert(o);
      });
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
        console.log("Bistamp did NOT cancel the order");
      }
    }));
  },
  user_transactions: function() {
    privateBitstamp.user_transactions(100, Meteor.bindEnvironment(function(err, transactions) {
      if (err) throw err;
      _.each(transactions, function(t){
        var count = Transactions.find({'id': t.id}).count();
        if (count === 0) {
          Transactions.insert(t);
        }
      });
    }));
  },
});