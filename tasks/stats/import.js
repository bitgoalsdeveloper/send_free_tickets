require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');
const storage = require('node-persist');


var data = [

   ];


async function main() {
    logger.info(`==== Running Import Task =====`)
    await mongoose.connect(process.env.MONGO_DB);
    //await storage.init({ dir: './persist_PancakePredictionV2', });

    //var query = {'tag': 'erc20'};

    //var users = await User.find({'erc1155_sent': true}).sort({created_at: -1}).limit(150);
    //logger.info(`==== Users to send count: ${users.length} =====`);

    // for (let user of users) {
    //     try {
    //         const filter = { address: user.address };
    //         const update = {
    //             erc1155_sent: false
    //         };

    //         // `doc` is the document _before_ `update` was applied
    //         let doc = await User.findOneAndUpdate(filter, update, {
    //             returnNewDocument: true,
    //             new: true,
    //             strict: false
    //         });

    //     } catch (e) {
    //         console.log(e)
    //     }
    // }
    // console.log("DONE")
    // return;

    for (const address of data) {

        var selectedAddress = address.address.trim();

        if(!ethers.utils.isAddress(selectedAddress)) {
            console.log(`Not address ${selectedAddress}`)
            continue;
        }

        try {
            var query = {  'address': selectedAddress };

            let user = new User({
                address: selectedAddress,
                erc20_sent: false,
                erc1155_sent: false,
                tag: "Dan - Marketing"
            });

            var users = await User.find(query);
            if (users.length == 0) {
                await user.save();
                logger.info(`==== added: ${selectedAddress} =====`);
            } else {
                logger.info(`==== Not added: ${address.address} =====`);
            }
        } catch(e) {

        }
    }

    logger.info(`==== DONE =====`);
}

task("importdb", "impot'")
    .setAction(async ({ }) => {
        try {
            await main();
        } catch (e) {
            console.log(e)
        }
    });