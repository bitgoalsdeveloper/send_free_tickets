const { GraphQLClient, gql } = require('graphql-request');

//const LAST_ID = 1484;
//const COUNT = 40;

async function main(lastId, count) {

    const endpoint = 'https://api.thegraph.com/subgraphs/name/bitgoalsdeveloper/poollottoprod'
    const graphQLClient = new GraphQLClient(endpoint)

    var ids = []
    var currentId
    currentId = lastId

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
    console.log(`Avg TotalUsers: ${totalUsers / data.lotteries.length}, Avg TotalTickets: ${totalTickets / data.lotteries.length}, Total: ${data.lotteries.length}`)
    console.log('======================================================================================================')
}

task("print-lotto-status", "Print lotto stats'")
    .addParam("id", "id")
    .addParam("count", "count")
    .addOptionalParam("fromBlock", "fromBlock")
    .setAction(async ({ id, count }) => {
        try {
            await main(id, count);
        } catch (e) {
            console.log(e)
        }
    });