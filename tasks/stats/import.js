require('../../models/user');
const logger = require("../../utils/logger.js")
const mongoose = require('mongoose');
const User = mongoose.model('User');
const storage = require('node-persist');

async function main() {
    logger.info(`==== Running Import Taks =====`)
    await mongoose.connect(process.env.MONGO_DB);
    await storage.init({ dir: './persist_PancakePredictionV2', });

    const addressList = await storage.keys();

    for (const buyer of addressList) {

       // var query = { 'address': buyer };

        // let user = new User({
        //     address: buyer,
        //     erc20_sent: true,
        //     tag: "lotto-scanner"
        // });

        let user = new User({
            address: buyer,
            erc20_sent: true,
            tag: "prediction-v2-scanner"
        });

        var users = await User.find(query);
        if (users.length == 0) {
            await user.save();
            logger.info(`==== added: ${buyer} =====`);
        }
    }
    
}

task("importdb", "impoty'")
    .setAction(async ({ }) => {
        try {
            await main();
        } catch (e) {
            console.log(e)
        }
    });