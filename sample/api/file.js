/**
 * Created by synder on 15/7/10.
 */
const path = require('path');
const Xpress = require('../../index');
const document = Xpress.document;

const docPath = path.join(__dirname, 'docs');


document.renderRawDocumentToHtmlDocument(docPath, function (err) {
    console.log(err);
});