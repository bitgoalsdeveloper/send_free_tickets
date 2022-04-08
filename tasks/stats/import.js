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

    
    for (const address of data) {

        var query = { 'address': address.address };

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