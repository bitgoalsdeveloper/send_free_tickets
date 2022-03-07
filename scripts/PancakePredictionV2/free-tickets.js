const { ethers } = require("hardhat");
const storage = require('node-persist');

const AMOUNT = ethers.utils.parseEther("0.3"); // PLT

async function main() {
    const [owner] = await ethers.getSigners();
    console.log(`==== Running =====`);
    await storage.init({ dir: './persist_PancakePredictionV2',});

    const pancakeSmallContractABI = ['event BetBear(address indexed sender, uint256 indexed epoch, uint256 amount)',
                                     'event BetBull(address indexed sender, uint256 indexed epoch, uint256 amount)'];
    const pancakeContractAddress = '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA';
    const pancakeContract = await ethers.getContractAt(pancakeSmallContractABI, pancakeContractAddress, owner);

    const pltSmallContractABI = ['function transfer(address recipient, uint256 amount) external returns (bool)',
                                 'function balanceOf(address account) external view returns (uint256)'
                                ];
    const pltContractAddress = '0x631C2f0EdABaC799f07550aEE4fF0Bf7fd35212B';
    const pltContract = await ethers.getContractAt(pltSmallContractABI, pltContractAddress, owner);
    
    const pltBalance = await pltContract.balanceOf(owner.address);
    const bnbBalance = await pltContract.provider.getBalance(owner.address)
    console.log(`==== My Balance: ${pltBalance} PLT, ${bnbBalance} BNB, To address: ${owner.address} =====`);

    let filter = pancakeContract.filters.BetBear();
    pancakeContract.on(filter, async (buyer, epoch, amount) => {
        console.log(`==== BetBear event: sender: ${buyer}, epoch: ${epoch}, amount: ${amount} =====`);
        var balance = await storage.getItem(buyer.toString())
        if(!balance) {
            try {
                console.log(`==== Sending PLT =====`);
                //var tx = await pltContract.transfer(buyer, AMOUNT);
                //tx = tx.wait();
                await storage.setItem(buyer.toString(), 1);
            } catch(e) {
                console.log(e)
            }
        }
    });

    filter = pancakeContract.filters.BetBull();
    pancakeContract.on(filter, async (buyer, epoch, amount) => {
        console.log(`==== BetBull event: sender: ${buyer}, epoch: ${epoch}, amount: ${amount} =====`);
        var balance = await storage.getItem(buyer.toString())
        if (!balance) {
            try {
                console.log(`==== Sending PLT =====`);
                //var tx = await pltContract.transfer(buyer, AMOUNT);
                //tx = tx.wait();
                await storage.setItem(buyer.toString(), 1);
            } catch (e) {
                console.log(e)
            }
        }
    });
    
    console.log(`==== Start listen on: ${pancakeContractAddress} =====`);
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
    .then(() => {})
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
