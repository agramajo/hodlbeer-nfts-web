import { useEffect, useState } from 'react';
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
        let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther(NFT_PRICE) });

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
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
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
    <div className='main-app'>
      <h1>Hodl Beer Club</h1>
      <div>
        Progress [{nftTotal}/{TOTAL_MINT_COUNT}]
      </div>
      <div>
        {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;
