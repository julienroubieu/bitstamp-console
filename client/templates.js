

var computeBuyAmount = function(price) {
  var balance = Session.get("balance");
  var availableWithoutFee = precise_floor(balance.usd_available / (1 + (balance.fee / 100)),2);
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

Template.balance.r = function () {
  var lastBalance = Balances.findOne({}, {sort: {"timestamp": -1}});
  if (lastBalance) {
    var d = new Date(1000*parseInt(lastBalance.timestamp));
    lastBalance.date = d.toLocaleDateString();
    lastBalance.time = d.toLocaleTimeString();
    Session.set("balance",lastBalance);
    return lastBalance;
  }
};

Template.ticker.ticker = function() {
  var lastTicker = Tickers.findOne({}, {sort: {"timestamp": -1}});
  if (lastTicker) {
    var d = new Date(1000*parseInt(lastTicker.timestamp));
    lastTicker.date = d.toLocaleDateString();
    lastTicker.time = d.toLocaleTimeString();
    Session.set("ticker",lastTicker);
    return lastTicker;
  }
};

Template.buy.available = function () {
  var balance = Session.get("balance");
  return balance ? balance.usd_available : '-';
};
Template.buy.best = function () {
  var ticker = Session.get("ticker");
  return ticker ? ticker.ask : '-';
};
Template.buy.events({
    'dblclick #buy-best': function () {
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
    }
});


Template.sell.available = function () {
  var balance = Session.get("balance");
  return balance ? balance.btc_available : '-';
};
Template.sell.best = function () {
  var ticker = Session.get("ticker");
  return ticker ? ticker.bid : '-';
};
Template.sell.events({
    'dblclick #sell-best': function () {
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
    }
});

Template.user_transactions.transactions = function() {
  return Transactions.find({}, {sort: {"id": -1}});
};

Template.open_orders.orders = function() {
  return Orders.find({}, {sort: {"id": -1}});
};
Template.open_orders.events({
    'click .cancel': function () {
      Meteor.call("cancel_order", this.id);
    }
});