

var computeBuyAmount = function(price) {
  var balance = Session.get("balance");
  var availableWithoutFee = precise_floor((balance.usd_available) / (1 + (balance.fee / 100)),2);
  var amount = availableWithoutFee / price;
  // round to 8 decimals:
  return precise_floor(amount,8);
};

var computeSellAmount = function(price) {
  var balance = Session.get("balance");
  return balance.btc_available;
};

var precise_floor = function (num,decimals){
  return Math.floor(num*Math.pow(10,decimals))/Math.pow(10,decimals);
};

Template.balance.helpers({
  valueClass: function (value) { return value > 0 ? "" : "text-muted"; },

  b: function () {
    var lastBalance = Balances.findOne({}, {sort: {"timestamp": -1}});
    if (lastBalance) {
      var d = new Date(1000*parseInt(lastBalance.timestamp));
      lastBalance.date = d.toLocaleDateString();
      lastBalance.time = d.toLocaleTimeString();
      Session.set("balance",lastBalance);
      return lastBalance;
    }
  }
});

Template.ticker.helpers({
  ticker: function() {
    var lastTicker = Tickers.findOne({}, {sort: {"timestamp": -1}});
    if (lastTicker) {
      var d = new Date(1000*parseInt(lastTicker.timestamp));
      lastTicker.date = d.toLocaleDateString();
      lastTicker.time = d.toLocaleTimeString();
      Session.set("ticker",lastTicker);
      return lastTicker;
    }
  }
});

Template.ticker.events({
    'click #ticker-refresh': function () {
      Meteor.call("ticker");
      return false;
    }
});

Template.buy.helpers({
  available: function () {
    var balance = Session.get("balance");
    return balance ? balance.usd_available : '-';
  },
  best: function () {
    var ticker = Session.get("ticker");
    return ticker ? ticker.ask : '-';
  },
  panel_type: function () {
    var balance = Session.get("balance");
    return balance && balance.usd_available > 0 ? 'panel-success' : 'panel-default';
  }
});
Template.buy.events({
  'click #buy-best': function () {
    var price = $('#buy-best').text();
    $('#buy-price').val(price);
  },
  'click #buy-clear': function () {
    $('#buy-price').val('');
  },
  'click #buy-dec': function () {
    var priceTxt = $('#buy-price').val().trim();
    if (priceTxt == "") priceTxt = $('#buy-best').text();
    $('#buy-price').val(parseFloat(priceTxt)-1);
  },
  'click #buy-inc': function () {
    var priceTxt = $('#buy-price').val().trim();
    if (priceTxt == "") priceTxt = $('#buy-best').text();
    $('#buy-price').val(parseFloat(priceTxt)+1);
  },
  'click #buy-button': function () {
    var price = $('#buy-price').val().trim();
    if (price == "") price = $('#buy-best').text();
    console.log('Buying at '+price);
    Meteor.call("buy", computeBuyAmount(price),  price);
    return false;
  }
});

Template.sell.helpers({
  available: function () {
    var balance = Session.get("balance");
    return balance ? balance.btc_available : '-';
  },
  best: function () {
    var ticker = Session.get("ticker");
    return ticker ? ticker.bid : '-';
  },
  panel_type: function () {
    var balance = Session.get("balance");
    return balance && balance.btc_available > 0 ? 'panel-success' : 'panel-default';
  }
});
Template.sell.events({
    'click #sell-best': function () {
      var price = $('#sell-best').text();
      $('#sell-price').val(price);
    },
    'click #sell-clear': function () {
      $('#sell-price').val('');
    },
    'click #sell-dec': function () {
      var priceTxt = $('#sell-price').val().trim();
      if (priceTxt == "") priceTxt = $('#sell-best').text();
      $('#sell-price').val(parseFloat(priceTxt)-1);
    },
    'click #sell-inc': function () {
      var priceTxt = $('#sell-price').val().trim();
      if (priceTxt == "") priceTxt = $('#sell-best').text();
      $('#sell-price').val(parseFloat(priceTxt)+1);
    },
    'click #sell-button': function () {
      var price = $('#sell-price').val().trim();
      if (price == "") price = $('#sell-best').text();
      console.log('Selling at '+price);
      Meteor.call("sell", computeSellAmount(price),  price);
      return false;
    }
});

Template.user_transactions.helpers({
  transactions: function() {
    return Transactions.find({}, {sort: {"id": -1}});
  },
  typeText: function() {
    switch(this.type) {
      case 0: return "deposit";
      case 1: return "withdrawal";
      case 2: return (this.usd < 0) ? "buy" : "sell";
    }
  },
  rate: function() {
    return -1 * Math.round( 100 * this.usd / this.btc) / 100;
  },
});

Template.open_orders.helpers({
  orders: function() {
    return Orders.find({}, {sort: {"id": -1}});
  },
  hasOrders: function() {
    return Orders.find({}).count() > 0;
  },
  orderTypeIs: function (type) {
    return (this.type == type);
  },
  panel_type: function () {
    return Orders.find({}).count() > 0 ? 'panel-success' : 'panel-default';
  }
});
Template.open_orders.events({
    'click .cancel': function () {
      Meteor.call("cancel_order", this.id);
      return false;
    },
    'click #open-orders-refresh': function () {
      Meteor.call("open_orders");
      return false;
    }
});