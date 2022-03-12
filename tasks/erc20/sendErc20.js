'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');

const AMOUNT = ethers.utils.parseEther("0.3"); // PLT

class SendERC20Task {

    async run() {
        logger.info(`==== Running SendERC20Task =====`)
        await mongoose.connect(process.env.MONGO_DB);

        const [owner] = await ethers.getSigners();

        var users = await User.find({'erc20_sent': false}, {});

        const pltSmallContractABI = ['function transfer(address recipient, uint256 amount) external returns (bool)',
            'function balanceOf(address account) external view returns (uint256)'
        ];
        const pltContractAddress = '0x631C2f0EdABaC799f07550aEE4fF0Bf7fd35212B';
        const pltContract = await ethers.getContractAt(pltSmallContractABI, pltContractAddress, owner);

        for (let user of users) {
            try {

                logger.info(`==== Sending PLT to ${user.address} =====`);
                var tx = await pltContract.transfer(user.address, AMOUNT);
                tx = await tx.wait();

                var now = new Date();
                const filter = { address: user.address };
                const update = {
                   erc20_sent: true,
                   updated_at: now
                };

                // `doc` is the document _before_ `update` was applied
                let doc = await User.findOneAndUpdate(filter, update, {
                    returnNewDocument: true,
                    new: true,
                    strict: false
                });


            } catch (e) {
                console.log(e);
                logger.error(e)
            }
        }
    }
}

module.exports = SendERC20Task;


