// const { ethers } = require("hardhat");
const storage = require('node-persist');
const puppeteer = require('puppeteer');
const { sleep } = require("sleep");


async function main() {

    await storage.init({ dir: './persist_PancakePredictionV2', });

    const addressList = await storage.keys();

    for (const address of addressList) {
        // init browser
        let launchOptions = { headless: false };
        const browser = await puppeteer.launch(launchOptions);

        try {
            const page = await browser.newPage();
            await page.goto(`https://bscscan.com/address/${address}#comments`);
            //await page.goto(`https://disqus.com/embed/comments/?base=default&f=bscscan&t_i=Bscscan_${address}_Comments&t_u=https://BscScan.com/address/${address}#disqus&t_e=${address}&t_d=Address ${address} | BscScan&t_t=${address}&s_o=default#version=e6a2e4b877a2f055c6a0dd19f8225c35`)


            //*[@id="dsq-app4356"]
            console.log('waiting for iframe with form to be ready.');
            await page.waitForSelector('iframe');
            console.log('iframe is ready. Loading iframe content');

            var framesList = await page.frames();
            console.log(framesList.l)
            console.log(framesList[0].contentFrame)

            const [button] = await page.$x("//button[contains(., 'Disqus')]");
            console.log(button)
            if (button) {
                await button.click();
            }
            
            sleep(10)

        } catch(e) {
            console.log(e)
        }

        // await browser.close();

    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
