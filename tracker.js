const google = require('googleapis');
const sheets = google.sheets('v4');
const moment = require('moment-timezone');

function Tracker(){
  this.ranges = {
    sleeping: function(topRight=2, bottomLeft=33){
      return `C${topRight}:D${bottomLeft}`;
    },
    waking: function(topRight=2, bottomLeft=33){
      return `E${topRight}:F${bottomLeft}`;
    } 
  };
  
  this.retrieveRows = function(type, sheetId, oauthClient){
    if(type !== 'sleeping' && type !== 'waking'){
      throw new Error('Invalid type - type must be either \'sleeping\' or \'waking\'');
    }
    const request = {
      spreadsheetId: sheetId,
      range: this.ranges[type](), 
      auth: oauthClient
    };
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.get(request, function(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response.values);
        }
      });
    });
  };
    
  this.appendTimeStamp = function(type, data, sheetId, oauthClient){
    //Tack data onto the bottom of the spreadsheet range
    const appendIndex = data.length + 2; //NOTE:Add 2, +1 for skipping header row, +1 for index to append at
    //Compute current date/time for append
    const currMoment = moment().tz('America/New_York'); 
    console.log(currMoment);
    const currDate = currMoment.format('MM/DD/YYYY');
    const currTime = currMoment.format('hh:mm:ss a');
    console.log(currTime);
    //Build the API request
    const request = {
      spreadsheetId: sheetId,
      auth: oauthClient,
      range: this.ranges[type](appendIndex, appendIndex),
      valueInputOption: 'USER_ENTERED',
      resource: {
        values:[
          [currDate,currTime]
        ]
      }
    };
    //Tell Google to append the timestamp to the sheet
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.update(request, function(err, response){
        if(err)
          reject(err)
        else
          resolve();
      });
    });
  }
}


module.exports = Tracker;