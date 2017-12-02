const uuidv1 = require('uuid/v1')
const csv = require('node-csv').createParser();
const path = require('path')
const fs = require('fs');

function Storage(filename){
  this.data_dir = './data'
  this.storage_format = 'csv'
  this.filename = filename;
  
  this.computeFilename = function(){
    return `${path.resolve(this.data_dir,this.filename)}.${this.storage_format}`
  }
  
  this.existsElseCreate = function(){
    const filename = this.computeFilename();
    if(!fs.existsSync(filename)){
      //fs.openSync()
      fs.writeFileSync(filename,"id,user,sheet_key\n");
    }
  }
  
  this.read = function(){
    csv.mapFile(this.computeFilename, function(err, data){
      console.log(data);
    });
  }
  
  //Call upon creation
  this.existsElseCreate();
}

module.exports = Storage;