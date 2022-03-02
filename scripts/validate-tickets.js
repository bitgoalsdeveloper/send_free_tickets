const { ethers } = require("hardhat");
const storage = require('node-persist');

const AMOUNT = ethers.utils.parseEther("0.3"); // PLT

async function main() {
    const [owner] = await ethers.getSigners();
    console.log(`==== Running =====`);
    await storage.init({ dir: './persist',});
    
    const pltSmallContractABI = ['function transfer(address recipient, uint256 amount) external returns (bool)',
                                 'function balanceOf(address account) external view returns (uint256)'
                                ];
    const pltContractAddress = '0x631C2f0EdABaC799f07550aEE4fF0Bf7fd35212B';
    const pltContract = await ethers.getContractAt(pltSmallContractABI, pltContractAddress, owner);
    
    const addressList = await storage.keys();
    var founds = 0
    for (const address of addressList) {
        var pltBalance = await pltContract.balanceOf(address);
        if (pltBalance.eq(AMOUNT) == false) {
            founds++;
            console.log(`PLT used by address: ${address}, URL: https://bscscan.com/address/${address}#tokentxns`)
        }
    };

    console.log(`Total: ${addressList.length}, Found: ${founds}, Percentage: ${founds / addressList.length * 100}%`)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
