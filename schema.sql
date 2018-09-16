CREATE TABLE logins (
	id INTEGER PRIMARY KEY,
	email TEXT NOT NULL,
	binance_api_key TEXT,
	binance_api_secret TEXT,
	gdax_api_key TEXT,
	gdax_api_secret TEXT,
	gdax_api_passphrase TEXT,
	coinbase_api_key TEXT,
	coinbase_api_secret TEXT,
	created_date DATETIME default current_timestamp NOT NULL,
	updated_date DATETIME default current_timestamp NOT NULL
);

CREATE TABLE purses (
	id INTEGER PRIMARY KEY,
	login_id INTEGER NOT NULL,
	total_fees REAL,
	total_usd_invested REAL,
	last_trx_date DATETIME,
	created_date DATETIME default current_timestamp NOT NULL,
	updated_date DATETIME default current_timestamp NOT NULL,
	FOREIGN KEY (login_id) REFERENCES logins (id) 
);

CREATE TABLE coins (
	id INTEGER PRIMARY KEY,
	purse_id INTEGER NOT NULL,
	symbol TEXT NOT NULL,
	amount REAL,
	total_purchase_price REAL,
	created_date DATETIME default current_timestamp NOT NULL,
	updated_date DATETIME default current_timestamp NOT NULL,
	FOREIGN KEY (purse_id) REFERENCES purses (id) 
);