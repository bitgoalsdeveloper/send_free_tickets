const { ethers } = require("hardhat");
const storage = require('node-persist');

const AMOUNT = ethers.utils.parseEther("0.3"); // PLT
let lastNonce = 0;

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

    pancakeContract.on('BetBear', async (buyer, epoch, amount) => {
        console.log(`==== BetBear event: sender: ${buyer}, epoch: ${epoch}, amount: ${amount} =====`);
        await sendTickets(storage, pltContract, buyer, owner);

    });

    pancakeContract.on('BetBull', async (buyer, epoch, amount) => {
        console.log(`==== BetBull event: sender: ${buyer}, epoch: ${epoch}, amount: ${amount} =====`);
        await sendTickets(storage, pltContract, buyer, owner);
    });
    
    console.log(`==== Start listen on: ${pancakeContractAddress} =====`);
}

async function sendTickets(storage, pltContract, buyer, owner) {
    var balance = await storage.getItem(buyer.toString())
    if (!balance) {
        try {
            await sendTicketsAndWait(pltContract, buyer, owner)
            await storage.setItem(buyer.toString(), 1);
            console.log(`==== PLT sent to: ${buyer} =====`);
        } catch (e) {
            console.log(e)
            //sleep(10)
            //sendTickets(storage, pltContract, buyer);
        }
    }
}

async function sendTicketsAndWait(pltContract, buyer, owner) {
    var nonce = (await ethers.provider.getTransactionCount(owner.address));
    if (lastNonce < nonce ) {
        lastNonce = nonce;
    } else {
        lastNonce = nonce + 1;

    }
    console.log("nonce: " + nonce)
    console.log("lastNonce: " + lastNonce)
    var tx = await pltContract.transfer(buyer, AMOUNT, {
        from: owner.address,
        nonce: lastNonce,
    });
    tx = await tx.wait();
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => {})
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
