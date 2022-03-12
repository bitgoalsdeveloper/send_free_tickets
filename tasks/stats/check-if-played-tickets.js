const ervy = require('ervy')
const { bar } = ervy

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');

const FROM_BLOCK = 15706768;

async function main(tag, fromBlock) {
    const [owner] = await ethers.getSigners();
    console.log(`==== Running =====`);
    await mongoose.connect(process.env.MONGO_DB);
    
    const lottoSmallContractABI = ['event TicketsPurchase(address indexed buyer, uint256 indexed lotteryId, uint256 numberTickets)'];
    const lottoContractAddress = '0x6420069F636b86e3fa9D06a5B6AB8d9203e00436';
    const lottoContract = await ethers.getContractAt(lottoSmallContractABI, lottoContractAddress, owner);

    if (!fromBlock) {
        fromBlock = FROM_BLOCK
    }
    
    var toBlock = await ethers.provider.getBlockNumber();

    console.log(`==== Start scanning events - from block: ${fromBlock} to block: ${toBlock} (${toBlock - fromBlock} blocks) ==== `)
    var i = 1;
    var allEvents = []
    do {
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
   
    console.log(`==== Scanning events done, Total Events: ${allEvents.length} === `)

    var query
    if(tag) {
        query = { 'tag': tag, 'erc20_sent': true };
    } else {
        query = { 'erc20_sent': true };
    }
    
    var allUsers = await User.find(query);
    
    var founds = 0
    var foundAddress = {}
    for (const event of allEvents) {
        var address;
        if (event.args) {
            address = event.args[0];
        }
        var query
        if (tag) {
            var query = { 'address': address, 'tag': tag, 'erc20_sent': true };
        } else {
            var query = { 'address': address, 'erc20_sent': true };
        }

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

    console.log(`==== Stats ====`)
    var stats = {}
    for (var key in foundAddress) {

        if (!stats[foundAddress[key].length]) {
            stats[foundAddress[key].length] = 0;
        }
        stats[foundAddress[key].length]++
    }

    var moreThenOne = 0;
    for (var key in stats) {
        if (key > 1) {
            moreThenOne++;
        }
        console.log(`Time palys: ${key}, Count: ${stats[key]}`)
    }

    console.log('======================================================================================================')
    console.log(`Total: ${founds}, More Then One: ${moreThenOne}, Percentage: ${(moreThenOne / founds) * 100}%`)
    console.log('======================================================================================================')
 
    var data = Object.keys(stats).map(function (key, index) {
        return {
            key: key,
            value: stats[key]
        }
    });

    if (data.length > 0) {
        console.log(`==== Bar ====`)
        console.log(bar(data))

    }
}


task("check-if-played-tickets", "Check if the user played")
    .addOptionalParam("tag", "tag")
    .addOptionalParam("fromBlock","fromBlock")
    .setAction(async ({ tag, fromBlock }) => {
        try {
            await main(tag, fromBlock);
        } catch(e) {
            console.log(e)
        }
    });