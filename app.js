//required packages
const express = require("express");
const fetch = require("node-fetch");
require ("dotenv").config();

//create the express server
const app = express();

//detect what device is accessing the site
var device = require('express-device');
const e = require("express");
app.use(device.capture());

//server port number
const PORT = process.env.PORT || 3000;

//set template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//needed to parse HTML data for POST request
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/convert-mp3", async (req, res) => {
    const videoId = req.body.videoID;
    let devicetype = String(req.device.type);
    if(
        videoId === undefined ||
        videoId === "" ||
        videoId === null
    ){
        return res.render("index", {success : false, message : "Please enter a video ID"});
    }else{
        if (devicetype == "desktop"){
            trimmedvideoId = videoId.substr(32, 11);
            console.log(videoId);
        }
        else if (devicetype == "phone"){
            trimmedvideoId = videoId.substr(17, 11);
        }
        fetchVideoStatus(trimmedvideoId);

        async function fetchVideoStatus(trimmedvideoId) {
            console.log(trimmedvideoId);
            const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${trimmedvideoId}`,{
                "method" : "GET",
                "headers": {
                    "X-RapidAPI-Key": process.env.API_KEY,
                    "X-RapidAPI-Host": process.env.API_HOST
                }
            });

            const fetchResponse = await fetchAPI.json()

            console.log(fetchResponse);

            if(fetchResponse.status === "ok"){
                return res.render("index", {success : true, song_title: fetchResponse.title, song_link: fetchResponse.link});
            }
            else if (fetchResponse.status === "processing"){
                await new Promise(resolve => setTimeout(resolve, 1000));
        
                // Make another call to the API recursively
                return fetchVideoStatus(trimmedvideoId);
            }
            else{
                console.log(fetchResponse.msg);
                return res.render("index", {success: false, message: fetchResponse.msg})
            }
        }        
    }
})

//start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})


