const SendERC20Task = require('./erc20/sendErc20.js');
const PancakePredictionV2ScannerTask = require('./pancakePredictionV2/scanner');
const PancakeLottoScannerTask = require('./pancakeLotto/scanner');
var cron = require('node-cron');


async function main() {
    var pancakeLottoScanner = new PancakeLottoScannerTask();
    var pancakePredictionV2Scanner = new PancakePredictionV2ScannerTask();
    var sendERC20Task = new SendERC20Task();

    await sendERC20Task.run()

    // run scanners
    pancakeLottoScanner.run();
    pancakePredictionV2Scanner.run();

    cron.schedule('* * * * *', () => {
    //    sendERC20Task.run()
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });