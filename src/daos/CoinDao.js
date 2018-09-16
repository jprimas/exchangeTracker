class CoinDao {

	constructor(dao) {
		this.dao = dao
	}

	create(purseId, symbol) {
		return this.dao.run(
			'INSERT INTO coins (purse_id, symbol, amount, total_purchase_price) VALUES (?, ?, 0, 0)',
			[purseId, symbol]);
	}

	update(coinData) {
		const { id, amount, totalPurchasePrice } = coinData;
		return this.dao.run('UPDATE coins SET amount = ?, total_purchase_price = ?, updated_date = now() WHERE id = ?',
			[amount, totalPurchasePrice, id]);
	}

	getById(id) {
		return this.dao.get('SELECT * FROM coins WHERE id = ?', [id]);
	}

	getByPurseId(purseId) {
		return this.dao.all('SELECT * FROM coins where purse_id = ?', [purseId]);
	}

}

module.exports = CoinDao;