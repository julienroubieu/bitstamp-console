if (Meteor.isClient) {

  Template.balance.r = function () {
    return {
      'usd_available': 12.0,
      'usd_reserved': 5.0,
      'btc_available': 97.0,
      'btc_reserved': 0,
    };
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
