const Web3 = require('web3');

export default class Dapp {
    constructor() {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        console.log(web3);
    }

    static connect = async (e) => {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

            if (accounts.length > 0) {
                document.getElementById("connect-wallet-btn").innerHTML = accounts[0].substr(0, 10) + "..." + accounts[0].substr(-4);

                const web3 = new Web3(window.ethereum);
                const contract = new web3.eth.Contract(abi, CONTRACT_ADDR, { gas: 3000000 });
                maxSupply = await contract.methods.maxSupply().call();
                totalSupply = await contract.methods.totalSupply().call();
                const paused = await contract.methods.paused().call();
                WL = await contract.methods.whitelistMintEnabled().call();
                maxPerTx = await contract.methods.maxPerTx().call();
                cost = await contract.methods.cost().call();
                costWL = await contract.methods.costWL().call();

                // if (paused) { document.getElementById("phase").innerHTML = "CONTRACT IS PAUSED"; }
                // else {
                //     if (WL) { document.getElementById("phase").innerHTML = "WHITELIST MINT | MAX " + maxPerTx + " PER WALLET"; document.getElementById("price").innerHTML = "COST 0.01Ξ EACH"; }
                //     else { document.getElementById("phase").innerHTML = "PUBLIC MINT | MAX " + maxPerTx + " PER WALLET"; document.getElementById("price").innerHTML = "COST 0.03Ξ EACH"; }
                // }

                //document.getElementById("tokens_available").innerHTML = "SOLD OUT";
                // document.getElementById("tokens_available").innerHTML = totalSupply + " / " + "1000";
                // document.getElementById("price").innerHTML = "COST 0.01Ξ EACH";
            }
            else { document.getElementById("connect-wallet-btn").innerHTML = "Connect wallet"; }
        }
        return false;
    }
}