require('dotenv').config()
const express = require('express')
const multer = require('multer')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const app = express()
app.use(express.urlencoded({ extended: true }))
const UploadFile = require('./models/file')

const upload = multer({ dest: 'uploads/' })

console.log(process.env.DB_URL)
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  res.render('index')
})

app.post(
  '/uploadFile',
  upload.single('file', { limits: { fileSize: 100000000 } }),
  async (req, res) => {
    const fileData = {
      path: req.file.path,
      fileName: req.file.originalname,
    }

    if (req.body.password != null && req.body.password !== '') {
      fileData.password = await bcrypt.hash(req.body.password, 10)
    }
    try {
      const file = await UploadFile.create(fileData)
      console.log(req.headers.origin)
      res.render('index', {
        fileLink: `${req.headers.origin}/downloadingfile/${file.id}`,
      })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).send('Internal Server Error')
    }
  },
)

app.route('/downloadingfile/:id').get(handleDownload).post(handleDownload)

async function handleDownload(req, res) {
  const file = await UploadFile.findById(req.params.id)

  if (file.password != null) {
    if (req.body.password == null) {
      res.render('password')
      return
    }
    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render('password', { error: true })
      return
    }
  }
  file.downloadCount++
  await file.save()
  console.log(file.downloadCount)
  res.download(file.path, file.fileName)
}

app.listen(process.env.PORT, () => {
  console.log('port is activated...')
})
