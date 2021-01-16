const axios = require('axios');
const qs = require('qs');

let dateParam = [];
let count = 0;

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Get the latest 5 TradeDates
axios
  .get(`http://localhost:1337/trade-dates?_limit=5&_sort=Date:DESC`)
  .then(function (response) {
    if (response.data) {
      response.data.forEach((row) => {
        dateParam.push(row.Date);
      });
    }
  })
  .catch(function (error) {
    //console.log(error);
  });

// Get the record count
axios
  .get(`http://localhost:1337/holdings/count`)
  .then(function (response) {
    if (response.data) {
      count = response.data;
    }
  })
  .catch(function (error) {
    //console.log(error);
  });

sleep(5000).then(() => {
  axios
    .get(`http://localhost:1337/holdings?_limit=${count}`)
    .then(function (response) {
      if (response.data) {
        response.data.forEach((row) => {
          let _id = row.id;
          let _ticker = row.Ticker;
          let _shares = row.Shares;
          let amount = 0;
          let pct = 0;
          let query_get = qs.stringify({
            _where: [{ Date: dateParam }, { Ticker: _ticker }],
          });

          axios
            .get(`http://localhost:1337/daily-trades?${query_get}`)
            .then(function (response) {
              if (response.data) {
                response.data.forEach((row) => {
                  amount = amount + parseInt(row.Amount);
                });

                pct = (amount * 100) / (_shares - amount);
                pct = pct.toFixed(2);

                axios
                  .put(`http://localhost:1337/holdings/${_id}`, {
                    Diff_5Day: amount,
                    Pct_5Day: pct,
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
        });
      }
    })
    .catch(function (error) {
      //console.log(error);
    });
});
