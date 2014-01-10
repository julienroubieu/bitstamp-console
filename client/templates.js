
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
Template.buy.last = function () {
  var ticker = Session.get("ticker");
  return ticker ? ticker.last : '-';
};
Template.buy.events({
    'dblclick #buy-last': function () {
      var price = $('#buy-last').text();
      $('#buy-price').val(price);
    },
    'click #buy-clear': function () {
      $('#buy-price').val('');
    },
    'click #buy-dec': function () {
      var priceTxt = $('#buy-price').val().trim();
      if (priceTxt == "") priceTxt = $('#buy-last').text();
      $('#buy-price').val(parseFloat(priceTxt)-1);
    },
    'click #buy-inc': function () {
      var priceTxt = $('#buy-price').val().trim();
      if (priceTxt == "") priceTxt = $('#buy-last').text();
      $('#buy-price').val(parseFloat(priceTxt)+1);
    },
    'click #buy-button': function () {
      var price = $('#buy-price').val().trim();
      if (price == "") price = $('#buy-last').text();
      console.log('Buying at '+price);
      //Meteor.call("buy_all", price);
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