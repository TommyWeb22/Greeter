
var userAddress;
var provider;
var signer;

async function connectWallet () {
    console.log('Connect Wallet clicked');

    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    console.log(provider);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    signer = provider.getSigner();

    let userAddress = await signer.getAddress();
    let net = await provider.getNetwork();
    let netName = net.name;
    console.log(netName);
    let balance = await provider.getBalance(userAddress);

    document.getElementById("wallet").innerText = 
        `${userAddress}   Network: ${netName}   Bal: ${(+ethers.utils.formatEther(balance)).toFixed(4)}`;

    setUpContract();

}

// original - wo event
//const contractAddress = "0x571702de91449f3c9dc76003ec40d44b3162089e";
// 2nd one - w event
//const contractAddress = "0xD14F8223d4254ea781c611AFEDe1aaFB30d2Bcf6";
// greeterf
const contractAddress = "0x646Ff94436760740E185060772CEBf99dB2A54b0";
var contract;

async function setUpContract () {

    //import abi from "../abis/contract.json";
    //const contractabi = JSON.parse('../abis/contract.json'); // the ABI
    contractJSON = await fetch('../abis/contract.json')
    .then(response => response.json())
    .then(data => {
        let obj = data.output.contracts["contracts/Greeter.sol"].Greeter;
        console.log(obj);
        return obj;
    });
    
    console.log(contractJSON);
    const contractABI = contractJSON.abi;
    console.log(contractABI);

    //const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner()); 
    console.log('Create contract obj');
    contract = new ethers.Contract(contractAddress, contractABI, signer);   
    console.log(contract);
    console.log('contract ready for interaction');

    contract.on("GreeterEvent", (NewGreeting, event) => {
        console.log('Event GreeterEvent received: new greeting is ' , NewGreeting);
        console.log('Event GreeterEvent received: event obj is ', event);
    });

}

async function getContractInfo () {

    console.log('Fetching contract info...');
    const owner = await contract.owner();
    console.log(owner);
    const greeting = await contract.greet();
    console.log(greeting);
    const balance = await contract.getBalance();
    console.log(balance);

    document.getElementById("cAddress").innerText = contractAddress;
    document.getElementById("cOwner").innerText = owner;
    document.getElementById("cGreeting").innerText = greeting;
    document.getElementById("cBalance").innerText = balance;
}

async function newGreeting () {
    let g = document.getElementById('newgreeting').value
    console.log(`Updating new greeting to ${g} ...`);

    const tx = await contract.setGreeting(g);
    const txReceipt = await tx.wait();
    if (txReceipt.status !== 1) {
        alert('Setting new greeting failed');
    } else {
        console.log(`Greeting succeesfully updated to ${g}`)
    }
}