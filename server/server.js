if (Meteor.isServer) {

  var Bitstamp = Meteor.require('bitstamp');
  var publicBitstamp = new Bitstamp();
  var conf = Assets.getBinary('bitstamp.config');
  var privateBitstamp = new Bitstamp(conf.key, conf.secret, conf.client_id);

  Meteor.startup(function () {
    Meteor.setInterval(function() {
      Meteor.call("ticker");
    }, 5*1000);
    Meteor.setInterval(function() {
      Meteor.call("balance");
    }, 30*1000);
  });

  Meteor.methods({
    ticker: function() {
      publicBitstamp.ticker(Meteor.bindEnvironment(function(err, ticker) {
        var lastTicker = Tickers.findOne({}, {sort: {timestamp: -1}});
        if (lastTicker.timestamp != ticker.timestamp) {
          Tickers.insert(ticker);
        }
      }));
    },
    balance: function() {
      privateBitstamp.balance(Meteor.bindEnvironment(function(err, balance) {
        if (err) throw err;
        Balances.insert(balance);
      }));
    },
  });

}