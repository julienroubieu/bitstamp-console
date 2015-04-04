# Bitstamp Control Center

A [Meteor](https://www.meteor.com/) [Bitstamp](https://www.bitstamp.net) console, running in your browser.
It allows you to monitor the market through BitcoinWisdom and easily place limit orders.

## Install

* Install [Meteor](https://www.meteor.com/)
* Create and activate an API Key from your Bitstamp account (Account > Security > API Access). Make sure to check the following permissions:
  * Account Balance
  * User transactions
  * Open orders
  * Cancel order
  * Buy limit orders
  * Sell limit orders
* Copy `private/bitstamp.config.sample` to `private/bitstamp.config` and configure with your API key.

## Run

* Run `meteor run`

