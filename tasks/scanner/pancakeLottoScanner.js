'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');

class PancakeLottoScannerTask {

    async run() {
        logger.info(`==== Running PancakeLottoScanner Taks =====`)
        await mongoose.connect(process.env.MONGO_DB);

        const [owner] = await ethers.getSigners();
      
        const pancakeSmallContractABI = ['event TicketsPurchase(address indexed buyer, uint256 indexed lotteryId, uint256 numberTickets)'];
        const pancakeContractAddress = '0x5aF6D33DE2ccEC94efb1bDF8f92Bd58085432d2c';
        const pancakeContract = await ethers.getContractAt(pancakeSmallContractABI, pancakeContractAddress, owner);

        let filter = pancakeContract.filters.TicketsPurchase();
        pancakeContract.on(filter, async (buyer, lotteryId, numberTickets) => {
            // logger.info(`==== TicketsPurchase event: buyer: ${buyer}, lotteryId: ${lotteryId}, numberTickets: ${numberTickets} =====`);

            var query = {'address': buyer};

            let user = new User({
                address: buyer,
                erc20_sent: false,
                erc1155_sent: false,
                tag: "lotto-scanner"
            });

            var users = await User.find(query);
            if (users.length == 0) {
                await user.save();
                logger.info(`==== added: ${buyer} , tag: lotto-scanner =====`);
            }
           
        });

        logger.info(`==== Start listen on: ${pancakeContractAddress} =====`);
    }
}

module.exports = PancakeLottoScannerTask;


