// PRODUCTION CONFIG
if (process.env.SONGZ_ENVIRONMENT=='production'){

  module.exports = {

    // game parameters
    game: {
      // max number of players in a game
      max_players: 15,
      // number of songs played in a game
      nb_songs: 15,
      // time in seconds before a new game starts playing the first song
      start_timer: 4,
      // duration of songs in seconds
      song_duration: 10,
      // time in seconds between each song
      interval_timer: 5
    },
    
    // socket
    socket: {
      port: 3030
    },

    // database connection
    db: {
      host: 'localhost',
      port: 27017,
      database: 'songz_simon'
    }

  }

}
// SIMON DEV CONFIG
else{

  module.exports = {

    // game parameters
    game: {
      // max number of players in a game
      max_players: 15,
      // number of songs played in a game
      nb_songs: 15,
      // time in seconds before a new game starts playing the first song
      start_timer: 1,
      // duration of songs in seconds
      song_duration: 3,
      // time in seconds between each song
      interval_timer: 5
    },
    
    // socket
    socket: {
      port: 3030
    },

    // database connection
    db: {
      host: 'localhost',
      port: 27017,
      database: 'songz'
    }

  }

}