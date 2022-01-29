const web3 = require('web3');
const {expect} = require("chai");
const {ethers, waffle} = require("hardhat");
const provider = waffle.provider;
let dev, user, none, devAddress, userAddress, noneAddress;
let MasterChef, Token;
describe("MasterChef", function () {
    beforeEach(async function () {
        [dev, user, none] = await ethers.getSigners();
        devAddress = dev.address,
            userAddress = user.address,
            noneAddress = none.address;
        const _Token = await ethers.getContractFactory("Token");
        Token = await _Token.deploy("test", "test");
        await Token.deployed();

        const _MasterChef = await ethers.getContractFactory("MasterChef");
        MasterChef = await _MasterChef.deploy(Token.address, '1', '1');
        await MasterChef.deployed();
    });

    it("Security", async function () {

        await expect( MasterChef.connect(user).updateTokenPerBlock('1'))
            .to.be.reverted;

        await expect( MasterChef.connect(user).updateMultiplier('1'))
            .to.be.reverted;

        await expect(
            MasterChef.connect(user).addPool(
                '1', Token.address, 0, 0, 0, 0, 0, false, 0) )
            .to.be.reverted;

        await expect(
            MasterChef.connect(user).setupLocks(
                '0', '0', 0, 0, 0, 0, 0) )
            .to.be.reverted;

        await expect(
            MasterChef.connect(user).changePoolAllocation('0', '0')
        ).to.be.reverted;

        await expect(
            MasterChef.connect(user).dev(userAddress)
        ).to.be.reverted;

        await expect(
            MasterChef.connect(user).setDevFee('1')
        ).to.be.reverted;

    });
});
