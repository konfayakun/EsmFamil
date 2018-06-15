const express = require("express");
const fs = require("fs");
const app = express();

//middlewares
app.use(express.static("public"));

//Listen on port 3000
server = app.listen(3000);

//socket.io instantiation
const io = require("socket.io")(server);
var users = {},
  complainResults = {},
  userData = {},
  invalids = {};
var letters = [
  "ی",
  "ه",
  "و",
  "ن",
  "م",
  "ل",
  "گ",
  "ک",
  "ق",
  "ف",
  "غ",
  "ع",
  "ظ",
  "ط",
  "ض",
  "ص",
  "ش",
  "س",
  "ژ",
  "ز",
  "ر",
  "ذ",
  "د",
  "خ",
  "ح",
  "چ",
  "ج",
  "ث",
  "ت",
  "پ",
  "ب",
  "ا",
  "آ"
];
var stopper;
var chosenLetter = letters[Math.floor(Math.random() * letters.length)];

//listen on every connection
io.on("connection", socket => {
  console.log("New user connected");

  var userExists = false;
  //user initializeation
  socket.on("myNameIs", data => {
    if (userExists) return;
    userExists = true;
    socket.username = socket.id + ":" + data;
    users[socket.id + ":" + data] = socket;
    console.log("hey! ", data, "the letter is", chosenLetter);
    socket.emit("letter", { chosenLetter, invalids }); //send the letter and the invalids to new connected user
  });
  //one user sumbited one cart and other users must be informed
  socket.on("submit", data => {
    console.log(data);
    userData[socket.username] = userData[socket.username] || {};
    userData[socket.username][data.key] = data.value;
    socket.broadcast.emit("submited", data);
  });
  //one users submited his/her complain and it must be processed ASAP!
  socket.on("complainResult", data => {
    complainResults[socket.username] = data;
    if (Object.keys(complainResults).length == Object.keys(users).length - 1)
      handelComplains();
  });
  //one user called 'stop' and other users must be informed!
  socket.on("stop", data => {
    stopper = socket.username;
    userData[socket.username] = userData[socket.username] || {};
    for (let field of Object.keys(data)) {
      userData[socket.username][field] = data[field];
    }
    socket.broadcast.emit("stoped", {
      stopper: stopper,
      data: userData
    });
  });
  //one user has been disconnected so the carts which is submited by this user must be discarded.
  socket.on("disconnect", () => {
    delete users[socket.username];
    if (userData[socket.username]) {
      for (field of Object.keys(userData[socket.username])) {
        if (!invalids[field]) continue;
        console.log(invalids);
        invalids[field] = invalids[field].map(value => {
          if (userData[socket.username][field] !== value) return value;
        });
        console.log(invalids);
      }

      for (let name of Object.keys(users)) {
        users[name].emit("userDisconnected", userData[socket.username]);
      }
      delete userData[socket.username];
    }
    console.log("user disconnected", socket.username);
  });
  // sending initial invalids to now connected user!
});

//process all complain data
var handelComplains = function() {
  console.log("handel complain called");
  let accepted = {};
  for (let name of Object.keys(userData[stopper])) {
    accepted[name] = false;
  }
  for (name of Object.keys(users)) {
    if (name === stopper) continue;
    for (field of Object.keys(complainResults[name])) {
      accepted[field] |= complainResults[name][field] === "accepted";
    }
  }
  let finished = true;
  for (field of Object.keys(accepted)) {
    finished &= accepted[field];
    if (!accepted[field]) {
      invalids[field] = invalids[field] || [];
      invalids[field].push(userData[stopper][field]);
    }
  }
  if (finished) theEnd();
  else {
    users[stopper].emit("unsuccessfulStop", invalids);
    users[stopper].broadcast.emit("resume", invalids);
    complainResults = {};
    stopper = null;
  }
};
var theEnd = function() {
  users[stopper].broadcast.emit("lose", stopper); //broadcastto losers the "lose" message
  users[stopper].emit("win"); // send "win" message to the winner
  let gameLog = {
    winner: stopper,
    users: Object.keys(users),
    userData: userData
  };
  let cache = [];
  let str = JSON.stringify(gameLog, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // Enable garbage collection
  //writing game log
  fs.writeFile("./gameLog.txt", str, function(err) {
    if (err) {
      console.log(err);
    } else console.log("Log file saved!");
  });
};
