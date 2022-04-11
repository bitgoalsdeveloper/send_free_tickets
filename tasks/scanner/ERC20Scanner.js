'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');

class ERC20Scanner {

    async run(address) {
        logger.info(`==== Running ERC20Scanner Task =====`)
        await mongoose.connect(process.env.MONGO_DB);

        const [owner] = await ethers.getSigners();
      
        const erc20SmallContractABI = [
                        'event Transfer(address indexed from, address indexed to, uint256 value)',
                        ];
        const erc20Contract = await ethers.getContractAt(erc20SmallContractABI, address, owner);

        erc20Contract.on('Transfer', async (from, to, value) => {
            logger.info(`==== Transfer event: from: ${from}, to: ${to}, value: ${value} =====`);
            await this.saveUser(from);
            await this.saveUser(to);
        });

        logger.info(`==== Start listen erc20 on: ${address} =====`);
    }

    async saveUser(address) {
        var query = { 'address': address };

        let user = new User({
            address: address,
            erc20_sent: false,
            erc1155_sent: false,
            tag: "erc20"
        });

        var users = await User.find(query);
        if (users.length == 0) {
            try {
                await user.save();
            } catch (e) {
            }
            
            logger.info(`==== added: ${address} =====`);
        }
    }
}

module.exports = ERC20Scanner;
