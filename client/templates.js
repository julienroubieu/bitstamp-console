
Template.balance.r = function () {
  var lastBalance = Balances.findOne({}, {sort: {_id: -1}});
  if (lastBalance) {
    var d = new Date(1000*parseInt(lastBalance.timestamp));
    lastBalance.date = d.toLocaleDateString();
    lastBalance.time = d.toLocaleTimeString();
  }
  return lastBalance;
};

Template.ticker.ticker = function() {
  var lastTicker = Tickers.findOne({}, {sort: {timestamp: -1}});
  if (lastTicker) {
    var d = new Date(1000*parseInt(lastTicker.timestamp));
    lastTicker.date = d.toLocaleDateString();
    lastTicker.time = d.toLocaleTimeString();
  }
  return lastTicker;
};

Template.user_transactions.transactions = function() {
  return Transactions.find({}, {sort: {id: -1}});
};

Template.open_orders.orders = function() {
  return Orders.find({}, {sort: {id: -1}});
};
Template.open_orders.events({
    'click .cancel': function () {
      Meteor.call("cancel_order", this.id);
    }
});