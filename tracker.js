const google = require('googleapis');
const sheets = google.sheets('v4');

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
      throw 'Invalid type - type must be either \'sleeping\' or \'waking\''
    }
    const request = {
      spreadsheetId: sheetId,
      range: this.ranges[type](), 
      auth: oauthClient
    }
    return new Promise((resolve, reject) => {
      sheets.spreadsheets.values.get(request, function(err, response) {
        if (err) {
          reject(err)
        } else {
          resolve(response.values);
        }
      })
    });
  }
}

module.exports = Tracker;