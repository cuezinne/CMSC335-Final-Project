const http = require("http");
const express = require("express")
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const {MongoClient, ServerApiVersion} = require('mongodb');

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') });


const app = express();
const portNumber = process.argv[2];

/* going to wait to put the database username and password */

const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

serverStartDetails();


/* Server Functions */

/* 
    basic server start functions; this includes starting the server to the 
    correct port, stop command processing, page folder setting, 
    and page rendering(through app listen)
*/
function serverStartDetails(){
    process.stdin.setEncoding("utf8");

    console.log(`Web server is running at http://localhost:${portNumber}`);
    process.stdout.write(`Type stop to shutdown the server: `);

    process.stdin.on('readable', () => {
        let dataInput = process.stdin.read();
        if(dataInput !== null){
            let command = dataInput.trim();
            if(command === "stop"){
                console.log("Shutting down the server");
                process.exit(0);
            }
            process.stdout.write(`Type stop to shutdown the server: `)
            process.stdin.resume();
        }
    });

    app.set("views", path.resolve(__dirname, "pages"));
    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({ extended:false }));

    /* function that calls the express requests for each page */
    serverPages();

    app.listen(portNumber, (err)=> {
        if(err){
            console.log("Starting server failed.");
        }
    });
}

function serverPages(){
    app.get("/", (request, response) => {
        response.render("index");
    });
}