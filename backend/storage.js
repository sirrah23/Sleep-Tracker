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
  
  this.overwriteWithHeader = function(filename){
    fs.writeFileSync(filename, this.headers.join(',')+'\n');
  }
  
  this.existsElseCreate = function(){
    const filename = this.computeFilename();
    if(!fs.existsSync(filename)){
      this.overwriteWithHeader();
    }
  }
  
  //TODO: Merge readByUserId and readByUUID (almost identical)
  this.readByUserId = function(userid){
    return new Promise((resolve, reject)=>{
      csv.mapFile(this.computeFilename(), function(err, data){
        if(err){
          reject(err);
          return;
        }
        if(!userid){ //Caller wants all the data
          resolve(data);  
          return''
        }
        resolve(data.filter((d) => d.userid === userid));
      });
    });
  }
  
  this.readByUUID = function(uuid){
    return new Promise((resolve, reject)=>{
      csv.mapFile(this.computeFilename(), function(err, data){
        if(err){
          reject(err);
          return;
        }
        if(!uuid){ //Caller wants all the data
          resolve(data);  
          return;
        }
        resolve(data.filter((d) => d.uuid === uuid));
      });
    });
  }
  
  //Super inefficient user id removal where we just erase the whole file
  //and rewrite to it without the data we wanted to remove
  //TODO: Optimize this
  this.removeUserId = function(userid){
    return this.readByUUID()
      .then((data) => {
        return new Promise((resolve, reject) => {
          resolve(data.filter((d) => d.userid !== userid))
        })
      })
      .then((newData) => {
        return new Promise((resolve, reject) => {
          const reducer = (acc, curr) => acc += `${curr.uuid},${curr.userid},${curr.sheet_key}\n`;
          const newCSV = newData.reduce(reducer, "")
          const filename = this.computeFilename()
          this.overwriteWithHeader(filename);
          fs.appendFileSync(filename, newCSV);
          resolve(true);
        })
      })
      .catch((err) => {
        return new Promise((resolve, reject) => {
          console.log(err);
          resolve(false);
        })
      });
  }
  
  this.write = function(userId, sheetId){
    const filename = this.computeFilename();
    return new Promise((resolve, reject) => {
      const uuid = uuidv1(); //Generate Id for new entry
      const data = [uuid, userId, sheetId].join(',') + '\n';
      fs.appendFileSync(filename, data)
      resolve(uuid);
    });
  }
  
  this.initDB = function(){
    this.existsElseCreate();  
  }
  
}

module.exports = Storage;