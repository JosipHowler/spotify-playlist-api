# Spotify playlist API
Projekt za kreiranje spotify playlist-e za vlastiti account, pretrazivanje pjesama u spotify bazi podataka i dodavanje i uklanjanje pjesama za kreiranu playlist-u.
## Autor

- [@JosipHowler] (https://github.com/JosipHowler)https://github.com/JosipHowler)
## Instalacija

Instalirati projekt sa npm

```bash
  npm install
```
- potrebno je se nalaziti u projektu
## Pokretanje

Pokrenuti aplikaciju sa npm

```bash
  npm start
```
- Moguce je vidjeti stranicu na [localhost:5000](http://localhost:5000/) pri pokretanju
## Environment Variables

Za pokretanje projekta, potebno je dodati sljedece environment varijable u svoj .env file

`CLIENT_ID`
- potrebno je ici na spotify dashboard, kreirati novu aplikaciju te otici u postavke kako bi nasli client id

`CLIENT_SECRET`
- potrebno je ici na spotify dashboard, kreirati novu aplikaciju te otici u postavke kako bi nasli client secret ispod client id

`SECRET_KEY`
- kljuc koji se koristi za express session (moze biti bilo sto)
## Znacajke

- Autoriziranje sa spotify API-om
- Pretrazivanje pjesama u spotify bazi podataka
- Kreiranje Spotify playlist-e za spotify account
- Dodavanje i uklanjanje pjesama sa kreirane playlist-e
## Koristenje Spotify API-a za projekt

 - [Kreiranje Spotify aplikacije] (https://developer.spotify.com/documentation/web-api/tutorials/getting-started#create-an-app)
## Tech Stack

**Client:** HTML, CSS, Javascript, Axios

**Server:** Node, Express, Express Session, Axios, Dotenv, Nodemon
## Zakljucak
Naucio sam koristi server-side paketa za pokretanje aplikacije i koristenje API-a za dohvatanje podataka. Imam bolje razumijevanje kako client i server komuniciraju i funkcioniraju skupa te kako se spojiti i raditi sa API-om.
## Feedback

Za pitanja molim da me kontaktirate na josipmaric04@gmail.com
