"use strict";

// Typescript works better
//import * as csv from "@fast-csv/parse";

//import { fs } from "fs";

const fs = require("fs");
const csv = require("fast-csv");
const csvSplitStream = require('csv-split-stream');
const { count } = require("console");
const express = require('express')

console.log("Hi");
let router = express.Router();
var server = express();
 
    // fs.readFile('sandpiles.csv', 'utf8', function (err, data) {
    //   var dataArray = data.split(/\r?\n/);
    //   console.log(dataArray);
    // });

    // fs.createReadStream('sandpiles.csv')
    //     .pipe(csv.parse())
    //     .on('error', error => console.error(error))
    //     .on('data', row => console.log(`ROW=${JSON.stringify(row)}`))
    //     .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

  router.post('/csvStreamer', async (req, res, next) => {

      console.log("Hello");
      let job = new JobPayload();
      job.input = new JobPayloadInput();
      job.input.urn = req.body.objectName;
      job.output = new JobPayloadOutput([
          new JobSvfOutputPayload()
      ]);
      job.output.formats[0].type = 'svf';
      job.output.formats[0].views = ['2d', '3d'];
      try {
          // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
          await new DerivativesApi().translate(job, {}, req.oauth_client, req.oauth_token);
          res.status(200).end();
      } catch(err) {
          next(err);
      }
  });
    var counter = 0;
    var f = fs.createReadStream('./output/sandpiles.csv')

    f
        .pipe(csv.parse())
        .on('error', error => console.error(error))
        .on('data', row => {

                  if(row[0] == 1){
                      counter++;
                      //console.log(counter);
                   }   
                    if(row[0]== 2){
                        f.pause()
                        f.emit("end")
                        // f.unpipe(csv.parse())
                        // csv.parse().end()
                    }
              }
              //console.log(`ROW=${JSON.stringify(row)}`)
         )
        //.on('end', rowCount => console.log(`Parsed ${rowCount} rows`));

    .on('end', rowCount =>{  _counterFn(counter); }
         // console.log(counter)
    );

    function _counterFn(counter){
        console.log(counter)
       const filepath = './output';
   
        var cell = counter;
   
       return csvSplitStream.split(
         fs.createReadStream('./output/sandpiles.csv'),
         {
           lineLimit: cell
         },
         (index) => fs.createWriteStream(`${filepath}/output-${index}.csv`)
       )
       .then(csvSplitResponse => {
         console.log('csvSplitStream succeeded.', csvSplitResponse);
         // outputs: {
         //  "totalChunks": 350,
         //  "options": {
         //    "delimiter": "\n",
         //    "lineLimit": "10000"
         //  }
         // }
       }).catch(csvSplitError => {
         console.log('csvSplitStream failed!', csvSplitError);
       });
   
    }
    
    module.exports = {
        _counterFn
    }