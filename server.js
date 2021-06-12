var express = require("express");
var path = require("path");
var fs = require("fs");
var { json } = require("express");
var uuid = require("uuid");

var app = express();
var PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Add asset folder path so that the custom css and js files will link correctly on the client side.
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.get("/api/notes", (req, res) => {
  readDB("./db/db.json", (err, note) => {
    if (err) {
      console.log(err);
      return;
    }
    res.json(note);
  });
});

// Display Routes
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.delete("/api/notes/:id", (req, res) => {
  //  Capture the id of the note to delete
  const noteParam = req.params.id;
  console.log(noteParam);
  // Call the function to read the database file.
  readDB("./db/db.json", (err, note) => {
    if (err) {
      console.log(err);
      return;
    }
    // Get the correct index of the note, then delete and re-save the data.
    let noteIndex = note.findIndex((n) => n.id === noteParam);
    note.splice(noteIndex, 1);
    const saveData = JSON.stringify(note);

    fs.writeFile("./db/db.json", saveData, (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully deleted note!");
        res.json(note);
      }
    });
  });
});

// Reusable function for reading the database file.
function readDB(filePath, cback) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return cback && cback(err);
    }
    try {
      const object = JSON.parse(data);
      return cback && cback(null, object);
    } catch (err) {
      return cback && cback(err);
    }
  });
}

app.post("/api/notes", (req, res) => {
  // Generate a unique id for the new note.
  const uniqueID = uuid.v4();

  fs.readFile("./db/db.json", "utf8", (err, dbFile) => {
    if (err) {
      console.log("Error reading file from disk!", err);
    } else {
      const note = req.body;
      note.id = uniqueID;
      const jsonString = JSON.parse(dbFile);
      jsonString.push(note);
      const saveData = JSON.stringify(jsonString);

      fs.writeFile("./db/db.json", saveData, (err) => {
        if (err) {
          console.log("Error writing file", err);
        } else {
          console.log("Successfully added note!");
          res.json(jsonString);
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
