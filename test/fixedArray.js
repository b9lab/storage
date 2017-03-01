var FixedArray = artifacts.require("./FixedArray.sol");
const Extensions = require("../utils/extensions.js");
Extensions.init(web3, assert);

contract('FixedArray', accounts => {

    var user1;

    before("should prepare accounts", () => {
        assert.isAtLeast(accounts.length, 1, "should have at least 1 account");
        user1 = accounts[0];
        return Extensions.makeSureAreUnlocked([ user1 ])
            .then(() => Extensions.makeSureHasAtLeast(user1, [ user1 ], web3.toWei(0.5)));
    });

    var instance;

    beforeEach("should deploy a new instance", () => {
        return FixedArray.new({ from: user1 })
            .then(created => {
                instance = created;
            })

    });

    it("should have 0 on construction", () => {
        var requests = [];
        for (var i = 0; i < 4; i++) {
            requests.push(instance.storageArray(i));
        }
        return Promise.all(requests)
            .then(numbers => {
                numbers.forEach((number, index) => {
                    assert.strictEqual(number.toNumber(), 0, "should start at 0 on constructor, index " + index);
                });
                requests = [];
                for (var i = 0; i < 4; i++) {
                    requests.push(web3.eth.getStorageAtPromise(instance.address, i));
                }
                return Promise.all(requests);
            })
            .then(numbers => {
                numbers.forEach((number, index) => {
                    assert.strictEqual(
                        web3.toBigNumber(number).toNumber(),
                        0,
                        "should start at 0 on constructor, index " + index);  
                });
            });
    });

    it("should be possible to set values", () => {
        var requests = instance.setAt(0, 1, { from: user1, gas: 3000000 });
        for (var i = 1; i < 4; i++) {
            requests = Promise.all([
                    requests,
                    Promise.resolve(i)
                ])
                .then((txInfoAndIndex) => {
                    assert.isBelow(txInfoAndIndex[0].receipt.gasUsed, 3000000, "should not have used all the gas");
                    return instance.setAt(txInfoAndIndex[1], txInfoAndIndex[1] + 1, { from: user1, gas: 3000000 });
                });
        }
        return requests
            .then(txInfo => {
                assert.isBelow(txInfo.receipt.gasUsed, 3000000, "should not have used all the gas");
                requests = [];
                for (var i = 0; i < 4; i++) {
                    requests.push(instance.storageArray(i));
                }
                return Promise.all(requests);
            })
            .then(numbers => {
                numbers.forEach((number, index) => {
                    assert.strictEqual(number.toNumber(), index + 1, "should have been updated, index " + index);
                });
                requests = [];
                for (var i = 0; i < 4; i++) {
                    requests.push(web3.eth.getStorageAtPromise(instance.address, i));
                }
                return Promise.all(requests);
            })
            .then(numbers => {
                numbers.forEach((number, index) => {
                    assert.strictEqual(
                        web3.toBigNumber(number).toNumber(),
                        index + 1,
                        "should have updated storage, index " + index);  
                });
            });
    });

});