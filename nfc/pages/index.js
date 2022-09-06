import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import "bulma/css/bulma.css";
import { useState } from 'react';
import NFCJSON from './NFC.json';
import Web3 from "web3";
import { create } from "ipfs-http-client";

export default function Home() {
  const projectId = "2EOa6dNYowZzjK9u2lexz7yqWLA";
  const projectSecret = "cda9ecceee45c322470cdde0596235cb";
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v0',
    headers: {
      authorization: auth
    }
  });
  const [connected, setConnected] = useState(false);
  const [isJSON, setIsJSON] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState("");
  const monthArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  const connectMetamask = async () => {
    console.log("window.ethereum: ", window.ethereum);
    if (window.ethereum === undefined) {
      alert("Please install metamask to use this dapp");
      return
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts[0]) {
      console.log("setting connected to true");
      setConnected(true);
    } else {
      console.log("setting connected to false");
      setConnected(false);
    }
    console.log("accounts: ", accounts);
  }

  const parseJSON = async () => {
    let owners = [];
    let urls = [];
    try {
      const studentData = eval(textAreaValue);
      console.log("Text area contains: ", studentData);
      for (let i = 0; i < studentData.length; i++) {
        const properties = eval(studentData[i]);
        const ipfsJSON = {
          title: "JKUAT GRADUATE CERTIFICATE",
          type: "certificate",
          properties
        }
        console.log("ipfs JSON", ipfsJSON);
        const ipfsFile = await client.add(JSON.stringify(ipfsJSON));
        const ipfsLink = `https://ipfs.io/ipfs/${ipfsFile.path}`
        console.log(`View file at: ${ipfsLink}`);
        owners.push(properties.address);
        urls.push(ipfsLink);
      }
      console.log("owners: ", owners);
      console.log("urls: ", urls);
      mintCertificates(owners, urls);
    }
    catch (error) {
      alert(`Parse JSON error: ${error.message}`)
    }
  }

  const mintCertificates = async (owners, urls) => {
    const abi = NFCJSON.abi;
    if (window.ethereum == undefined) {
      alert("please install metamask");
      return;
    }
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    console.log("web3 account: ", accounts);
    const NFCContract = new web3.eth.Contract(abi);

    /**
     * The date functionality should eventually be transferred to the smart contract.
     */
    let date = new Date();
    let month = monthArray[date.getMonth()];
    let year = date.getFullYear();
    const deployment = await NFCContract.deploy({
      data: NFCJSON.bytecode,
      arguments: [`GRADUATES-${month}-${year}`, "JKUAT", owners, urls]
    }).send({
      from: accounts[0]
    });
    console.log("NFC Contract: ", deployment);
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Non Fungible Certificates</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className='navbar m-6'>
          <div className='navbar-brand'>
            <h1 className='title is-2'>Non Fungible Certificates</h1>
          </div>
          <div className='navbar-end'>

            {connected ? <button className='button is-primary' disabled>Connected</button> : <button className='button is-primary' onClick={connectMetamask}>Connect Wallet</button>}
          </div>

        </div>
        <div className='container m-6'>
          <p className='is-size-3 mb-2'>How would you like to generate graduate certificates?</p>
          <section className='box is-clickable' onClick={() => {
            setIsJSON(!isJSON);
          }}>
            <p>Insert JSON</p>
          </section>
          {isJSON && <section>
            <textarea className='textarea' onChange={(e) => {
              setTextAreaValue(e.target.value);
            }}></textarea>
            <button className='button is-primary mt-3 mb-3' onClick={() => {
              parseJSON()
            }}>Submit</button>
          </section>
          }
          <section className='box is-clickable'>
            <p>Insert CSV</p>
          </section>
          <section className='box is-clickable'>
            <p>Insert one by one</p>
          </section>
        </div>

      </main>
    </div>
  )
}
