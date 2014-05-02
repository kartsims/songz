module.exports = {

  // game parameters
  game: {
    // max number of players in a game
    max_players: 15,
    // number of songs played in a game
    nb_songs: 15,
    // time in seconds before a new game starts playing the first song
    start_timer: 1,
    // time in seconds between each song
    interval_timer: 3
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