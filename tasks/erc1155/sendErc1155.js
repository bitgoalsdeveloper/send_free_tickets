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

        const multiSenderSmallContractABI = ['function sendERC1155(address token, address[] calldata addresses, uint256 [] calldata values, uint256 [] calldata ids) external returns (uint256)'];
        const multiSenderContractAddress = '0xE65b3A98c684b51167178342b04F1E15eA7aFc7F';
        const multiSenderContract = await ethers.getContractAt(multiSenderSmallContractABI, multiSenderContractAddress, owner);

        var totalusers = await User.find({ 'erc1155_sent': false }, {})
        logger.info(`==== Total Users to send count: ${totalusers.length} =====`);

        var users = await User.find({ 'erc1155_sent': false }, {}).limit(500);

        var addressesToSent = [];
        var amountsToSent = [];
        var idsToSent = []; 
        for (let user of users) {
            var res = await multiSenderContract.provider.getCode(user.address)
            if(res == '0x') { // filter out contracts 
                addressesToSent.push(user.address);
                amountsToSent.push(1);
                idsToSent.push(1);
            } else {
                logger.info(`Address is a contract - ${user.address}`);

            }
        }

        logger.info(`==== Users to send count: ${addressesToSent.length} =====`);

        if(addressesToSent.length == 0) {
            console.log("No Address to sent");
            return;
        }

        try {
            var tx = await multiSenderContract.sendERC1155(nftPltContract.address, addressesToSent, amountsToSent, idsToSent);
            tx = await tx.wait();

            logger.info(`==== PLT NFT Sent Count: ${addressesToSent.length}, URL: https://bscscan.com/tx/${tx.transactionHash} =====`);
        } catch(e) {
            console.log(e);
            return;
        }

        for (let user of users) {

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

        logger.info(`==== Sent DONE =====`);

    }
    
}

task("send-nft-plt", "Send Plt if needed")
    .setAction(async () => {
        try {
            await (new SendERC1155Task()).run()
        } catch (e) {
            console.log(e)
        }
    });

module.exports = SendERC1155Task;




