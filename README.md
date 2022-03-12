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
    npx hardhat check-if-played-tickets --tag pancakePredictionV2Scanner --network mainnet
    npx hardhat check-if-sell --tag pancakePredictionV2Scanner --network mainnet
    npx hardhat print-lotto-status --id 1484 --count 40
```