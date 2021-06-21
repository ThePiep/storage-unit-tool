const path = require('path')
const fs = require('fs')
var sass = require('sass');
const root = path.join(__dirname, 'public')
const scss_filename = "css/scss/site.scss"



sass.render({
    file: path.join(root, scss_filename),
}, function (error, result) {
    if (!error) {
        fs.writeFile(path.join(root, '/css/test.css'), result.css, function (err) {
            if (!err) {
                console.log('Successfully compiled scss'
                )
            }
        })
    }
    // console.log(error)
});