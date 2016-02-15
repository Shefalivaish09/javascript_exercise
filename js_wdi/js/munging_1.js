var fs  = require("fs");
var headers= [];
var result = [];
var dataLength;
var gdp=[];
var gni =[];
var result1=[];
var gdpPC=[];
var gniPC =[];
var result2=[];
var indiaGDP=[];
var continent=[];
var continentWiseDataList=[];
var ContinentAggregate = {};

//reading continent wise country code csv file and creating an array map
fs.readFile('inputFile/countryCode.csv',"utf-8",function(err,data){
  if(err)
  {
    return console.log(err);
  }
  var lines = data.split("\n");
  for(var i=1;i<lines.length-1;i++){
  var countryline=splitCSV(lines[i]);
  continent[countryline[0]]=countryline[1];
  }
});

//function to split data in countryCode.csv file
function splitCSV(text){
  var repl = text.replace(", "," ");
  var repl1=repl.replace(", "," ");
  return repl1.trim().split(",");
}

//reading content file using stream reader
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('inputFile/WDI_Data.csv', {encoding: 'utf8'})
});

//calling function for every process line
lineReader.on('line', function (line) {

  if(typeof headers[0] === 'undefined')
  {
    headers=line.split(",");
    createfinalMap(headers);
  }
  else if (typeof headers[0] !== 'undefined') {
      dataMunging(line);
     }
  });

  //calling function after the last line processed
lineReader.on('close', function () {
  dataSort(gdp,gni,result1);
  dataSort(gdpPC,gniPC,result2);
  postprocessingContinentAggdata();
  dataToJson('outputfile/gdpVsGni.json',JSON.stringify(result1));
  dataToJson('outputfile/gdpPerCapitaVsGniPercapita.json',JSON.stringify(result2));
  dataToJson('outputfile/indiaGDP.json',JSON.stringify(indiaGDP));
  dataToJson('outputfile/aggregatedGDP.json',JSON.stringify(continentWiseDataList));
 });

function dataMunging(line){
  var currentline=line.split(",");
  var  dataLength=currentline.length;

//code to filter for first requirement
  if(currentline[3]==="NY.GDP.MKTP.KD" && currentline[49]!=="")
    {
      var obj ={};
      obj["country"]=currentline[0];
      obj["gdp2005"]=parseFloat(currentline[49]);
      gdp.push(obj);
    }
  else if(currentline[3]==="NY.GNP.MKTP.KD" && currentline[49]!=="")
    {
      for(var i =0 ;i<gdp.length;i++){
        if(typeof gdp[i]!=='undefined')
        {
          var gdp_country=gdp[i].country;
          if(currentline[0]===gdp_country)
           {
          var obj ={};
          obj["country"]=currentline[0];
          obj["gni2005"]=parseFloat(currentline[49]);
          gni.push(obj);
          }

        }
      }
    }

//code to filter for second requirement
  else if(currentline[3]==="NY.GDP.PCAP.KD")
    {
     if(currentline[49]!=="")
      {
        var obj ={};
        obj["country"]=currentline[0];
        obj["gdp2005"]=parseFloat(currentline[49]);
        gdpPC.push(obj);
      }

      //code to calculate aggregated data for continents

     if(currentline[1] in continent)
      {
        continentWiseData(currentline,continent[currentline[1]]);
      }
    }

  else if(currentline[3]==="NY.GNP.PCAP.KD" && currentline[49]!=="")
    {
        for(var i =0 ;i<gdpPC.length;i++){
          if(typeof gdp[i]!=='undefined')
          {
            var gdpPC_country=gdpPC[i].country;
            if(currentline[0]===gdpPC_country)
             {
            var obj ={};
            obj["country"]=currentline[0];
            obj["gni2005"]=parseFloat(currentline[49]);
            gniPC.push(obj);
            }

          }
        }
      }

//code to filter for third requirement
  else if(currentline[0]==="India" && currentline[3]==="NY.GDP.MKTP.KD.ZG")
    {
      for (var i = 4; i < dataLength; i++) {
        obj={};
        obj["x"]=headers[i];
        obj["y"]=parseFloat(currentline[i]);
        indiaGDP.push(obj);
      }
    }
 }

//function to calculate aggregated data according to continents
 function continentWiseData(line,continentName){
   for(var i = 4; i<line.length;i++)
   {
     if(line[i]!=="")
     {
     var temmap=ContinentAggregate[headers[i]];
     temmap[continentName]=parseFloat(temmap[continentName])+parseFloat(line[i]);
     }
   }
 }
 function createfinalMap(headingArray){

   for (var i = 4; i < headingArray.length; i++) {
     var obj ={};
     obj["year"]=headingArray[i];
     obj["AF"]=0;
     obj["AS"]=0;
     obj["NA"]=0;
     obj["SA"]=0;
     obj["OC"]=0;
     obj["EU"]=0;

     ContinentAggregate[headingArray[i]]=obj;
   }

 }
function postprocessingContinentAggdata(){
  continentWiseDataList;
  var MapKeys = Object.keys(ContinentAggregate);
    for (var i = 0; i < MapKeys.length; i++) {
      continentWiseDataList.push(ContinentAggregate[MapKeys[i]]);
    }
}

//code to sort top 15 gdp and gdp per capita
function dataSort(gdpValue,gniValue,finalResult){
  gdpValue.sort(function(a, b) { return b.gdp2005 - a.gdp2005; });
    for (var i = 0 ; i <15;i++)
    {
      for(var j = 0;j <gniValue.length;j++)
      {
      if(gdpValue[i].country===gniValue[j].country)
      {
        var obj ={};
        obj["Country"]=gdpValue[i].country;
        obj["GDP"]=gdpValue[i].gdp2005;
        obj["GNI"]=gniValue[j].gni2005;
        finalResult.push(obj);
      }
     }
    }
}

//code for creating json file
var dataToJson = function(file_name,file_data){
    fs.writeFile(file_name, file_data, function (err) {
     if (err) {
       console.log('There has been an error saving your configuration data.');
       console.log(err.message);
       return;
     }
     console.log(file_name + ' file saved successfully.');
     });
  }
