const { GraphQLClient, gql } = require('graphql-request');

const LAST_ID = 1484;
const COUNT = 40;

async function main() {

    const endpoint = 'https://api.thegraph.com/subgraphs/name/bitgoalsdeveloper/poollottoprod'
    const graphQLClient = new GraphQLClient(endpoint)

    var ids = []
    var currentId
    if(process.argv.length >= 3) {
        currentId = process.argv[2]
    } else {
        currentId =  LAST_ID
    }
    var count;
    if (process.argv.length >= 4) {
        count = process.argv[3]
    } else {
        count = COUNT
    }
    for (var input = 1; input <= count; input++) {
        ids.push(currentId);
        currentId--;
    }

    let idString = `[`
    ids.map((id) => {
        return (idString += `"${id}",`)
    })
    idString += ']'
    const mutation = gql`
    {
        lotteries(where: { id_in: ${idString} }) {
            id
            totalUsers
            totalTickets
            status
        }
    }
  `
    const data = await graphQLClient.request(mutation)

    var totalUsers = 0;
    var totalTickets = 0;

    console.log('======================================================================================================')
    data.lotteries.map((lottery) => {
        totalUsers += parseInt(lottery.totalUsers);
        totalTickets += parseInt(lottery.totalTickets);
        console.log(`Lottery Id: ${lottery.id}, TotalUsers: ${lottery.totalUsers}, TotalTickets: ${lottery.totalTickets}, Status: ${lottery.status}`)
    }) 
    console.log('======================================================================================================')
    console.log(`Avg totalUsers: ${totalUsers / data.lotteries.length}, Avg TotalTickets: ${totalTickets / data.lotteries.length}`)
    console.log('======================================================================================================')



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
