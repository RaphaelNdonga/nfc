import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import "bulma/css/bulma.css";
import { useEffect, useState } from 'react';
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
  const [isCSV, setIsCSV] = useState(false);
  const [jsonTextArea, setJsonTextArea] = useState("");
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
  const dayArray = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
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
      const studentData = eval(jsonTextArea);
      console.log("Text area contains: ", studentData);
      for (let i = 0; i < studentData.length; i++) {
        const attributes = eval(studentData[i]);
        let svgLink = `<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 500 350'><style>.base { fill: white; font-family: serif; font-size: 16px; }</style><rect width='100%' height='100%' fill='black' /><text x='10%' y='40%' class='base' dominant-baseline='middle' text-anchor='start'>Name: ${attributes.name}</text><text x='10%' y='50%' class='base' dominant-baseline='middle' text-anchor='start'>Degree awarded: ${attributes.course}</text><text x='10%' y='60%' class='base' dominant-baseline='middle' text-anchor='start'>Honors: ${attributes.honors}</text></svg>`
        let imageData = btoa(svgLink);
        let imageLink = `data:image/svg+xml;base64,${imageData}`;
        console.log("image link: ", imageLink);
        const date = new Date();
        const day = date.getDay();
        const dateNumber = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const ipfsJSON = {
          name: "JKUAT GRADUATE CERTIFICATE",
          image: imageLink,
          description: `This is to certify that ${attributes.name} having satisfied all the requirements for the degree of ${attributes.course} ${attributes.honors} was admitted to the degree at a congregation held at this university on ${dayArray[day]} ${dateNumber} of ${monthArray[month]} in the year ${year}`,
          attributes: [
            {
              trait_type: "name",
              value: attributes.name
            },
            {
              trait_type: "honors",
              value: attributes.honors
            }, {
              trait_type: "course",
              value: attributes.course
            },
          ]
        }
        console.log("ipfs JSON", ipfsJSON);
        const ipfsFile = await client.add(JSON.stringify(ipfsJSON));
        const ipfsLink = `https://ipfs.io/ipfs/${ipfsFile.path}`
        console.log(`View file at: ${ipfsLink}`);
        owners.push(attributes.address);
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

  useEffect(() => {
    async function checkConnection() {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts[0]) {
        setConnected(true);
      }
    }
    checkConnection();

  }, []);


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
            <textarea id='jsonTextArea' placeholder='Drag and Drop JSON File or Type JSON here...' className='textarea' onDrop={(e) => {
              e.preventDefault();
              const fileReader = new FileReader();
              fileReader.addEventListener("load", () => {
                console.log(fileReader.result);
                const textArea = document.getElementById("jsonTextArea");
                textArea.value = fileReader.result;
                setJsonTextArea(textArea.value);
              });
              const file = e.dataTransfer.files.item(0)
              fileReader.readAsText(file);
            }} onChange={(e) => {
              setJsonTextArea(e.target.value);
            }}></textarea>
            <button className='button is-primary mt-3 mb-3' onClick={() => {
              parseJSON()
            }}>Submit</button>
          </section>
          }
          <section className='box is-clickable' onClick={() => {
            setIsCSV(!isCSV);
          }}>
            <p>Insert CSV</p>
          </section>
          {isCSV && <section><textarea className='textarea' placeholder='Drag and Drop CSV File or Type CSV here...'></textarea><button className='button is-primary mt-3 mb-3' onClick={() => {

          }}>Submit</button></section>}


          <section className='box is-clickable'>
            <p>Insert one by one</p>
          </section>
        </div>

      </main >
    </div >
  )
}
