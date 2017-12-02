const uuidv1 = require('uuid/v1')
const csv = require('node-csv').createParser();
const path = require('path')
const fs = require('fs');

function Storage(filename){
  this.data_dir = './.data'
  this.storage_format = 'csv'
  this.filename = filename;
  this.headers = ["uuid", "userid", "sheet_key"];
  
  this.computeFilename = function(){
    return `${path.resolve(this.data_dir,this.filename)}.${this.storage_format}`
  }
  
  this.existsElseCreate = function(){
    const filename = this.computeFilename();
    if(!fs.existsSync(filename)){
      fs.writeFileSync(filename, this.headers.join(',')+'\n');
    }
  }
  
  //TODO: Implement other kinds of reads
  this.read = function(user){
    return new Promise((resolve, reject)=>{
      csv.mapFile(this.computeFilename(), function(err, data){
        if(err){
          reject(err);
          return;
        }
        if(!user){ //Caller wants all the data
          resolve(data);  
          return''
        }
        resolve(data.filter((d) => d.userid === user));
      });
    });
  }
  
  //Call upon creation
  this.existsElseCreate();
}

module.exports = Storage;