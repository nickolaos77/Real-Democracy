var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create Poll Schema
var Poll = new Schema({
  creatorAuthMethod     : String,    
  someID                : String,
  pollTitle             : String,
  options               : [],    
  voters:
        [{
          IP         : String,
          identity   : String,
        }]       
});


module.exports = mongoose.model('polls', Poll);


