const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/upload", (req, res) => {
  console.log("yes");
});

app.get("/", (req, res) => {
  res.render("index");
});
app.post("/upload", (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) {
        return console.log(err);
      }
      worker
        .recognize(data, "hin", { tessjs_create_pdf: "1" })
        .progress(progress => {
          console.log(progress);
        })
        .then(result => {
          res.send(result.text);
        })
        .finally(() => worker.terminate());
    });
  });
});

const PORT = 5000 || process.env.PORT;
app.listen(PORT, "127.0.0.1", () => console.log("server runing"));
