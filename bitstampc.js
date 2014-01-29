
// Model collections. See Bitstamp API doc for schema
Tickers = new Meteor.SmartCollection("tickers");
Balances = new Meteor.SmartCollection("balances");
Transactions = new Meteor.SmartCollection("transactions");
Orders = new Meteor.SmartCollection("orders");

if (Meteor.isClient) {
	Session.setDefault("balance", {

	});
	Session.setDefault("ticker", {
		
	});
}

if (Meteor.isServer) {

}