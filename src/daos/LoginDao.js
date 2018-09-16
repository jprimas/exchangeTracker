class LoginDao {

	constructor(dao) {
		this.dao = dao
	}

	create(email,
		binanceApiKey,
		binanceApiSecret,
		gdaxApiKey,
		gdaxApiSecret,
		gdaxApiPassphrase,
		coinbaseApiKey,
		coinbaseApiSecret) {
		return this.dao.run('INSERT INTO logins ' +
			'(email, binance_api_key, binance_api_secret, gdax_api_key, gdax_api_secret, gdax_api_passphrase, coinbase_api_key, coinbase_api_secret) ' + 
			'VALUES ' + 
			'(?, ?, ?, ?, ?, ?, ?, ?)',
			[email, binanceApiKey, binanceApiSecret, gdaxApiKey, gdaxApiSecret, gdaxApiPassphrase, coinbaseApiKey, coinbaseApiSecret]);
	}

	getById(id) {
		return this.dao.get('SELECT * FROM logins WHERE id = ?', [id]);
	}

	getByEmail(email) {
		return this.dao.get('SELECT * FROM logins where email = ?', [email]);
	}

}

module.exports = LoginDao 