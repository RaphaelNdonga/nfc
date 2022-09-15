## [NFC DEMO]("https://non-fungible-certificates.netlify.app/")

## WHAT IS NFC?
NFC is an acronym for Non Fungible Certificates.
It is a decentralized platform for issuing digital certificates in the form of Non Fungible Tokens.
It works on any EVM compatible network.

## HOW DOES IT WORK?
### Using the frontend Dapp
After cloning the repo, while in the `nfc-dapp` directory, run the following code in the terminal:

```
npm i
npm run dev
```
The Dapp should be running on http://localhost:3000.

Copy and paste JSON Data or Drag and Drop a JSON file in the following format:
```json
{
[
	{name: "Satoshi Nakamoto", address: "0x9576b63f6C3B36bAee9f975e433283C116499f03", honors: "first class", course: "Computer Science"},
	{name: "Vitalik Buterin", address: "0xF5591E14eB99aB51C10ba75DabA7d0D6345293eb", honors: "second class", course: "Actuarial Science"},
	
]
}
```

Alternatively, you can copy and paste CSV data or Drag and Drop a CSV file in the following format:
```csv
name,address,honors,course
Jane,0x9211cd5a0940FA9F71bcbcF1d45b0EC20Cb62A38,first class,Bsc Computer Science
Joe,0xF5591E14eB99aB51C10ba75DabA7d0D6345293eb,second class, Bsc Actuarial Science
Ndonga,0xB794c178d8D1Bb7B28fCfd80D8cDaE59Df858B74, pass, Bsc Applied Chemistry
```

Submit the data and view it on the relevant Block Explorer.

### Using the deploy script.
In the terminal, while in the `blockchain` directory, run:
```
npm i 
npx hardhat run scripts/deploy.js
```
This will verify the contract on tenderly as well.


If you were using the Rinkeby testnet, the address of your Non Fungible certificate should be available on https://testnets.opensea.io/assets/rinkeby/{your_address}/{tokenId}.
You can just search for your contract address on the OpenSea platform and view it.