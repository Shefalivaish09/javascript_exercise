//protect global data to override
(function(){

//to require the fs module of node
var fs = require('fs');

//input file
var inputFile = 'inputFile/Production-Department_of_Agriculture_and_Cooperation_1.csv';
var result = [];
var dataLength;
var headers;

//read the csv file
fs.readFile(inputFile,"utf-8",function(err,data){
  if(err)
  {
    return console.log(err);
  }

  //perform the manupilation on the read data to push data in array of object
  var lines=data.split("\n");
      dataLength= lines.length;
      headers=lines[0].split(",");
  for(var i=1;i<dataLength-1;i++){
  var obj = {};
  var currentline=splitCSV(lines[i]);//.split(",");
  for(var j=0;j<headers.length;j++){
        if(headers[j].substr(0,3)===" 3-")
        {
          headers[j]="yr_"+headers[j].substr(3,4);
        }
		     obj[headers[j]] = currentline[j];
   }
  result.push(obj);
  }

//call function for first requirement
dataMunging();
});

//function to split data in csv file
function splitCSV(text){
  var repl = text.replace(", "," ");
  return repl.trim().split(",");
};

var dataMunging=function(){
   var oilseed_crop =[];
   var foodgrain_crop =[];
   var aggrComm =[];
   var oilseedFilter1="Agricultural Production Oilseeds ";
   var oilseedFilterYear="yr_2013";
   var foodgrainFilter1="Agricultural Production Foodgrains ";
   var foodgrainFilterYear="yr_2013";
   var commercialCropFilter1 ="Commercial";
   var lookUp =[];
   var southern ={southern_state:['Karnataka','Andhra Pradesh','Tamil Nadu','Kerala','Telangana']};
   lookUp.push(southern);
   var riceProd=[];
   var riceProdFilter1="Agricultural Production Foodgrains Rice Yield";

   for(var y=3;y<headers.length;y++){
       var flagRice=false;
       var flagCommercial = false;
       var sum =0;
       var year = headers[y];
       var value =0;
       var riceProdData={};
       for (var k=0;k<dataLength-2;k++){
        if((result[k].Particulars.indexOf(riceProdFilter1))>-1)
          {
            for(var i=0;i<lookUp[0].southern_state.length;i++)
            {
              if(result[k].Particulars.indexOf(lookUp[0].southern_state[i])>-1)
              {
                var rowObj = result[k];
                if(rowObj[year] !== "NA")
                {
                riceProdData["year"]=headers[y];
                value = parseFloat(rowObj[year]);
                riceProdData[lookUp[0].southern_state[i]]=value;
               }
              }
            }
          }
         else if((result[k].Particulars.indexOf(commercialCropFilter1))>-1)
           {
             var rowObj = result[k];
             if(rowObj[year] === "NA")
             {
               rowObj[year]=0;
             }
             sum = sum + parseFloat(rowObj[year]);
             flagCommercial=true;
           }
         else if( (headers[y].indexOf(oilseedFilterYear))>-1 && (result[k].Particulars.indexOf(oilseedFilter1))>-1 && (result[k].yr_2013 !=="NA"))
          {
           if((result[k].Particulars.indexOf("Kharif"))>-1 || (result[k].Particulars.indexOf("Rabi"))>-1)
           {
             if((result[k].Particulars.replace(oilseedFilter1,"")!=="Kharif") && (result[k].Particulars.replace(oilseedFilter1,"")!=="Rabi"))
             {
                var oilseed = {};
                oilseed.x = result[k].Particulars.replace(oilseedFilter1,"");
                oilseed.y =parseFloat(result[k].yr_2013);
                oilseed_crop.push(oilseed);
             }
           }
          }
         else if ((headers[y].indexOf(foodgrainFilterYear))>-1 && (result[k].Particulars.indexOf(foodgrainFilter1))>-1 && (result[k].yr_2013 !=="NA"))
          {
            if((result[k].Particulars.indexOf("Area"))===-1 && (result[k].Particulars.indexOf("Volume"))===-1 && (result[k].Particulars.indexOf("Yield"))===-1 )
               {
                 if((result[k].Particulars.indexOf("Kharif"))>-1 || (result[k].Particulars.indexOf("Rabi"))>-1)
                 {
                 if((result[k].Particulars.replace(foodgrainFilter1,"")!=="Kharif") && (result[k].Particulars.replace(foodgrainFilter1,"")!=="Rabi") && (result[k].Particulars.replace(foodgrainFilter1,"")!=="Production Foodgrains Coarse Cereals Rice Kharif"))
                  {
                    var foodgrain = {};
                    foodgrain.x = result[k].Particulars.replace(foodgrainFilter1,"");
                    foodgrain.y =parseFloat(result[k].yr_2013);
                    foodgrain_crop.push(foodgrain);
                  }
                 }
              }
         }
       }
     if(flagCommercial===true)
     {
       var aggrComm_data ={};
       aggrComm_data.x=headers[y];
       aggrComm_data.y=sum;
       aggrComm.push(aggrComm_data);
     }
     var isNotEmpty =  function (riceProdData) {
     for(var key in riceProdData)
        {
           if(riceProdData.hasOwnProperty(key))
           {
               flagRice = true;
           }
        }
        if (flagRice===true)
        {
            riceProd.push(riceProdData);
        }
     };

     isNotEmpty(riceProdData);
   }
  //sorting data in descending order
  oilseed_crop.sort(function(a, b) { return b.y - a.y; });

  foodgrain_crop.sort(function(a, b) { return b.y - a.y; });

  //write to file
  var resultOilseed=  JSON.stringify(oilseed_crop);
  dataToJson('outputfile/oilseedVsProduction.json',resultOilseed);

  var resultFoodgrain=  JSON.stringify(foodgrain_crop);
  dataToJson('outputfile/foodgrainVsProduction.json',resultFoodgrain);

  var resultCropAggr=  JSON.stringify(aggrComm);
  dataToJson('outputfile/commCropAggrValueVsYear.json',resultCropAggr);

  var resultRiceProd=  JSON.stringify(riceProd);
  dataToJson('outputfile/riceProductionStateValueVsYear.json',resultRiceProd);
};

//code to convert data into json format
var dataToJson = function(file_name,file_data){
    fs.writeFile(file_name, file_data, function (err) {
     if (err) {
       console.log('There has been an error saving your configuration data.');
       console.log(err.message);
       return;
     }
     console.log(file_name + ' file saved successfully.');
     });
   };
}());
