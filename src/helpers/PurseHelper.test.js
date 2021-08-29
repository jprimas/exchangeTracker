const PurseHelper = require("./PurseHelper")
// @ponicode
describe("handleTrade", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst.handleTrade({ amount: 800.39, price: 1, totalPurchasePrice: 10000, totalUsdInvested: 12345, toSymbol: ".", fromSymbol: "." })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.handleTrade({ amount: 0.0, price: 0.0, totalPurchasePrice: 10000, totalUsdInvested: 987650, toSymbol: "C:\\\\path\\to\\file.ext", fromSymbol: "C:\\\\path\\to\\file.ext" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.handleTrade({ amount: 10, price: 1, totalPurchasePrice: 0, totalUsdInvested: 987650, toSymbol: "/path/to/file", fromSymbol: "C:\\\\path\\to\\file.ext" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.handleTrade({ amount: -1, price: 0.0, totalPurchasePrice: 300, totalUsdInvested: "bc23a9d531064583ace8f67dad60f6bb", toSymbol: "path/to/file.ext", fromSymbol: "/path/to/file" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst.handleTrade({ amount: 170.04, price: -10, totalPurchasePrice: 0, totalUsdInvested: "a1969970175", toSymbol: ".", fromSymbol: "." })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.handleTrade(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleWithdrawl", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst.handleWithdrawl({ amount: 170.04, lastTrxDate: "32-01-2020", timestamp: "2017-09-29T19:01:00.000" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.handleWithdrawl({ amount: 467.94, lastTrxDate: "01-01-2020", timestamp: "Mon Aug 03 12:45:00" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.handleWithdrawl({ amount: -100, lastTrxDate: "01-01-2020", timestamp: "2017-09-29T19:01:00.000" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.handleWithdrawl({ amount: 358.46, lastTrxDate: "01-01-2030", timestamp: "2017-09-29T19:01:00.000" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst.handleWithdrawl({ amount: 358.46, lastTrxDate: "32-01-2020", timestamp: "Mon Aug 03 12:45:00" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.handleWithdrawl(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_handleCommission", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._handleCommission({ commissionAmount: -1, comissionAsset: "^5.0.0", timestamp: "01:04:03" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst._handleCommission({ commissionAmount: -1, comissionAsset: "4.0.0-beta1\t", timestamp: "01:04:03" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst._handleCommission({ commissionAmount: 1, comissionAsset: "v1.2.4", timestamp: "Mon Aug 03 12:45:00" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst._handleCommission({ commissionAmount: 0, comissionAsset: "v4.0.0-rc.4", timestamp: "2017-09-29T19:01:00.000" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst._handleCommission({ commissionAmount: 100, comissionAsset: "^5.0.0", timestamp: "2017-09-29T23:01:00.000Z" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst._handleCommission({ commissionAmount: NaN, comissionAsset: "", timestamp: "" })
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_addUsd", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._addUsd(800.39)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst._addUsd(100)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst._addUsd(170.04)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst._addUsd(-1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst._addUsd(-100)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst._addUsd(-Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_addCoin", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._addCoin("Lithuanian Litas", 800.39)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst._addCoin("Rufiyaa", 170.04)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst._addCoin("Nakfa", -1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst._addCoin("Netherlands Antillian Guilder", 800.39)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst._addCoin("Tunisian Dinar", 170.04)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst._addCoin("", Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("postProcessPurse", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst.postProcessPurse()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_postProcessCoins", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._postProcessCoins()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_persistPurseAndCoins", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._persistPurseAndCoins()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_getCoin", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._getCoin("Netherlands Antillian Guilder")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst._getCoin("Tunisian Dinar")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst._getCoin("Rufiyaa")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst._getCoin("Lithuanian Litas")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst._getCoin("Nakfa")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst._getCoin(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_createCoin", () => {
    let inst

    beforeEach(() => {
        inst = new PurseHelper()
    })

    test("0", () => {
        let callFunction = () => {
            inst._createCoin("Lithuanian Litas")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst._createCoin("Netherlands Antillian Guilder")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst._createCoin("Rufiyaa")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst._createCoin("Nakfa")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst._createCoin("Tunisian Dinar")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst._createCoin(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
