import fs from 'fs-extra'
import DKGClient from 'dkg-client'
import run from "./api/get-data.js";

const URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=100&page=1&sparkline=false"
const endpoint = '0.0.0.0'
const port = 8900
const options = {endpoint, port, useSSL: false, loglevel: 'info', maxNumberOfRetries: 25};


const remove_all = () => {
    fs.emptydir("./data")
}

const write = async (coins) => {

    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }

    remove_all()

    try {
        for (let rank in coins) {
            const coin = coins[rank]
            const data = await fs.readJson('./context.json')
            data["name"] = coin["symbol"]
            data["description"] = "price of: " + coin["symbol"] + " (" + coin["id"] + ") " + " at " + coin["last_updated"]
            data["MarketCap"]["value"] = coin["market_cap"]
            data["Rank"]["value"] = coin["market_cap_rank"]
            data["Price"]["value"] = coin["current_price"]
            data["attributes"]["ath_change_percentage"] = coin["ath_change_percentage"]
            data["image"] = coin["image"]

            await fs.writeJson('./data/' + rank + '.json', data)
        }
    } catch
        (error) {
        console.log(error.message)
    }
}

const publish = async () => {
    const client = new DKGClient(options)
    const files = await fs.promises.readdir('./data')
    for (const file of files) {
        const content = await fs.readJson('./data/' + file)
        const options = {
            filepath: './data/' + file,
            assets: ['0x123456789123456789123456789'],
            keywords: ['CoinGecko Data', 'Yolan Maldonado', 'Price'],
            visibility: true
        }
        console.log("Trying to publish: \n" + JSON.stringify(content))
        await client.publish(options).then((result) => console.log("Successfully published : \n" + JSON.stringify(result)))
            .catch((error) => console.log(error.message))
    }
}

const coins = await run(URL)
write(coins).then(() => publish()).then(() => remove_all())
