
// Model collections. See Bitstamp API doc for schema
Tickers = new Mongo.Collection("tickers");
Balances = new Mongo.Collection("balances");
Transactions = new Mongo.Collection("transactions");
Orders = new Mongo.Collection("orders");

if (Meteor.isClient) {
	Session.setDefault("balance", {});
	Session.setDefault("ticker", {});
}

if (Meteor.isServer) {

}