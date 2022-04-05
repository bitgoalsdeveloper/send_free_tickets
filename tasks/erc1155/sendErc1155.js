'use strict';

require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const { use } = require('chai');
const User = mongoose.model('User');

class SendERC1155Task {

    async run() {
        logger.info(`==== Running SendERC1155 Task =====`)
        await mongoose.connect(process.env.MONGO_DB);

        const [owner] = await ethers.getSigners();
        
        logger.info(`==== Owner: ${owner.address} =====`)

        const nftPltSmallContractABI = [
            'function safeTransferFrom(address from, address to, uint256 id, uint256 amount,bytes memory data)',
        ];
        const nftPltContractAddress = '0x728b8500f88Fb9239e9746871CE6A6430B7d0EBe';
        const nftPltContract = await ethers.getContractAt(nftPltSmallContractABI, nftPltContractAddress, owner);

        var users = await User.find({ 'erc1155_sent': false }, {});
        logger.info(`==== Users to send count: ${users.length} =====`);

        if(users.length == 0) {
            console.log("No Address to sent");
            return;
        }

        for (let user of users) {

            try {
                var tx = await nftPltContract.safeTransferFrom(owner.address, user.address, 1, 1, ethers.utils.formatBytes32String(""));
                tx = await tx.wait();
    
                logger.info(`==== PLT NFT Sent to:${user.address}, URL: https://bscscan.com/tx/${tx.transactionHash} =====`);
            } catch(e) {
                console.log(e);
                continue;
            }

            try {
                var now = new Date();
                const filter = { address: user.address };
                const update = {
                   erc1155_sent: true,
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

module.exports = SendERC1155Task;




