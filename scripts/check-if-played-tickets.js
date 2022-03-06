const { ethers } = require("hardhat");
const storage = require('node-persist');

const FROM_BLOCK = 15706768;

async function main() {
    const [owner] = await ethers.getSigners();
    console.log(`==== Running =====`);
    await storage.init({ dir: './persist',});
    
    const lottoSmallContractABI = ['event TicketsPurchase(address indexed buyer, uint256 indexed lotteryId, uint256 numberTickets)'];
    const lottoContractAddress = '0x6420069F636b86e3fa9D06a5B6AB8d9203e00436';
    const lottoContract = await ethers.getContractAt(lottoSmallContractABI, lottoContractAddress, owner);

    var fromBlock = FROM_BLOCK
    var toBlock = await ethers.provider.getBlockNumber();

    console.log("====  Start scaning events ==== ")
    var i = 1;
    var allEvents = []
    do {
        console.log("Scaning Iteration: #" +i)
        var currentToBlock = fromBlock + 5000;
        
        let filter = lottoContract.filters.TicketsPurchase();
        const events = await lottoContract.queryFilter({
            address: null,
            topics: filter
        },
        fromBlock,
        currentToBlock)
        allEvents = allEvents.concat(events)
        fromBlock = currentToBlock 
        i++;

    } while (toBlock > currentToBlock)
   
    console.log("Total Events:" + allEvents.length)

    const addressList = await storage.keys();
    var founds = 0
    var foundAddress = []
    for (const event of allEvents) {
        var address;
        if (event.args) {
            address = event.args[0];
        }
        
        if (addressList.includes(address) && !foundAddress.includes(address)) {
            founds++;
            foundAddress.push(address)
            console.log(`PLT used by address: ${address}, URL: https://bscscan.com/address/${address}#tokentxns, Tx: https://bscscan.com/tx/${event.transactionHash}`)
        }
    };

    console.log(`Total: ${addressList.length}, Found: ${founds}, Percentage: ${founds / addressList.length * 100}%`)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
