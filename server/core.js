const express = require('express');
const db = require('./database');
const Promise = require('bluebird');
const request = require('request');
const mongoose = require('mongoose');
const Spotify = require('node-spotify-api');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const SERVER_PORT = process.env.PORT || 4242;

const DATABASE_CONNECTED_MESSAGE_PREFIX = 'Database connection status: ';
const DATABASE_CONNECTED_MESSAGE = 'Connected';
const DATABASE_NOT_CONNECTED_MESSAGE = 'NOT connected';


var spotify = new Spotify({
  id: `3d57ac0f5d8548c6a1f1d689e6003530`,
  secret: `96ab564b2ce047a3966938653e705d26`
});

// test endpoint for reporting status of database connection
app.get('/test', (req, res) => {
  const message = DATABASE_CONNECTED_MESSAGE_PREFIX +
    ((db.mongoose.connection.readyState === 1) ? DATABASE_CONNECTED_MESSAGE : DATABASE_NOT_CONNECTED_MESSAGE);
  res.status(200).send(message);
});

app.get('/clients', (req, res) => {
  let message = '';
  let clients = io.sockets.connected;
  for ( client in clients ) {
    message += `Rooms for ${client}: ${JSON.stringify(clients[client].rooms)}\n`;
  }
  res.status(200).send(message);
});

// serve up client files
app.use(express.static(`${__dirname}/../client`));
app.use(express.static(`${__dirname}/../node_modules`));

// Query Spotify's Search API for a track name, and return an array of all matching tracks. Each track in the response will
// be an object with properties uri and artist name.
app.get('/tracks', (req, res) => {
  const query = req.query.trackName; // name me trackName in the client

  let tracks;

spotify
  .search({ type: 'track', query: query })
  .then(function(response) {
    
    let parsedBody = response.tracks.items;
    
    tracks = parsedBody.map(track => {
      return {uri: track.uri, artist: track.artists[0].name};
    });
    console.log('!!!!!!!!!!!!!!!!!!!!!!!', tracks);

    return tracks;
  })
  .then(data => res.send(data))
  .catch(function(err) {
    console.log('????????????????????????', err);
  });
});

// socket.io framework
io.on( 'connection', function(client) {

  client.on('add song', (uri) => {
    console.log( 'Client adding song', uri );
    // the playlistId is the name of a room that this socket is in
    let playlistId;
    for ( room in client.rooms ) {
      // each socket is also in a room matching its own ID, so let's filter that out
      if ( room !== client.id ) {
        playlistId = room;
      }
    }
    console.log( '  for playlist', playlistId );
    db.insertSong(playlistId, {uri: uri});
    // transmit the confirmation to ALL clients working with this playlist
    io.in(playlistId).emit('song added', uri);
  });

  // (new or existing) playlist requests
  client.on( 'playlist', function(playlistId, callback) {
    let playlist;
    let p;

    if ( playlistId ) {
      console.log( `Client requesting playlist ${playlistId}` );

      p = db.getSinglePlayList( playlistId )
        .then( (doc) => {
          if ( !doc ) {
            throw new Error( 'playListNotFound' );
          }
          return doc;
        })
        .catch(
          (err) => (err.message === 'playListNotFound' ),
          () => {
            return db.createPlayList();
          });

    } else {

      console.log( 'Client requesting new playlist' );
      p = db.createPlayList();
    }

    p.then( (doc) => {
      // put this client in a socket.io room corresponding to this playlist
      client.join( doc._id.toString() );
      callback({ _id: doc._id.toString(), songs: doc.songs });
    })
    .catch( (err) => {
      console.log( err );
    });
  });

  client.on('disconnect', function() {
    // POST-MVP: clean up empty playlists here
  });
});


// start the webserver
http.listen = Promise.promisify(http.listen);
app.start = function() {
  return http.listen(SERVER_PORT)
    .then(() => {
      console.log(`Tribal server is listening on port ${SERVER_PORT}.`);
    });
};

module.exports = app;
module.exports.SERVER_PORT = SERVER_PORT;
module.exports.DATABASE_CONNECTED_MESSAGE_PREFIX = DATABASE_CONNECTED_MESSAGE_PREFIX;
module.exports.DATABASE_CONNECTED_MESSAGE = DATABASE_CONNECTED_MESSAGE;
