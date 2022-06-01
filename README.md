# Send Free Ticktes

## How to run
```
    git clone https://github.com/bitgoalsdeveloper/send_free_tickets.git
    cp .env.example .env
    ## update the key
    ## update the mongodb url
    npm i
    npx hardhat run --network mainnet ./tasks/index.js

```
## How to run tasks
```
    npx hardhat check-if-played-tickets --tag prediction-v2-scanner --network mainnet
    npx hardhat check-if-sell --tag prediction-v2-scanner --network mainnet
    npx hardhat print-lotto-status --id 1484 --count 40
    npx hardhat send-nft-plt --network mainnet
```

## Tags
lotto-scanner,prediction-v2-scanner
