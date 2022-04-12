const SendERC1155Task = require('./erc1155/sendErc1155.js');
const PancakePredictionV2ScannerTask = require('./scanner/pancakePredictionV2Scanner');
const PancakeLottoScannerTask = require('./scanner/pancakeLottoScanner');
const ERC20Scanner = require('./scanner/ERC20Scanner');

var cron = require('node-cron');

async function main() {
    var pancakeLottoScanner = new PancakeLottoScannerTask();
    var pancakePredictionV2Scanner = new PancakePredictionV2ScannerTask();
    var sendERC1155Task = new SendERC1155Task();
    var erc20Scanner = new ERC20Scanner();

    pancakeLottoScanner.run();
    pancakePredictionV2Scanner.run();
    erc20Scanner.run("0x2cD96e8C3FF6b5E01169F6E3b61D28204E7810Bb",'LuckyBlock'); // LuckyBlock - https://bscscan.com/address/0x2cD96e8C3FF6b5E01169F6E3b61D28204E7810Bb#code
    erc20Scanner.run("0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377",'Mobox'); // Mobox - https://bscscan.com/token/0x3203c9e46ca618c8c1ce5dc67e7e9d75f5da2377

    cron.schedule('0 * * * *', () => {
        sendERC1155Task.run()
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