
AWS.config.update({
    region: "us-west-2",
    // The endpoint should point to the local or remote computer where DynamoDB (downloadable) is running.
    endpoint: 'http://localhost:8000',
    /*
      accessKeyId and secretAccessKey defaults can be used while using the downloadable version of DynamoDB. 
      For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
    */
    //accessKeyId: "fakeMyKeyId",
    //secretAccessKey: "fakeSecretAccessKey"
  });
  
    /* 
       Uncomment the following code to configure Amazon Cognito and make sure to 
       remove the endpoint, accessKeyId and secretAccessKey specified in the code above. 
       Make sure Cognito is available in the DynamoDB web service region (specified above).
       Finally, modify the IdentityPoolId and the RoleArn with your own.
    */
  
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "ap-southeast-2:d8f9f45c-af26-4c28-b8ae-aa8ee13a35dc",
    //RoleArn: "arn:aws:iam::123456789012:role/dynamocognito"
  });
    
  var dynamodb = new AWS.DynamoDB();
  var docClient = new AWS.DynamoDB.DocumentClient();
  function createAnnotations() {
      var params = {
          TableName : "Annotations",
          KeySchema: [
              { AttributeName: "year", KeyType: "HASH"},
              { AttributeName: "title", KeyType: "RANGE" }
          ],
          AttributeDefinitions: [       
              { AttributeName: "year", AttributeType: "N" },
              { AttributeName: "title", AttributeType: "S" }
          ],
          ProvisionedThroughput: {       
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
          }
      };
  
      dynamodb.createTable(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML = "Unable to create table: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              document.getElementById('textarea').innerHTML = "Created table: " + "\n" + JSON.stringify(data, undefined, 2);
          }
      });
  }
  
  function deleteAnnotations() {
      var params = {
          TableName : "Annotations"
      };
  
      dynamodb.deleteTable(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML = "Unable to delete table: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              document.getElementById('textarea').innerHTML = "Table deleted.";
          }
      });
  }
  
  function listAnnotations() {
      var params = {};
      dynamodb.listTables(params, function(err, data) {
      if (err){
          document.getElementById('textarea').innerHTML = "Unable to list tables: " + "\n" + JSON.stringify(err, undefined, 2);
      }
      else{
       document.getElementById('textarea').innerHTML = "List of tables: " + "\n" + JSON.stringify(data, undefined, 2);
      }
  });
  }
  
  function createItem() {
      var params = {
          TableName :"Annotations",
          Item:{
              "year": 2015,
              "title": "The Big New Movie",
              "info":{
                  "plot": "Nothing happens at all.",
                  "rating": 0
              }
          }
      };
      docClient.put(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML = "Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              document.getElementById('textarea').innerHTML = "PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
          }
      });
  }
  
  function readItem() {
      var table = "Annotations";
      var year = 2015;
      var title = "The Big New Movie";
  
      var params = {
          TableName: table,
          Key:{
              "year": year,
              "title": title
          }
      };
      docClient.get(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML = "Unable to read item: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              document.getElementById('textarea').innerHTML = "GetItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
          }
      });
  }
  
  function updateItem() {
      var table = "Annotations";
      var year = 2015;
      var title = "The Big New Movie";
  
      var params = {
          TableName:table,
          Key:{
              "year": year,
              "title": title
          },
          UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
          ExpressionAttributeValues:{
              ":r":5.5,
              ":p":"Everything happens all at once.",
              ":a":["Larry", "Moe", "Curly"]
          },
          ReturnValues:"UPDATED_NEW"
      };
  
      docClient.update(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML = "Unable to update item: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              document.getElementById('textarea').innerHTML = "UpdateItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
          }
      });
  }
  
  function deleteItem() {
      var table = "Annotations";
      var year = 2015;
      var title = "The Big New Movie";
  
      var params = {
          TableName:table,
          Key:{
              "year":year,
              "title":title
          }
      };
      docClient.delete(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML = "Unable to delete item: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              document.getElementById('textarea').innerHTML = "DeleteItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2);
          }
      });
  }
  
  function queryData() {
      document.getElementById('textarea').innerHTML = "";
      document.getElementById('textarea').innerHTML += "Querying for annotations from 1985.";
  
      var params = {
          TableName : "Annotation",
          KeyConditionExpression: "#yr = :yyyy",
          ExpressionAttributeNames:{
              "#yr": "year"
          },
          ExpressionAttributeValues: {
              ":yyyy":1985
          }
      };
  
      docClient.query(params, function(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML += "Unable to query. Error: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              data.Items.forEach(function(movie) {
                  document.getElementById('textarea').innerHTML += "\n" + movie.year + ": " + movie.title;
              });
           
          }
      });
  }
  
  function scanData() {
      document.getElementById('textarea').innerHTML = "";
      document.getElementById('textarea').innerHTML += "Scanning for annotation between 1950 and 1975." + "\n";
  
      var params = {
          TableName: "Annotations",
          ProjectionExpression: "#yr, title, info.rating",
          FilterExpression: "#yr between :start_yr and :end_yr",
          ExpressionAttributeNames: {
              "#yr": "year"
          },
          ExpressionAttributeValues: {
              ":start_yr": 1950,
              ":end_yr": 1975
          }
      };
  
      docClient.scan(params, onScan);
  
      function onScan(err, data) {
          if (err) {
              document.getElementById('textarea').innerHTML += "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2);
          } else {
              // Print all the Annotations
              document.getElementById('textarea').innerHTML += "Scan succeeded: " + "\n";
              data.Items.forEach(function(movie) {
                  document.getElementById('textarea').innerHTML += movie.year + ": " + movie.title + " - rating: " + movie.info.rating + "\n";
              });
  
              // Continue scanning if we have more Annotations (per scan 1MB limitation)
              document.getElementById('textarea').innerHTML += "Scanning for more..." + "\n";
              params.ExclusiveStartKey = data.LastEvaluatedKey;
              docClient.scan(params, onScan);            
          }
      }
  }
  
  function processFile(evt) {
      var annotationProcessed = 0;
      document.getElementById('textarea').innerHTML = "";
      document.getElementById('textarea').innerHTML += "Importing annotation into DynamoDB. Please wait..." + "\n";
      var file = evt.target.files[0];
      if (file) {
          var r = new FileReader();
  
          r.onload = function(e) {
              var contents = e.target.result;
              var allAnnotations = JSON.parse(contents);
  
              allAnnotations.forEach(function (movie) {
  
                  var params = {
                      TableName: "Annotations",
                      Item: {
                          "year": movie.year,
                          "title": movie.title,
                          "info": movie.info
                      }
                  };
                  docClient.put(params, function (err, data) {
                      ++annotationsProcessed;
                      if (err) {
                          console.log("Unable to add movie: " + movie.title + "\n");
                      } else {
                          switch(annotationsProcessed) {
                              case 2501:
                                  document.getElementById('textarea').innerHTML += "_______________" + "\n";
                                  document.getElementById('textarea').innerHTML += "Halfway done..." + "\n";
                                  document.getElementById('textarea').innerHTML += "_______________" + "\n";
                                  break;
                              case 3751:
                                  document.getElementById('textarea').innerHTML += "______________" + "\n";
                                  document.getElementById('textarea').innerHTML += "Almost done..." + "\n";
                                  document.getElementById('textarea').innerHTML += "______________" + "\n";
                                  break;
                              case 5001:
                                  document.getElementById('textarea').innerHTML += "______________________" + "\n";
                                  document.getElementById('textarea').innerHTML += "Finished processing!" + "\n";
                                  document.getElementById('textarea').innerHTML += "______________________" + "\n";
                                  break;
                              default: document.getElementById('textarea').innerHTML += "Added: " + movie.title + "\n";
                          }
                          textarea.scrollTop = textarea.scrollHeight;
                      }
                  });
              });
      };
          r.readAsText(file);
      } else {
          alert("Could not read movie data file");
      }
  }  