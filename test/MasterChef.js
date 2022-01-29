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
        MasterChef = await _MasterChef.deploy(Token.address, '100', '1');
        await MasterChef.deployed();
    });

    it("Test withdraw lock", async function () {
        await MasterChef.addPool('1', Token.address,
            0,3600,0,0,false,0);

        await Token.mint(userAddress, '100');

        await Token.transferOwnership(MasterChef.address);
        await Token.connect(user).approve(MasterChef.address, '100');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('100');

        await MasterChef.connect(user).deposit('0', '100');

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('0');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('0');

        await expect(
            MasterChef.connect(user).withdraw('0', '100')
            ).to.be.revertedWith('withdraw still locked');;

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('0'); // token + reward

        await network.provider.send("evm_increaseTime", [3600])
        await network.provider.send("evm_mine")

        await MasterChef.connect(user).withdraw('0', '100')

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('400'); // token + reward

    });


    it("Tax Single Deposit", async function () {
        await MasterChef.addPool('1', Token.address,
            0,0,0,1000,false,0);

        await Token.mint(userAddress, '100');

        await Token.transferOwnership(MasterChef.address);
        await Token.connect(user).approve(MasterChef.address, '100');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('100');

        await MasterChef.connect(user).deposit('0', '100');

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('10');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('0');

        await MasterChef.connect(user).withdraw('0', '90');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('189'); // token + reward

    });

    it("Tax Single Withdraw", async function () {
        await MasterChef.addPool('1', Token.address,
            1000,0,0,0,false,0);

        await Token.mint(userAddress, '100');

        await Token.transferOwnership(MasterChef.address);
        await Token.connect(user).approve(MasterChef.address, '100');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('100');

        await MasterChef.connect(user).deposit('0', '100');

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('0');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('0');

        await MasterChef.connect(user).withdraw('0', '90');

        await expect( (await Token.balanceOf(userAddress)).toString())
            .to.be.eq('181'); // token + reward

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('19');

    });

    it("Single Deposit/Withdraw", async function () {
        await MasterChef.addPool('1', Token.address,
            0,0,0,0,false,0);
        await Token.mint(devAddress, '1');
        await Token.transferOwnership(MasterChef.address);
        await Token.approve(MasterChef.address, '1');
        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('1');
        await MasterChef.deposit('0', '1');
        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('0');
        await MasterChef.withdraw('0', '1');
        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('111'); // token + reward

    });

    it("Multiple Deposit/Withdraw", async function () {

        await MasterChef.addPool('1', Token.address,
            0,0,0,0,false,0);

        await Token.mint(devAddress, '1');
        await Token.mint(userAddress, '1');
        await Token.mint(noneAddress, '1');

        await Token.transferOwnership(MasterChef.address);

        await Token.approve(MasterChef.address, '1');
        await Token.connect(user).approve(MasterChef.address, '1');
        await Token.connect(none).approve(MasterChef.address, '1');

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('1');

        await MasterChef.deposit('0', '1');
        await MasterChef.connect(user).deposit('0', '1');
        await MasterChef.connect(none).deposit('0', '1');

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('20');

        await MasterChef.withdraw('0', '1');
        await MasterChef.connect(user).withdraw('0', '1');
        await MasterChef.connect(none).withdraw('0', '1');

        await expect( (await Token.balanceOf(devAddress)).toString())
            .to.be.eq('234'); // token + reward

        await expect( (await Token.connect(user).balanceOf(devAddress)).toString())
            .to.be.eq('234'); // token + reward

        await expect( (await Token.connect(none).balanceOf(devAddress)).toString())
            .to.be.eq('234'); // token + reward

    });

    it("Security", async function () {

        await expect( MasterChef.connect(user).updateTokenPerBlock('1'))
            .to.be.reverted;

        await expect( MasterChef.connect(user).updateMultiplier('1'))
            .to.be.reverted;

        await expect(
            MasterChef.connect(user).addPool(
                '1', Token.address, 0, 0, 0, 0, false, 0) )
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
