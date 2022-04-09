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

    var users = await User.find( { erc1155_sent: true}, {});
    logger.info(`==== Users to send count: ${users.length} =====`);

    for (let user of users) {
        try {
            var query = {'address': user.address};
            var users = await User.find(query);
            if (users.length > 1) {
                logger.info(`==== found dup: ${buyer} =====`);
            }

        } catch (e) {
            console.log(e)
        }
    }

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