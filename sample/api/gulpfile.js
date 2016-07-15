/**
 * Created by synder on 15/7/10.
 */
const gulp = require('gulp');
const path = require('path');
const Xpress = require('../../index');
const document = Xpress.document;

const docPath = path.join(__dirname, 'docs');


gulp.task('default', function (done) {
    document.renderRawDocumentToHtmlDocument(docPath,  done);
});
