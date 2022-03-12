const { GraphQLClient, gql } = require('graphql-request');

const endpoint = 'https://api.thegraph.com/subgraphs/name/bitgoalsdeveloper/poollottoprod'

async function main(lastId, count) {

    const graphQLClient = new GraphQLClient(endpoint)

    var ids = []
    var currentId
    if(!lastId) {
        currentId = await getLastId();
    } else {
        currentId = lastId
    }
    if(!count) {
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
    console.log(`Avg TotalUsers: ${(totalUsers / data.lotteries.length).toFixed(2)}, Avg TotalTickets: ${(totalTickets / data.lotteries.length).toFixed(2)}, Total: ${data.lotteries.length}`)
    console.log('======================================================================================================')
}


async function getLastId() {
    const graphQLClient = new GraphQLClient(endpoint)
    const mutation = gql`
    {
        lotteries(where: { status: "Open" }) {
            id
            totalUsers
            totalTickets
            status
        }
    }
  `
    const data = await graphQLClient.request(mutation)
    return data.lotteries[0].id
}

task("print-lotto-status", "Print lotto stats'")
    .addOptionalParam("id", "id")
    .addOptionalParam("count", "count")
    .setAction(async ({ id, count }) => {
        try {
            await main(id, count);
        } catch (e) {
            console.log(e)
        }
    });