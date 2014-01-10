
Tickers = new Meteor.Collection("tickers");

if (Meteor.isClient) {

  Template.balance.r = function () {
    return {
      'usd_available': 12.0,
      'usd_reserved': 5.0,
      'btc_available': 97.0,
      'btc_reserved': 0,
    };
  };

  Template.ticker.ticker = function() {
    var lastTicker = Tickers.findOne({}, {sort: {timestamp: -1}});
    if (lastTicker) {
      console.log(typeof(lastTicker));
      var d = new Date(1000*parseInt(lastTicker.timestamp));
      lastTicker.date = d.toLocaleDateString();
      lastTicker.time = d.toLocaleTimeString();
    }
    //var tst = EJSON.parse(lastTicker).timestamp;
    //
    return lastTicker;
  };
}

if (Meteor.isServer) {

  var Bitstamp = Meteor.require('bitstamp');
  var publicBitstamp = new Bitstamp();

  Meteor.startup(function () {
    Meteor.setInterval(function() {
      Meteor.call("ticker");
    }, 5000);
  });

  Meteor.methods({
    ticker: function() {
      publicBitstamp.ticker(Meteor.bindEnvironment(function(err, ticker) {
        var lastTicker = Tickers.findOne({}, {sort: {timestamp: -1}});
        if (lastTicker.timestamp != ticker.timestamp) {
          Tickers.insert(ticker);
        }
      }));
    }
  });

}