//Pokretanje express aplikacije
const express = require("express")
const app = express()
const port = 5000
//Express Session - za spremanje access token-a i refresh token-a
const session = require("express-session")
//Redirect potreban za Spotify API
const redirect = "http://localhost:5000/logged"
//Za korištenje .env file-a
require("dotenv").config()
//Za requests
const axios = require("axios")
//Access Token potreban za korištenje Spotify API-a
let access_token
//funkcija za generiranje stringa koji je potreban za dobivanje spotify Access Tokena
function generateRandomString(length){
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ""

    for(let i = 0; i < length; i++){
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
    }
    return result
}
//Client id, secret i secret key koji se nalaze u .env file-u i koje je potrebno samostalno dobiti
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const secretKey = process.env.SECRET_KEY
//Za korištenje file-ova u public folderu za HTML
app.use(express.static("public"))
//Ostvarivanje express session-a pomocu secret key-a iz .env file-a (moze biti bilo sto)
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
}))
//Pocetni login page
app.get("/", (req,res) => {
    res.sendFile(__dirname + "/views/login.html")
})
//Pokretanje veze sa Spotify API-om
app.get("/login", (req, res) => {
    let state = generateRandomString(16)
    let scope = "user-library-read playlist-modify-public playlist-modify-private"

    const authorizeUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${client_id}&` +
    `scope=${scope}&` +
    `redirect_uri=${encodeURIComponent(redirect)}&` +
    `state=${state}`

    res.redirect(authorizeUrl)
})
//Dobivanje access token-a i refresh token-a (access token za koristenje spotify api-a i refresh token a kad access token istekne)
//Redirect na /main
app.get("/logged", async (req, res) => {
    const code = req.query.code || null

    if(code){
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            method: 'post',
            params: {
                code: code,
                redirect_uri: redirect,
                grant_type: 'authorization_code',
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            },
        }
        try{
            const response = await axios(authOptions)

            //spremanje access token-a i refresh token-a u session
            req.session.access_token = response.data.access_token
            req.session.refresh_token = response.data.refresh_token;
            res.redirect("/main")
        }
        catch (error){
            console.error('Error getting access token:', error);
            res.status(500).send('Error getting access token');
        }
    }else {
        res.status(400).send('Missing authorization code');
    }
})
//pokretanje main page-a nakon uspjesnog logjn-a
app.get("/main", (req, res) =>{
    access_token = req.session.access_token || null
    res.sendFile(__dirname + "/views/main.html")
})
//za dobivanje access token-a potrebnog u drugim javascript file-ovima
app.get("/access_token", (req, res) => {
    res.json({value: access_token})
})
//slusanje na odredenom port-u
app.listen(port)