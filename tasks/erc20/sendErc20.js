'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const { use } = require('chai');
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

        const airDropSmallContractABI = ['function send(address token, address[] calldata addresses, uint256 [] calldata values) external returns(uint256)'];
        const airDropContractAddress = '0xdeCDf579Ef60D7F5435701f5dC01a52764244948';
        const airDropContract = await ethers.getContractAt(airDropSmallContractABI, airDropContractAddress, owner);

        var users = await User.find({ 'erc20_sent': false }, {});
        logger.info(`==== Users to send count: ${users.length} =====`);

        var addressesToSent = [];
        var amountToSent = [];
        users.map(user => {
            addressesToSent.push(user.address);
            amountToSent.push(AMOUNT);
        })

        try {
            var tx = await airDropContract.send(pltContract.address, addressesToSent, amountToSent);
            tx = await tx.wait();

            logger.info(`==== PLT Sent Count:${addressesToSent.length}, URL: https://bscscan.com/tx/${tx.hash} =====`);
        } catch(e) {
            console.log(e);
        }

        for (let user of users) {
            try {
                
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
                console.log(e)
            }
        }
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




