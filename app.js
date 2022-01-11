import fs from 'fs-extra'
import DKGClient from 'dkg-client'
import run from "./api/get-data.js";

const URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=100&page=1&sparkline=false"
const endpoint = '0.0.0.0'
const port = '8900'
const options = {endpoint, port, useSSL: false, maxNumberOfRetries: 25};

const client = new DKGClient(options)

const remove_all = () => {
    fs.emptydir("./data")
}

const write = async (coins) => {

    if (!fs.existsSync('./data')){
        fs.mkdirSync('./data');
    } else {
        remove_all()
    }

    try {
        for (let rank in coins) {
            const coin = coins[rank]
            await fs.writeJson('./data/' + rank + '.json', JSON.stringify(coin, null, 2))
        }
    } catch
        (error) {
        console.log(error.message)
    }
}

const publish = async () => {
    const files = await fs.promises.readdir('./data')
    for (const file of files) {
        const content =  await fs.readJson('./data/' + file)
        const options = {
            filepath: './data/' + file,
            assets: '0xABa45E475E667Cd838C0C0FEF7E46702D14d827a',
            keywords: ["CoinGecko Data", "Yolan Maldonado", "Price"],
            visibility: true
        }
        console.log("Trying to publish: \n" + content)
        client.publish(options).then((result) => console.log("Successfully published : \n" + JSON.stringify(result))).catch((error) => console.log(error.message))
    }
}

const coins = await run(URL)
write(coins).then(() => publish()).then(() => remove_all())
