const ervy = require('ervy')
const { bar } = ervy

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const { add } = require('mongoose/lib/helpers/specialProperties');
const User = mongoose.model('User');

const FROM_BLOCK = 15706768;

async function main(tag, fromBlock) {
    const [owner] = await ethers.getSigners();
    console.log(`==== Running =====`);
    await mongoose.connect(process.env.MONGO_DB);
    
    const pairSmallContractABI = ['event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)'];
    const pairContractAddress = '0x4786eeef4c750158a73218459bfc07a75c89edc0';
    const pairContract = await ethers.getContractAt(pairSmallContractABI, pairContractAddress, owner);

    if (!fromBlock) {
        fromBlock = FROM_BLOCK
    }
    
    var toBlock = await ethers.provider.getBlockNumber();

    console.log(`==== Start scanning events - from block: ${fromBlock} to block: ${toBlock} (${toBlock - fromBlock} blocks) ==== `)
    var i = 1;
    var allEvents = []
    do {
        var currentToBlock = fromBlock + 5000;
        let filter = pairContract.filters.Swap();
        const events = await pairContract.queryFilter({
            topics: filter
        },
        fromBlock,
        currentToBlock)
        allEvents = allEvents.concat(events)
        fromBlock = currentToBlock 
        i++;

    } while (toBlock > currentToBlock)
   
    console.log(`==== Scanning events done, Total Events: ${allEvents.length} === `)


    var query = { 'tag': tag, 'erc20_sent': true };
    var allUsers = await User.find(query);
    
    var founds = 0
    var foundAddress = {}
    for (const event of allEvents) {
        var tx = await event.getTransactionReceipt()
        var address;
        if (event.args) {
            address = tx.from;
        }
        
        var query = { 'address': address, 'tag': tag, 'erc20_sent': true};
        var users = await User.find(query);
        if (users.length != 0)  {
            if (!foundAddress[address]) {
                foundAddress[address] = [];
                founds++;
            }
            foundAddress[address].push(event.transactionHash);
            console.log(`PLT used by address: ${address}, URL: https://bscscan.com/address/${address}#tokentxns, Tx: https://bscscan.com/tx/${event.transactionHash}`)
        }
    };

    console.log('======================================================================================================')
    console.log(`Total: ${allUsers.length}, Found: ${founds}, Percentage: ${founds / allUsers.length * 100}%`)
    console.log('======================================================================================================')

    console.log(`==== Results ====`)
    for (var key in foundAddress) {
        console.log(`Address: ${key}, Count: ${foundAddress[key].length}`)
    }
}


task("check-if-sell", "Check if the users sell'")
    .addParam("tag", "tag")
    .addOptionalParam("fromBlock","fromBlock")
    .setAction(async ({ tag, fromBlock }) => {
        try {
            await main(tag, fromBlock);
        } catch(e) {
            console.log(e)
        }
    });