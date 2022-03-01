const { ethers } = require("hardhat");
const storage = require('node-persist');

const AMOUNT = ethers.utils.parseEther("0.3"); // PLT

async function main() {
    const [owner] = await ethers.getSigners();
    console.log(`==== Running =====`);
    await storage.init({ dir: './persist',});

    const pancakeSmallContractABI = ['event TicketsPurchase(address indexed buyer, uint256 indexed lotteryId, uint256 numberTickets)'];
    const pancakeContractAddress = '0x5aF6D33DE2ccEC94efb1bDF8f92Bd58085432d2c';
    const pancakeContract = await ethers.getContractAt(pancakeSmallContractABI, pancakeContractAddress, owner);

    const pltSmallContractABI = ['function transfer(address recipient, uint256 amount) external returns (bool)',
                                 'function balanceOf(address account) external view returns (uint256)'
                                ];
    const pltContractAddress = '0x631C2f0EdABaC799f07550aEE4fF0Bf7fd35212B';
    const pltContract = await ethers.getContractAt(pltSmallContractABI, pltContractAddress, owner);
    
    const pltBalance = await pltContract.balanceOf(owner.address);
    const bnbBalance = await pltContract.provider.getBalance(owner.address)
    console.log(`==== My Balance: ${pltBalance} PLT, ${bnbBalance} BNB, To address: ${owner.address} =====`);

    let filter = pancakeContract.filters.TicketsPurchase();
    pancakeContract.on(filter, async (buyer, lotteryId, numberTickets) => {
        console.log(`==== TicketsPurchase event: buyer: ${buyer}, lotteryId: ${lotteryId}, numberTickets: ${numberTickets} =====`);
        var balance = await storage.getItem(buyer.toString())
        if(!balance) {
            try {
                console.log(`==== Sending PLT =====`);
                await pltContract.transfer(buyer, AMOUNT);
                await storage.setItem(buyer.toString(), 1);
            } catch(e) {
                console.log(e)
            }
        }
    });
    
  
    console.log(`==== Start listen on: ${pancakeContractAddress} =====`);
    
    await new Promise(res => setTimeout(() => res(null), 10005000));
}

// async function getAllEvent(contr) {
//     let filter = pancakeContract.filters.TicketsPurchase();

//     const events = await pancakeContract.queryFilter({
//         address: null,
//         topics: filter
//     },
//     15571154, 
//     "latest")

//     console.log(events[0])
// }

// async function startListenToEvents(contract) {
//     let filter = contract.filters.TicketsPurchase();
//     contract.on(filter, (buyer, lotteryId, numberTickets) => {
//         console.log(`==== TicketsPurchase event: buyer: ${buyer}, lotteryId: ${lotteryId}, numberTickets: ${numberTickets} =====`);
//     });
// }


// async function setNFT() {

// }


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
