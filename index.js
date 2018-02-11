const rp = require('request-promise');
const crypto = require('crypto');
const keys = require('./keys.js');
const apiKey = keys.binance.apikey;
const secretKey = keys.binance.secretKey;

const timestamp = new Date().getTime();

// URL Required Params
const baseUrl = 'https://api.binance.com';
const timeStampParam = 'timestamp=' + timestamp
const recvWindowParam = 'recvWindow=' + 10000000;
const baseGetParams = `${recvWindowParam}&${timeStampParam}`;

// generate the hash from the required parameters
const generatedHash = crypto.createHmac('sha256', secretKey)
    .update(baseGetParams)
    .digest('hex');

// GET Endpoints
const allPrices = '/api/v1/ticker/allPrices';
const getPrice = '/api/v3/ticker/price';
const checkServerTime = '/api/v1/time';
const accountInfo = '/api/v3/account';

// POST Endpoints
const withdrawHistory = '/wapi/v3/withdrawHistory.html';

// SIGNED GET REQUESTS URI TEMPLATE
// ${baseUrl}${<GET-ENDPOINT>}?${<GET-PARAMS>}&signature=${generated_hash}`

/* GET URI Strings */
// Signed
const withdrawHistoryUri = `${baseUrl}${withdrawHistory}?${baseGetParams}&signature=${generatedHash}`;
const accountInfoUri = `${baseUrl}${accountInfo}?${baseGetParams}&signature=${generatedHash}`;


// Unsigned
const checkServerTimeUri = baseUrl + checkServerTime;
const allPricesUri = `${baseUrl}${allPrices}`;
const getPriceUri = `${baseUrl}${getPrice}`;


// Price Conversion
const currentBtcPrice = 10881.58;
const currentEthPrice = 1000;


// Returns a list of coins & quantity of holdings
getAllCoinsInAccount = async() => {
    var options = {
        method: 'GET',
        uri: accountInfoUri,
        headers: {
            'User-Agent': 'Request-Promise',
            'X-MBX-APIKEY': apiKey,
        },
        json: true
    };
    let stuff = await rp(options)
    .then(res => res.balances.filter(x => x.free > 0))
    .catch(err => {
        console.log(err);
        console.log("THERE WAS AN ERROR");
    });
    return stuff;
}

// Returns a list of coins & quantity of holdings
getPriceByTradingPair = async tradingPair => {
    var options = {
        method: 'GET',
        uri: getPriceUri + `?symbol=${tradingPair}`,
        headers: {
            'User-Agent': 'Request-Promise',
            'X-MBX-APIKEY': apiKey,
        },
        json: true
    };
    let stuff = await rp(options)
    .then(res => console.log(res))
    .catch(err => {
        console.log(err);
        console.log("THERE WAS AN ERROR");
    });
    return stuff;
}
//getPriceByTradingPair('ETHBTC');

// Right now this just returns a string of avaiable pair symbols
getAllAvailableTradingPairsForSymbol = async (symbolName) => {
    var options = {
        method: 'GET',
        uri: getPriceUri,
        headers: {
            'User-Agent': 'Request-Promise',
            'X-MBX-APIKEY': apiKey,
        },
        json: true
    };
    let stuff = await rp(options)
    .then(res => res.filter(x => x.symbol.indexOf(symbolName) == 0))
    .then(n => console.log(`available pairs: ${n.map(s => s.symbol.slice(3))}`))
    .catch(err => {
        console.log(err);
        console.log("THERE WAS AN ERROR");
    });
    return stuff;
}
getAllAvailableTradingPairsForSymbol('ICX');

// Gets the latest price for a symbol pair passed in i.e. ('ETHBTC')
getLatestPrice = async symbol => {
    const options = {
        method: 'GET',
        uri: getPriceUri, //allPricesUri,
        headers: {
            'User-Agent': 'Request-Promise',
            'X-MBX-APIKEY': apiKey,
        },
        json: true
    };
    let stuff = rp(options).then(res => res.filter(x => x.symbol == symbol))
    .catch(err => {
        console.log(err);
        console.log("THERE WAS AN ERROR");
    });   
    return stuff;
}


// Execute chain:
// getAllCoinsInAccount().then(coinInfoList => {
//     // Returns an array of json like this: { asset: 'BTC', free: '0.00000000', locked: '0.00000000' }
//     // Pass in the assets, one by one, and get an array with the latest price as paired with BTC: [ { symbol: 'OMGBTC', price: '0.00150300' } ]
//     coinInfoList.map(coinInfo => getLatestPrice(coinInfo.asset + 'BTC').then(altBtcPairAndPrice => {  
//         altBtcPairAndPrice.map(flatPair => {
//             const usdValue = parseFloat(flatPair.price) * parseFloat((coinInfo.free + coinInfo.locked)) * parseFloat(currentBtcPrice);
//             if (usdValue > 10) {
//                 const fullInfoObject = {
//                     assetName: coinInfo.asset,
//                     quantity: (parseFloat(coinInfo.free) + parseFloat(coinInfo.locked)),
//                     btcValue: flatPair.price,
//                     usdValue: usdValue
//                 };
//                 console.log(fullInfoObject);
//             }
//         }); 
//     }));
// });

/**-----------KUCOIN------------------ */

// generate the hash from the required paramaters
const generatedHashKucoin = crypto.createHmac('sha256', secretKey)
    .update(baseGetParams)
    .digest('hex');

// Returns a list of coins & quantity of holdings
getAllCoinsInAccount = async() => {
    var options = {
        method: 'GET',
        uri: accountInfoUri,
        headers: {
            'User-Agent': 'Request-Promise',
            "KC-API-KEY": keys.kucoin.apiKey,  
            "KC-API-NONCE" : timestamp,   //Client timestamp (exact to milliseconds), before using the calibration time, the server does not accept calls with a time difference of more than 3 seconds
            "KC-API-SIGNATURE" : 'xxx'    //signature after client encryption
        },
        json: true
    };
    let stuff = await rp(options)
    .then(res => res.balances.filter(x => x.free > 0))
    .catch(err => {
        console.log(err);
        console.log("THERE WAS AN ERROR");
    });
    return stuff;
}

/**
 * Display coin's value in any available trading pairs, sort by highest:


 * 
 */
