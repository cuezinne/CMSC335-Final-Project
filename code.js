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

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

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
    app.use(express.static(__dirname + '/pages'));

    app.get("/", (request, response) => {
        response.render("index");
    });

    app.get("/store", (request, response) => {
        response.render("store");
    });

    app.post("/orderConfirm", (request, response) => {
        let scents = [
            {"name":"Lavender", "checked":request.body.lavender},
            {"name":"Rose", "checked":request.body.rose},
            {"name":"Vetiver", "checked":request.body.vetiver},
            {"name":"Hyssop", "checked":request.body.hyssop},
            {"name":"Myrrh", "checked":request.body.myrrh},
            {"name":"Frankincense", "checked":request.body.frankincense}
        ];

        let items = [];

        let table = "<table border='1'><tr><th>Items</th></tr>";
        
        scents.forEach(element => {
            if(element.checked){
                table += `<tr><td>${element.name}</td></tr>`;
                items.push(element.name);
            }
        });

        table += "</table>";

        let applicant = {   
            name:request.body.name, 
            items: items,
            longitude: request.body.longitude, 
            latitude: request.body.latitude};

        insertData(applicant);

        response.render("orderConfirm",
            {   name:request.body.name, 
                table: table, 
                longitude: request.body.longitude, 
                latitude: request.body.latitude});
    });

    app.post("/lookupProcessing", (request, response) => {
        retrieveData(request.body.name).then(
            data => {
                const applicant ={
                    name: data.name,
                    items: data.items,
                    longitude: data.longitude,
                    latitude: data.latitude
                }
                let table = "<table border='1'><tr><th>Items</th></tr>";

                applicant.items.forEach(element => {
                    table += `<tr><td>${element}</td></tr>`;
                })
                table += "</table>";

                response.render("lookupProcessing",
                    {   name: applicant.name, 
                        table: table, 
                        longitude: applicant.longitude, 
                        latitude: applicant.latitude});
            }
        )
    });

    app.get("/lookup", (request, response) => {
        response.render("lookup");
    })

    app.listen(portNumber, (err)=> {
        if(err){
            console.log("Starting server failed.");
        }
    });
}

async function retrieveData(name){
    const uri = `mongodb+srv://${userName}:${password}@cmsc335.zjhyrw2.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTOpology: true, serverApi: ServerApiVersion.v1 });

    try{
        await client.connect();
        let filter = {name: name};
        const cursor = 
        client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);
        const result = await cursor.toArray();
        return result[0];
    }catch(e){
        console.error(e);
    }finally{
        await client.close();
    }
}

async function insertData(student){
    const uri = `mongodb+srv://${userName}:${password}@cmsc335.zjhyrw2.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTOpology: true, serverApi: ServerApiVersion.v1 });

    try{
        await client.connect();
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(student);
    }catch(e){
        console.error(e);
    }finally{
        await client.close();
    }
}