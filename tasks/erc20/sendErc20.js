'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');

class SendERC20Task {

    async run() {
        const AMOUNT = ethers.utils.parseEther("0.3"); // PLT

        logger.info(`==== Running SendERC20Task =====`)
        await mongoose.connect(process.env.MONGO_DB);

        const [owner] = await ethers.getSigners();


        const pltSmallContractABI = ['function transfer(address recipient, uint256 amount) external returns (bool)',
            'function balanceOf(address account) external view returns (uint256)'
        ];
        const pltContractAddress = '0x631C2f0EdABaC799f07550aEE4fF0Bf7fd35212B';
        const pltContract = await ethers.getContractAt(pltSmallContractABI, pltContractAddress, owner);


        var users = await User.find({ 'erc20_sent': false }, {});
        logger.info(`==== Users to send count: ${users.length} =====`);

        var sentCount = 0;
        for (let user of users) {
            try {
                
                var tx = await pltContract.transfer(user.address, AMOUNT);
                tx = await tx.wait();

                logger.info(`==== PLT Sent to ${user.address} =====`);
                sentCount++
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
                //logger.error(e)
            }
        }

        logger.info(`==== Total Sent:  ${sentCount} =====`);
    }
}

task("send-plt", "Send Plt if needed")
    .setAction(async () => {
        try {
            await (new SendERC20Task()).run()
        } catch (e) {
            console.log(e)
        }
    });

module.exports = SendERC20Task;




