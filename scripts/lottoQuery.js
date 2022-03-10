const { GraphQLClient, gql } = require('graphql-request');

const LAST_ID = 1484;
const COUNT = 40;

async function main() {

    const endpoint = 'https://api.thegraph.com/subgraphs/name/bitgoalsdeveloper/poollottoprod'
    const graphQLClient = new GraphQLClient(endpoint)

    var ids = []
    var currentId = LAST_ID
    for (var input = 1; input <= COUNT; input++) {
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

    console.log('======================================================================================================')
    data.lotteries.map((lottery) => {
        console.log(`Lottery Id: ${lottery.id}, TotalUsers: ${lottery.totalUsers}, TotalTickets: ${lottery.totalTickets}, Status: ${lottery.status}`)
    }) 
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
