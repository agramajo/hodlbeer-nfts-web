/* eslint-disable jsx-a11y/alt-text */
import { useEffect, useState, useRef } from 'react';
import './App.css';
import contract from './utils/HodlBeerNFT.json';
import { ethers } from 'ethers';

/*
 * TODO change
 */
const contractAddress = "0x779d37AcaD165C719583a010E1548d358f23373C";
const abi = contract.abi;
const TOTAL_MINT_COUNT = 6000;
const NFT_PRICE = "0.01";

function App() {
  // Style things


  const images = useRef({
    standard: require('./assets/images/logo.png'),
    negative: require('./assets/images/negativeLogo.png'),
    decor: require('./assets/images/bear.png'),
  }).current

  // Made for testing, uncomment it and change every "currentAccount" for "hardTest" in every react fragment
  //const [hardTest, setHardTest] = useState(false)
  //const handleHardTest = () => setHardTest(!hardTest)

  const actionButton = () => {
    // Change the onClick content to handleHardTest to test styles without connecting the wallet
    return (
      <button
        onClick={
          currentAccount ? mintNftHandler : connectWalletHandler
          //handleHardTest
        } 
        className={`button ${currentAccount && 'mintButton'}`}
      >
        {currentAccount 
          ? <p>Mint <span>NFT</span></p> 
          : <p>Connect <span>my Wallet</span></p>
        }
      </button>
    )
  }

  ///////////////
  const [currentAccount, setCurrentAccount] = useState(null);
  const [nftTotal, setNftTotal] = useState("")

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    getTotal();

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      //const maticChainId = "0x89";
      //const BSCChainId = "0x38";
      const GoerliChainId = "0x5";
      if (chainId !== GoerliChainId) {
        alert("You are not connected to the Goerli Network!");
        return
      }

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.makeNFT({ value: ethers.utils.parseEther(NFT_PRICE) });

        console.log("Mining... please wait");
        await nftTxn.wait();

        /*
         * TODO change
         */
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    } finally {
      await getTotal();
    }
  }

  async function getTotal() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const nftContract = new ethers.Contract(contractAddress, abi, provider);

    let total = await nftContract.totalSupply();
    console.log("total", total);

    setNftTotal(total.toNumber());
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <html>
      <body className={`mainApp`}>
        {/* Layer */}
        <div className={`noDis ${currentAccount && 'mintApp'}`}/>
          <div className="bgImageContainer">
            <img src={images.decor} className={`bgImage ${currentAccount && 'bgImageNoOp'}`}/>
          </div>
        <div className={`noDis ${currentAccount && 'layer'}`}/>

        {/* Center body */}
        <section className="mainSection">
          {/* Logo */}
          <div className="logo">
            <img src={images.standard} alt="Hodl Beer" className="logo"/>
          </div>
          {/* Minting progress */}
          <div className="text">
            <p className="progress">Progress <span>[{nftTotal}/{TOTAL_MINT_COUNT}]</span></p>
          </div>
          {/* Mint Button */}
          <div>
            {actionButton()}
          </div>
        </section>

        {/* Footer */}  
        <footer>
          <img src={images.negative} className="lowLogo"/>
          <p>Here you can put <span>any type of legal disclaimer</span>, take this as a lorem ipsum</p>
        </footer>
      </body>
    </html>
  )
}

export default App;
