// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const NFCFactory = await ethers.getContractFactory("NFC");
  let dummyOwners = ["0xF5591E14eB99aB51C10ba75DabA7d0D6345293eb", "0x9211cd5a0940FA9F71bcbcF1d45b0EC20Cb62A38"];
  let dummyUrls = ["https://ipfs.io/1", "https://ipfs.io/2"];
  const NFC = await NFCFactory.deploy("JKUAT-GRADUATES-2022", "JKUAT Certificate", dummyOwners, dummyUrls);
  await NFC.deployed();
  console.log("NFC: ", NFC);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
