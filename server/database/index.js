const mongoose = require( './init' );

const PlayListSchema = mongoose.Schema({
  name: {
    type: String,
  },
  songs: [{
    uri: String
  }]
});

const PlayList = mongoose.model('PlayList', PlayListSchema);

// getAllPlayLists retrieves all playlists
const getAllPlayLists = function() {
  return PlayList.find({});
};

// getSinglePlayList retrieves a single PlayList associated with the given id or name
// returns promise, resolves with playlist document
const getSinglePlayList = function( idOrName ) {
  if ( /^[0-9a-f]{24}$/.test(idOrName) ) {
    return PlayList.findById( idOrName );
  } else {
    return PlayList.findOne({ name: idOrName });
  }
};

// insertSong inserts a song(s) into the db
const insertSong = function(id, song) {
  return getSinglePlayList( id )
    .then(playList => {
      playList.songs.push(song);
      return playList.save();
    });
};

// create a new playlist, 'name', populated with no songs
// return promise, resolves with new document
const createPlayList = function( name ) {
  return PlayList.create({ name: name });
};

module.exports.mongoose = mongoose;
module.exports.getAllPlayLists = getAllPlayLists;
module.exports.getSinglePlayList = getSinglePlayList;
module.exports.insertSong = insertSong;
module.exports.createPlayList = createPlayList;
