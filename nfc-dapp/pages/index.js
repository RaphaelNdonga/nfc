import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import "bulma/css/bulma.css";
import { useEffect, useState } from 'react';
import NFCJSON from './NFC.json';
import Web3 from "web3";
import { create } from "ipfs-http-client";
import * as d3 from "d3";
import { NFTStorage } from "nft.storage";
import ClipLoader from "react-spinners/ClipLoader"

export default function Home() {
  const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNENTc3RTQwODAwRDM2YkYxNUI0Qzk0ODZFZmE4N2I4MEFGM0VBNjAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2Mjc5NzY3MzE2NCwibmFtZSI6Im5mYyJ9.0TgVJUuFUv-2Ff4bnDVKmYurzY0ffGi1xuIyLiotqC4'
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
  const [csvTextArea, setCSVTextArea] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
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
  const connectInjectedWallet = async () => {
    console.log("Here I am ok");
    console.log("window.ethereum: ", window.ethereum);
    if (window.ethereum === undefined) {
      alert("Please install appropriate web3 wallet to use this dapp");
      return
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) {
        console.log("setting connected to true");
        setConnected(true);
      } else {
        console.log("setting connected to false");
        setConnected(false);
      }
      console.log("accounts: ", accounts);
    } catch (error) {
      alert("Please select appropriate web3 wallet to use this dapp")
    }
  }

  const parseJSON = () => {
    try {
      const studentData = eval(jsonTextArea);
      console.log("Text area contains: ", studentData);
      checkFormat(studentData);
      saveToIPFSAndMint(studentData);
    }
    catch (error) {
      if (error instanceof SyntaxError) {
        alert(`${error}: Ensure the format is as follows:
        {
          [
            {name: "...", address: "...", honors: "...", course: "..."},
            {name: "...", address: "...", honors: "...", course: "..."},
            
          ]
          }`)
      } else {
        alert(`Parse JSON Error: ${error}`)
      }
      setDataLoading(false);
    }
  }
  async function saveToIPFSAndMint(studentArray) {
    const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY });
    let owners = [];
    let urls = [];
    for (let i = 0; i < studentArray.length; i++) {
      let studentData = eval(studentArray[i]);
      let svgLink = `<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 500 350'><style>.base { fill: white; font-family: serif; font-size: 16px; }</style><rect width='100%' height='100%' fill='black' /><text x='10%' y='40%' class='base' dominant-baseline='middle' text-anchor='start'>Name: ${studentData.name}</text><text x='10%' y='50%' class='base' dominant-baseline='middle' text-anchor='start'>Degree awarded: ${studentData.course}</text><text x='10%' y='60%' class='base' dominant-baseline='middle' text-anchor='start'>Honors: ${studentData.honors}</text></svg>`;
      let imageData = btoa(svgLink);
      let imageLink = `data:image/svg+xml;base64,${imageData}`;
      console.log("image link: ", imageLink);
      const date = new Date();
      const day = date.getDay();
      const dateNumber = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const blob = new Blob([svgLink], { type: "image/svg+xml" });
      const ipfsJSON = {
        name: "JKUAT GRADUATE CERTIFICATE",
        image: imageLink,
        description: `This is to certify that ${studentData.name} having satisfied all the requirements for the degree of ${studentData.course} ${studentData.honors} was admitted to the degree at a congregation held at this university on ${dayArray[day]} ${dateNumber} of ${monthArray[month]} in the year ${year}`,
        attributes: [
          {
            trait_type: "name",
            value: studentData.name
          },
          {
            trait_type: "honors",
            value: studentData.honors
          }, {
            trait_type: "course",
            value: studentData.course
          },
        ]
      }
      const nftStorageResult = await nftStorage.store({
        name: "JKUAT GRADUATE CERTIFICATE",
        image: blob,
        description: `This is to certify that ${studentData.name} having satisfied all the requirements for the degree of ${studentData.course} ${studentData.honors} was admitted to the degree at a congregation held at this university on ${dayArray[day]} ${dateNumber} of ${monthArray[month]} in the year ${year}`,
        properties: [
          {
            trait_type: "name",
            value: studentData.name
          },
          {
            trait_type: "honors",
            value: studentData.honors
          }, {
            trait_type: "course",
            value: studentData.course
          },
        ]
      })
      console.log("NFT Storage result: ", nftStorageResult);
      console.log("ipfs JSON", ipfsJSON);
      const ipfsFile = await client.add(JSON.stringify(ipfsJSON));
      const ipfsLink = `https://ipfs.io/ipfs/${ipfsFile.path}`
      console.log(`View file at: ${ipfsLink}`);
      owners.push(studentData.address);
      urls.push(ipfsLink);
    }
    console.log("owners: ", owners);
    console.log("urls: ", urls);
    // mintCerts(owners, urls);
  }

  const checkFormat = (studentData) => {
    for (let i = 0; i < studentData.length; i++) {
      if (!studentData[i].name || !studentData[i].address || !studentData[i].honors || !studentData[i].course) {
        throw SyntaxError(`Item number ${i + 1}`);
      }
    }
  }

  async function parseCSV() {
    try {
      const csv = d3.csvParse(csvTextArea);
      console.log("Text area contains: ", csv);
      checkFormat(csv);
      saveToIPFSAndMint(csv);
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert(`${error}: Ensure the format is as follows:
           name   ,   address,      honors,      course
        ..{name}..,..{address}..,..{honors}..,..{course}..
        ..{name}..,..{address}..,..{honors}..,..{course}..`)
      } else {
        alert(`Parse JSON Error: ${error}`)
      }
      setDataLoading(false);
    }
  }

  const otieno = async (owners, urls) => {
    console.log("Here, I am out of my mind");
    if (!owners || !urls) {
      return;
    }
    const abi = NFCJSON.abi;
    if (window.ethereum == undefined) {
      alert("please install metamask");
      return;
    }
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    console.log("We are minting certificates.");
    console.log("web3 account: ", accounts);
    const NFCContract = new web3.eth.Contract(abi);

    /**
     * The date functionality should eventually be transferred to the smart contract.
     */
    let date = new Date();
    let month = monthArray[date.getMonth()];
    let year = date.getFullYear();
    try {
      const deployment = await NFCContract.deploy({
        data: NFCJSON.bytecode,
        arguments: [`GRADUATES-${month}-${year}`, "JKUAT", owners, urls]
      }).send({
        from: accounts[0]
      });
      console.log("NFC Contract: ", deployment);
      setDataLoading(false);
    } catch (error) {
      setDataLoading(false);
      alert(error.message);
    }
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

  useEffect(() => {
    if (isJSON && dataLoading) {
      parseJSON();
    }
    if (isCSV && dataLoading) {
      parseCSV();
    }
  }, [dataLoading])


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

            {connected ? <button className='button is-primary' disabled>Connected</button> : <button className='button is-primary' onClick={() => {
              console.log("Connect wallet clicked. Below is the state of the data: ");
              console.log("isJSON: ", isJSON);
              console.log("isCSV: ", isCSV);
              console.log("If i am in ...")
              // connectInjectedWallet()
              connectInjectedWallet();
            }
            }>Connect Wallet</button>}
          </div>

        </div>
        <div className='container m-6'>
          <p className='is-size-3 mb-2'>How would you like to generate graduate certificates?</p>
          <section className='box is-clickable' onClick={() => {
            setIsCSV(false);
            setIsJSON(!isJSON);
          }}>
            <p>Insert JSON</p>
          </section>
          {isJSON && !dataLoading && <section>
            <textarea id='jsonTextArea' placeholder='Drag and Drop JSON File or Type JSON here...' className='textarea' onDrop={(e) => {
              e.preventDefault();
              const fileReader = new FileReader();
              fileReader.addEventListener("load", () => {
                console.log(fileReader.result);
                const textArea = document.getElementById("jsonTextArea");
                textArea.value = fileReader.result;
                setJsonTextArea(textArea.value);
              });
              const file = e.dataTransfer.files.item(0);
              fileReader.readAsText(file);
            }} onChange={(e) => {
              setJsonTextArea(e.target.value);
            }}></textarea>
            <button className='button is-primary mt-3 mb-3' onClick={() => {
              setDataLoading(true);
            }}>Submit</button>
          </section>
          }
          {isJSON && dataLoading && <ClipLoader loading={dataLoading} />}
          <section className='box is-clickable' onClick={() => {
            setIsJSON(false);
            setIsCSV(!isCSV);
          }}>
            <p>Insert CSV</p>
          </section>
          {isCSV && !dataLoading && <section><textarea id='csvTextArea' className='textarea' placeholder='Drag and Drop CSV File or Type CSV here...' onDrop={(e) => {
            e.preventDefault();
            const fileReader = new FileReader();
            const textArea = document.getElementById('csvTextArea');

            fileReader.addEventListener("load", () => {
              textArea.value = fileReader.result;
              setCSVTextArea(textArea.value);
            });
            const file = e.dataTransfer.files.item(0);
            fileReader.readAsText(file);

          }} onChange={(e) => {
            setCSVTextArea(e.target.value);
          }}></textarea><button className='button is-primary mt-3 mb-3' onClick={() => {
            setDataLoading(true);
          }}>Submit</button></section>}
          {isCSV && dataLoading && <ClipLoader loading={dataLoading} />}
        </div>

      </main >
    </div >
  )
}
