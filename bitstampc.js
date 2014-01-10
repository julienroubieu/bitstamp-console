
// Model collections. See Bitstamp API doc for schema
Tickers = new Meteor.Collection("tickers");
Balances = new Meteor.Collection("balances");
Transactions = new Meteor.Collection("transactions");
Orders = new Meteor.Collection("orders");

if (Meteor.isClient) {
	Session.setDefault("balance", {

	});
	Session.setDefault("ticker", {
		
	});
}

if (Meteor.isServer) {

}