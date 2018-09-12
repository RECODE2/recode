var fs = require('fs');
const fsPath = require('fs-path');


var oggettoJSON = {
    info: {
    data: 5,
    yayo: "okok",
}
};


var json2 = JSON.parse(JSON.stringify(oggettoJSON));

json2.info.data = 6;

fsPath.writeFile("/home/saso/Desktop/oggettoJSON.json", JSON.stringify(oggettoJSON, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });

  fsPath.writeFile("/home/saso/Desktop/json2.json", JSON.stringify(json2, null, "\t"), function(err){
    if(err) {
      throw err;
    } else {
      console.log('Json fatto');
    }
  });