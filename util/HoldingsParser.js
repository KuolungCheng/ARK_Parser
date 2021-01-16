const XLSX = require('xlsx');
const axios = require('axios');
const qs = require('qs');

let ARKF = XLSX.readFile('ARKF_HOLDINGS.xlsx');
let ARKG = XLSX.readFile('ARKG_HOLDINGS.xlsx');
let ARKK = XLSX.readFile('ARKK_HOLDINGS.xlsx');
let ARKQ = XLSX.readFile('ARKQ_HOLDINGS.xlsx');
let ARKW = XLSX.readFile('ARKW_HOLDINGS.xlsx');
let ARK_FUNDS = [ARKF];

ARK_FUNDS.forEach((fund) => {
  let worksheet = fund.Sheets[fund.SheetNames[0]];
  let dataRow = XLSX.utils.sheet_to_json(worksheet, { range: 1 }); // All rows except the header

  dataRow.forEach((row) => {
    let ticker = row.Ticker.toString();
    let name = row.Company;
    let shares = parseInt(row.Shares);
    let query_get = qs.stringify({ _where: { Ticker: ticker } });

    if (ticker !== undefined) {
      axios
        .get(`http://localhost:1337/holdings?${query_get}`)
        .then(function (response) {
          if (response.data[0]) {
            let _id = response.data[0].id;
            let _shares = parseInt(response.data[0].Shares) + shares;

            axios
              .put(`http://localhost:1337/holdings/${_id}`, {
                Ticker: ticker,
                Name: name,
                Shares: _shares,
                Diff_5Day: 0,
                Pct_5Day: 0,
              })
              .then(function (response) {
                //console.log(response);
              })
              .catch(function (error) {
                //console.log(error);
              });
          } else {
            axios
              .post('http://localhost:1337/holdings', {
                Ticker: ticker,
                Name: name,
                Shares: shares,
                Diff_5Day: 0,
                Pct_5Day: 0,
              })
              .then(function (response) {
                //console.log(response);
              })
              .catch(function (error) {
                //console.log(error);
              });
          }
        })
        .catch(function (error) {
          //console.log(error);
        });
    }
  });
});
