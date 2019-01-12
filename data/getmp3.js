const sif = require('./siftoma')
const fs = require('fs')
const https = require('https')

function downloadFile (url, name) {
  var file = fs.createWriteStream(name)
  var request = https.get(url, function (response) {
    response.pipe(file)
    console.log(url + " downloaded")
  })
}

fs.readdir('data/', function (err, files) {
  for (let i = 0; i < files.length; i++) {
    if (err) {
      console.log('err: ' + err)
    }
    if (String(files[i]).search('origin') != -1) {
      let filename = String(files[i]).split('.')[0]
      fs.readFile('data/' + String(files[i]), function (err, data) {
        if (err) {
          console.log('err: ' + err)
        }
        let live = JSON.parse(data.toString().trim())
        let url = live.sound_asset
        let realPath = sif.sifConverter.getRealpath(url)
        let name = 'music/' + filename + '.mp3'
        //console.log(realPath)
        downloadFile(realPath, name)
      })
    }
  }
})
