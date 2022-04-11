require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');
const storage = require('node-persist');


var data = [
   ]


async function main() {
    logger.info(`==== Running Import Taks =====`)
    await mongoose.connect(process.env.MONGO_DB);
    await storage.init({ dir: './persist_PancakePredictionV2', });

    var query = {'tag': 'erc20'};

    var users = await User.find( query);
    logger.info(`==== Users to send count: ${users.length} =====`);

    for (let user of users) {
        try {
            var query = {'tag': 'erc20'};
            const filter = { address: user.address };
            const update = {
               tag: 'LuckyBlock'
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
    console.log("DONE")
    return;
    
    for (const address of data) {

        var query = { 'erc20_sent': false };

        // let user = new User({
        //     address: buyer,
        //     erc20_sent: true,
        //     tag: "lotto-scanner"
        // });

        let user = new User({
            address: address.address,
            erc20_sent: false,
            erc1155_sent: false,
            tag: "marketing"
        });

        var users = await User.find(query);
        if (users.length == 0) {
            await user.save();
            logger.info(`==== added: ${address.address} =====`);
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