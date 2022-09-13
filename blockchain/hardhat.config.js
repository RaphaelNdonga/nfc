require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const tdly = require("@tenderly/hardhat-tenderly");

tdly.setup({ automaticVerifications: true });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY_KEY}`,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2]
    }
  },
  tenderly: {
    project: 'project',
    username: 'ndonga'
  }
};
