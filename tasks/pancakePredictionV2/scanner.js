'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');

class PancakePredictionV2ScannerTask {

    async run() {
        logger.info(`==== Running PancakePredictionV2Scanner Task =====`)
        await mongoose.connect(process.env.MONGO_DB);

        const [owner] = await ethers.getSigners();
      
        const pancakeSmallContractABI = ['event BetBear(address indexed sender, uint256 indexed epoch, uint256 amount)',
            'event BetBull(address indexed sender, uint256 indexed epoch, uint256 amount)'];
        const pancakeContractAddress = '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA';
        const pancakeContract = await ethers.getContractAt(pancakeSmallContractABI, pancakeContractAddress, owner);

        pancakeContract.on('BetBear', async (buyer, epoch, amount) => {
            logger.info(`==== BetBear event: sender: ${buyer}, epoch: ${epoch}, amount: ${amount} =====`);
            await this.saveUser(buyer);

        });

        pancakeContract.on('BetBull', async (buyer, epoch, amount) => {
            logger.info(`==== BetBull event: sender: ${buyer}, epoch: ${epoch}, amount: ${amount} =====`);
            await this.saveUser(buyer);
        });

        logger.info(`==== Start listen on: ${pancakeContractAddress} =====`);
    }

    async saveUser(buyer) {
        var query = { 'address': buyer };

        let user = new User({
            address: buyer,
            erc20_sent: false,
            tag: "prediction-v2-scanner"
        });

        var users = await User.find(query);
        if (users.length == 0) {
            await user.save();
            logger.info(`==== added: ${buyer} =====`);
        } else {
            logger.info(`==== buyer alreay exists: ${buyer} =====`);
        }
    }
}

module.exports = PancakePredictionV2ScannerTask;
