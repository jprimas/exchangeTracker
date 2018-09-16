class PurseDao {

	constructor(dao) {
		this.dao = dao
	}

	create(loginId) {
		return this.dao.run(
			'INSERT INTO purses (login_id, total_fees, total_usd_invested) VALUES (?, 0, 0)',
			[loginId]);
	}

	update(purse) {
		const { id, totalFees, totalUsdInvested, lastTrxDate } = purse;
		return this.dao.run('UPDATE questions SET total_fees = ?, total_usd_invested = ?, last_trx_date = ? WHERE id = ?',
			[totalFees, totalUsdInvested, lastTrxDate, id]);
	}

	getById(id) {
		return this.dao.get('SELECT * FROM purses WHERE id = ?', [id]);
	}

	getByLoginId(loginId) {
		return this.dao.get('SELECT * FROM purses where login_id = ?', [loginId]);
	}

}

module.exports = PurseDao;