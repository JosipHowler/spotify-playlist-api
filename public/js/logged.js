const searchButton = document.querySelector("[data-search-button]")
const searchInput = document.querySelector("[data-search-input]")
const resultsContainer = document.querySelector("[data-tracks]")

const playlistCreatorButton = document.querySelector("[data-playlist-creator-button]")
const playlistInput = document.querySelector("[data-playlist-name]")
const playlistTracksContainer = document.querySelector("[data-playlist-tracks]")
const playlist = document.querySelector("[data-playlist]")
const playlistCreatorContainer = document.querySelector("[data-playlist-creator]")

const template = document.getElementById("my-template")
const playlistTemplate = document.getElementById("my-template-2")

let results

let accessToken

let playlistID
//Za pretrazivanje spotify baze podataka i stavljanje rezultata na prikaz
searchButton.addEventListener("click", async(event) => {
    event.preventDefault()

    try{
        //dobivanje access token-a
        accessToken = await getAccessToken()

        let searchTerm = searchInput.value.trim()

        if(searchTerm === "") return
        resultsContainer.innerHTML = "";
        searchInput.value = ""
        //proces pretrazivanja
        const apiURL = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=5`

        const headers = {
            'Authorization': 'Bearer ' + accessToken,
        }

        axios.get(apiURL, {headers})
        .then(response => {
            results = response.data.tracks.items
            results.forEach(track => {
                const trackName = track.name
                const artistsName = track.artists.map(artist => artist.name).join(", ")

                const durationMS = track.duration_ms
                const durationS = Math.floor(durationMS / 1000)
                const minutes = Math.floor(durationS / 60);
                const seconds = durationS % 60
                const duration = `${minutes}:${seconds < 10 ? "0":""}${seconds}`
                
                const clone = template.content.cloneNode(true);
                const titleElement = clone.querySelector("[data-name]");
                const artistElement = clone.querySelector("[data-artist]");
                const durationElement = clone.querySelector("[data-length]");
                const addButton = clone.querySelector(".track-add-button")

                titleElement.textContent = trackName;
                artistElement.textContent = artistsName;
                durationElement.textContent = duration;
                addButton.setAttribute("data-track-id", track.id);

                resultsContainer.appendChild(clone)
            })
        })
    }catch (error){
        console.error('Error fetching access token:', error);
    }
})
//za kreiranje playlist-a za spotify account
playlistCreatorButton.addEventListener("click", async(event) => {
    event.preventDefault()

    if(playlistInput.value === "") return

    accessToken = await getAccessToken()
    const playlistName = playlistInput.value
    const isPublic = true
    const description = "This is a new playlist created via the Spotify API."
    const userID = await getUserId(accessToken)

    createSpotifyPlaylist(accessToken, userID, playlistName, isPublic, description)
    .then(playlistId => {
        console.log(`Playlist '${playlistName}' created with ID: ${playlistId}`);
    })
})
//funkcija za dobivanje access token-a iz app.js
async function getAccessToken(){
    const response = await fetch("/access_token");
    const data = await response.json();
    const token = data.value;
    return token
}
//funkcija za dobivanje spotify user ID-a trenutnog usera stranice
async function getUserId(accessToken){
    const url = 'https://api.spotify.com/v1/me'
    
    const headers = {
        "Authorization": `Bearer ${accessToken}`
    }

    try{
        const response = await axios.get(url, {headers})

        if(response.status === 200){
            const userData = response.data;
            const userId = userData.id;
            return userId;
        }else{
            console.error('Failed to get the user:', response.data);
            return null;
        }
    }catch(error){
        console.error('An error occurred:', error);
        return null;
    }
}
//funckija za kreiranje spotify playlist-e
async function createSpotifyPlaylist(accessToken, userID, playlistName, isPublic = true, description = ""){
    const url = `https://api.spotify.com/v1/users/${userID}/playlists`

    const headers = {
        "Authorization" : `Bearer ${accessToken}`,
        "Content-Type" : "application/json"
    }

    const data = {
        "name": playlistName,
        "description": description,
        "public": isPublic
    }

    try{
        const response = await axios.post(url, data, {headers})

        if(response.status === 201){
            const playlistData = response.data;
            const playlistId = playlistData.id;
            playlistID = playlistId
            const playlistNameDOM = document.createElement("h2")
            playlistNameDOM.textContent = playlistName
            const playlistCreatorParent = playlistCreatorContainer.parentNode
            if(playlistCreatorParent){
                playlistCreatorParent.removeChild(playlistCreatorContainer)
            }
            playlistCreatorParent.insertBefore(playlistNameDOM, playlistTracksContainer)
            return playlistId;
        }else{
            console.error('Failed to create playlist:', response.data);
            return null;
        }
    }catch(error){
        console.error('An error occurred:', error);
        return null;
    }
}
//za dodavanje kliknute pjesme u kreiranu playlist-u
resultsContainer.addEventListener("click", async(event) =>{
    event.preventDefault()
    
    if(event.target.classList.contains("track-add-button")){
        const trackId = event.target.dataset.trackId
        const playlistId = playlistID

        if(playlistId){
            accessToken = await getAccessToken()
            const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`

            const headers = {
                "Authorization" : `Bearer ${accessToken}`,
                "Content-Type" : "application/json"
            }

            const data = {
                uris: [`spotify:track:${trackId}`]
            }

            axios.post(url, data, {headers})
            .then(response => {
                const clone = playlistTemplate.content.cloneNode(true)
                const titleElement = clone.querySelector("[data-playlist-track-name]")
                const artistElement = clone.querySelector("[data-playlist-artist]")
                const durationElement = clone.querySelector("[data-playlist-length]")
                const removeButton = clone.querySelector(".track-remove-button")

                titleElement.textContent = event.target.parentNode.querySelector("h3[data-name]").textContent
                artistElement.textContent = event.target.closest(".track").querySelector("h4[data-artist]").textContent
                durationElement.textContent = event.target.closest(".track").querySelector("h4[data-length]").textContent
                removeButton.setAttribute("data-playlist-track-id", event.target.getAttribute("data-track-id"))

                playlistTracksContainer.appendChild(clone)

                const trackDiv = event.target.closest('.track')
                if (trackDiv) {
                    trackDiv.remove()
                }

                console.log('Track added to playlist:', response.data)
            })
            .catch(error => {
                console.error('Error adding track to playlist:', error);
            })
        }
    }
})
//za micanje kliknute pjesme iz kreirane spotify playlist-e
playlistTracksContainer.addEventListener("click", async(event) => {
    event.preventDefault()

    if(event.target.classList.contains("track-remove-button")){
        const trackUri = event.target.dataset.playlistTrackId
        const playlistId = playlistID

        if(playlistId){
            accessToken = await getAccessToken()
            const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`

            const headers = {
                "Authorization" : `Bearer ${accessToken}`,
                "Content-Type" : "application/json"
            }

            const data = {
                "tracks": [{ "uri": `spotify:track:${trackUri}` }],
            }

            try{
                const response = await axios({
                    method: "DELETE",
                    url,
                    headers,
                    data
                })

                if(response.status === 200){
                    const trackDiv = event.target.closest('.track')
                    if (trackDiv) {
                        trackDiv.remove()
                    }
                    console.log("Track removed from playlist:", response.data);
                }
                else{
                    console.error("Failed to remove track from playlist:", response.data);
                }
            }catch(error){
                console.error("An error occurred:", error);
            }
        }
    }
})
