const XLSX = require('xlsx');
const axios = require('axios');
const qs = require('qs');

let tradeBook = XLSX.readFile('./ARK_Trade.xls');
let sheetNames = tradeBook.SheetNames;
let worksheet = tradeBook.Sheets[sheetNames[0]];
let tradeMap = new Map();

// First row
let range = XLSX.utils.decode_range(worksheet['!ref']);
range.s.r = 3;
range.e.r = 4;
let newRange = XLSX.utils.encode_range(range);
let firstRow = XLSX.utils.sheet_to_json(worksheet, { range: newRange });

// Insert into TradeDates
firstRow.forEach((row) => {
  axios
    .post('http://localhost:1337/trade-dates', {
      Date: row.Date,
    })
    .then(function (response) {
      //console.log(response);
    })
    .catch(function (error) {
      //console.log(error);
    });
});

// All rows except the header
let dataRow = XLSX.utils.sheet_to_json(worksheet, { range: 3 });

dataRow.forEach((row) => {
  let date = row.Date;
  let fund = row.FUND;
  let ticker = row.Ticker.toString();
  let name = row.Name;
  let amount =
    row.Direction === 'Sell' ? -1 * parseInt(row.Shares) : parseInt(row.Shares);

  if (ticker !== undefined) {
    if (tradeMap.get(ticker) !== undefined) {
      tradeMap.set(ticker, [name, amount + parseInt(tradeMap.get(ticker)[1])]);
    } else {
      tradeMap.set(ticker, [name, amount]);
    }

    //Insert into DailyTrades
    axios
      .post('http://localhost:1337/daily-trades', {
        Date: date,
        Fund: fund,
        Ticker: ticker,
        Amount: amount,
      })
      .then(function (response) {
        //console.log(response);
      })
      .catch(function (error) {
        //console.log(error);
      });
  }
});

// tradeMap.forEach((value, ticker) => {
//   let query_get = qs.stringify({ _where: { Ticker: ticker } });

//   // Update Holdings
//   axios
//     .get(`http://localhost:1337/holdings?${query_get}`)
//     .then(function (response) {
//       if (response.data[0]) {
//         let _id = response.data[0].id;
//         let _shares = parseInt(response.data[0].Shares) + parseInt(value[1]);

//         axios
//           .put(`http://localhost:1337/holdings/${_id}`, {
//             Ticker: ticker,
//             Name: value[0],
//             Shares: _shares,
//             Diff_5Day: 0,
//             Pct_5Day: 0,
//           })
//           .then(function (response) {
//             //console.log(response);
//           })
//           .catch(function (error) {
//             //console.log(error);
//           });
//       } else {
//         axios
//           .post('http://localhost:1337/holdings', {
//             Ticker: ticker,
//             Name: value[0],
//             Shares: parseInt(value[1]),
//             Diff_5Day: 0,
//             Pct_5Day: 0,
//           })
//           .then(function (response) {
//             //console.log(response);
//           })
//           .catch(function (error) {
//             //console.log(error);
//           });
//       }
//     })
//     .catch(function (error) {
//       //console.log(error);
//     });
// });
