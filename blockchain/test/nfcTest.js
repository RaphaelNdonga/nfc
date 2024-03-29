const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

describe("NFC Test", function () {
    let NFC;
    let acc1;
    let acc2;
    let dummyOwners = ["0xF5591E14eB99aB51C10ba75DabA7d0D6345293eb", "0x9211cd5a0940FA9F71bcbcF1d45b0EC20Cb62A38"];
    let dummyUrls = ["https://ipfs.io/1", "https://ipfs.io/2"];
    this.beforeAll(async function () {
        [acc1, acc1] = await ethers.getSigners();
        let NFCFactory = await ethers.getContractFactory("NFC");
        NFC = await NFCFactory.deploy("JKUAT-GRADUATES-2022", "JKUAT Certificate", dummyOwners, dummyUrls);
        await NFC.deployed();
    });
    it("has correct owners", async () => {
        let owner1 = await NFC.ownerOf(1);
        expect(owner1).equal(dummyOwners[0])
        let owner2 = await NFC.ownerOf(2);
        expect(owner2).equal(dummyOwners[1])
    })
    it("NFC deployed", async () => {
        console.log("NFC: ", NFC.abi);
        expect(NFC).not.null
        fs.copyFileSync(__dirname + "/../artifacts/contracts/NFC.sol/NFC.json", __dirname + "/../../nfc-dapp/pages/NFC.json")
    })
    it("should increase the counter", async () => {
        let counter = await NFC.counter();
        console.log("Counter: ", counter);
        expect(counter.gt(1)).true
    })
})