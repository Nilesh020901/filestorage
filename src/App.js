const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Ensure 'filestorage' directory exists
const storageDirectory = path.join(__dirname, 'filestorage');
if (!fs.existsSync(storageDirectory)) {
  fs.mkdirSync(storageDirectory);
}

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDirectory); // Save files in 'filestorage/'
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename); // Set filename as timestamp + original name
  },
});

const upload = multer({ storage });

// Serve static files from 'filestorage' folder
app.use('/uploads', express.static(storageDirectory));

// Render the index page
app.get('/', (req, res) => {
  res.render('index');
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.redirect('/');
});

// Handle file deletion
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename; // Use the correct parameter name
  const filePath = path.join(storageDirectory, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send(`File "${filename}" deleted successfully.`);
  } else {
    res.status(404).send(`File "${filename}" not found.`);
  }
});

// View uploaded files
app.get('/view', (req, res) => {
  fs.readdir(storageDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading the upload directory.');
    } else {
      res.json({ files });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
