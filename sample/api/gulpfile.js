/**
 * Created by synder on 15/7/10.
 */
const gulp = require('gulp');
const path = require('path');
const Xpress = require('../../index');
const Document = Xpress.Document;

const docPath = path.join(__dirname, 'docs');


gulp.task('default', function (done) {
    Document.renderDocument(docPath,  done);
});
