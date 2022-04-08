const SendERC20Task = require('./erc20/sendErc20.js');
const SendERC1155Task = require('./erc1155/sendErc1155.js');
const PancakePredictionV2ScannerTask = require('./pancakePredictionV2/scanner');
const PancakeLottoScannerTask = require('./pancakeLotto/scanner');
var cron = require('node-cron');


async function main() {
    var pancakeLottoScanner = new PancakeLottoScannerTask();
    var pancakePredictionV2Scanner = new PancakePredictionV2ScannerTask();
    var sendERC1155Task = new SendERC1155Task();

    pancakeLottoScanner.run();
    pancakePredictionV2Scanner.run();

    cron.schedule('*/10 * * * *', () => {
        //sendERC20Task.run()
        sendERC1155Task.run()
    });
}


// async function main() {
//     var sendERC1155Task = new SendERC1155Task();
//     sendERC1155Task.run()
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });