# Exchange Tracker

#### [This project is currently live!](https://the-exchange-tracker.herokuapp.com)
## Overview
The goal of this project was to create a website that summarizes a users current crypto investments. By hooking into various crypto exchanges it performs an anlysis of all the user's deposits, withdrawals, and trades to provide a concise picture of the user's current investments.
Currently, the website provides four summaries
#### 1. Investment Summary
This section provides a summary of the users entire holdings across all coins. It highlights how much total USD the user has currently invested, how much the user has gained or lost overtime, and how much the user have paid in fees. 
#### 2. Coin Breakdown
This section provides a summary of each individual type of coin the user owns. Each type of coin the user owns is listed alongside the total amount they own and the percentage gain.
#### 3. Transaction History
This section lists all deposits, withdrawls, and trades the user has ever performed on any of the connected exchanges.
#### 4. Taxes
Lastly, this section provides the user with the ability to calculate capital gains and losses. It also estimates how much taxes the user will need to pay given the year and their estimated net income.

### Crypto Exchanges
This project is centered around performing analysis over multiple crypto exchanges. Currently, it has the ability to hook into three exchanges. Yet more will be added in the future!
1. Coinbase
2. GDAX
3. Binance

### Technology Stack
1. Node.js with Express for the server
2. React for the frontend framework
3. Sequelize as the ORM
4. Sqlite as the test DB
5. Mysql as the production DB
6. Heroku for deployment
7. bcrypt and express-sessions for authentication

#### Demo of the homepage:
![Homepage](https://github.com/jprimas/exchangeTracker/blob/master/readme/homepage.png)
