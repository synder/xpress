/**
 * Created by synder on 16/7/16.
 */

const path = require('path');

module.exports = {
    TMPL_ASSETS_PATH: path.join(__dirname, '../', 'res/assets'),
    TMPL_VIEW_PATH: path.join(__dirname, '../', 'res/views'),
    TMPL_ACTION_VIEW_PATH: path.join(__dirname, '../', 'res/views', 'action'),
    TMPL_INDEX_VIEW_PATH: path.join(__dirname, '../', 'res/views', 'index'),

    DOC_RAW_DIRNAME : 'raw',
    DOC_HTML_DIRNAME: 'html',
    DOC_HTML_API_DIRNAME: 'api'
};