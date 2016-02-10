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
 var resultOilseed=oilseedVsProduction();
 dataToJson('outputfile/oilseedVsProduction.json',resultOilseed);

//call function for second requirement
var resultFoodgrain=foodgrainVsProduction();;
dataToJson('outputfile/foodgrainVsProduction.json',resultFoodgrain);

//call function for third requirement
 var resultCropAggr=commCropAggrValueVsYear();
 dataToJson('outputfile/commCropAggrValueVsYear.json',resultCropAggr);

 //call function for fourth requirement
var resultRiceProd = riceProduction();
dataToJson('outputfile/riceProductionStateValueVsYear.json',resultRiceProd);

});

//function to split data in csv file
function splitCSV(text){
  var repl = text.replace(", "," ");
  return repl.trim().split(",");
};

//filter the data based on the first requirement
var oilseedVsProduction=(function(){
               var oilseed_crop =[];
              for(var k=0;k < dataLength-2 ;k++){
              var index= result[k].Particulars.indexOf("Agricultural Production Oilseeds");
              if(index > -1 && (result[k].yr_2013 !=="NA"))
                  {
                   if((result[k].Particulars.indexOf("Kharif"))>-1 || (result[k].Particulars.indexOf("Rabi"))>-1)
                   {
                     if((result[k].Particulars.replace("Agricultural Production Oilseeds ","")!=="Kharif") && (result[k].Particulars.replace("Agricultural Production Oilseeds ","")!=="Rabi"))
                     {
                        var oilseed = {};
                        oilseed.x = result[k].Particulars.replace("Agricultural Production Oilseeds ","");
                        oilseed.y =parseFloat(result[k].yr_2013);
                        oilseed_crop.push(oilseed);
                     }
                   }
                  }
              }

              //sorting data in descending order
              oilseed_crop.sort(function(a, b) { return b.y - a.y; });

              //return json stringify data
              return JSON.stringify(oilseed_crop);
      });

//filter the data based on the second requirement
var foodgrainVsProduction=(function(){
          var foodgrain_crop =[];
          for(var k=0;k < dataLength-2 ;k++){
          var index= result[k].Particulars.indexOf("Agricultural Production Foodgrains");
          if(index>-1 && (result[k].yr_2013 !=="NA"))
              {
               if(
                 (result[k].Particulars.indexOf("Area"))===-1 && (result[k].Particulars.indexOf("Volume"))===-1 && (result[k].Particulars.indexOf("Yield"))===-1 )
               {
                 if((result[k].Particulars.indexOf("Kharif"))>-1 || (result[k].Particulars.indexOf("Rabi"))>-1)
                 {
                 if((result[k].Particulars.replace("Agricultural Production Foodgrains ","")!=="Kharif") && (result[k].Particulars.replace("Agricultural Production Foodgrains ","")!=="Rabi") && (result[k].Particulars.replace("Agricultural Production Foodgrains ","")!=="Production Foodgrains Coarse Cereals Rice Kharif"))
                 {
                    var foodgrain = {};
                    foodgrain.x = result[k].Particulars.replace("Agricultural Production Foodgrains ","");
                    foodgrain.y =parseFloat(result[k].yr_2013);
                    foodgrain_crop.push(foodgrain);
                 }
               }
              }
            }
          }

          //sorting data in descending order
          foodgrain_crop.sort(function(a, b) { return b.y - a.y; });

          //return json stringify data
          return JSON.stringify(foodgrain_crop);
  });

//filter the data based on the third requirement
var commCropAggrValueVsYear=(function(){
              var aggrComm =[];
              for(var y=3;y<headers.length;y++){
              var sum =0;
              var year = headers[y];
              for (var k=0;k<dataLength-2;k++){
                var index =result[k].Particulars.indexOf("Commercial");
                if(index>-1)
                {
                  var rowObj = result[k];
                  if(rowObj[year] === "NA")
                  {
                    rowObj[year]=0;
                  }
                  sum = sum + parseFloat(rowObj[year]);
                }
             }
             var aggrComm_data ={};
              aggrComm_data.x=headers[y];
              aggrComm_data.y=sum;
              aggrComm.push(aggrComm_data);
            }

            //return json stringify data
            return JSON.stringify(aggrComm);
  });

//filter the data based on the fourth requirement
var riceProduction=(function(){
      var lookUp =[];
      var southern ={southern_state:['Karnataka','Andhra Pradesh','Tamil Nadu','Kerala','Telangana']};
      lookUp.push(southern);
      var riceProd=[];
      for(var y=3;y<headers.length;y++){
        var year = headers[y];
        var value =0;
        var riceProdData={};
        for (var k=0;k<dataLength-2;k++) {
          if((result[k].Particulars.indexOf("Rice Yield"))>-1)
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
            }
      // to filter out the empty object
      var isNotEmpty =  function (riceProdData) {
              for(var key in riceProdData) {
                if(riceProdData.hasOwnProperty(key)){
                  riceProd.push(riceProdData);
                }
              }
          };

      isNotEmpty(riceProdData);

      }

      //return json stringify data
      return JSON.stringify(riceProd);
});

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
