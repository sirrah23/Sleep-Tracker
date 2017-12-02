const google = require('googleapis');
const sheets = google.sheets('v4');
const moment = require('moment-timezone');

function Tracker(){
  this.ranges = {
    sleeping: function(topRight, bottomLeft){
      return `C${topRight}:D${bottomLeft}`;
    },
    waking: function(topRight, bottomLeft){
      return `E${topRight}:F${bottomLeft}`;
    } 
  };
  
  this.retrieveRows = function(type, sheetId, oauthClient){
    const range = this.computeSheetIndex(type);
    const request = {
      spreadsheetId: sheetId,
      range,
      auth: oauthClient
    };
    console.log(request.range);
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
    const range = this.computeSheetIndex(type, appendIndex, appendIndex);
    const request = {
      spreadsheetId: sheetId,
      range,
      auth: oauthClient,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values:[
          [currDate,currTime]
        ]
      }
    };
    console.log(request.range);
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
  
  //A tab in the sheet will havet he format <Month>-<Year>
  this.getCurrentSheetTab = function(){
    const currMoment = moment().tz('America/New_York');
    return currMoment.format('MMMM-YYYY');
  };
  
  //Return <Sheet>!<Index> i.e. syntax for accessing cells in Google Sheets
  this.computeSheetIndex = function(type, topLeft=2, bottomRight=33){
    if(type !== 'sleeping' && type !== 'waking'){
      throw new Error('Invalid type - type must be either \'sleeping\' or \'waking\'');
    }
    return `'${this.getCurrentSheetTab()}'!${this.ranges[type](topLeft, bottomRight)}`
  }
}


module.exports = Tracker;