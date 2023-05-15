const http = require("http");
const express = require("express")
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') });


const app = express();