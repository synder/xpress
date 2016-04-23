/**
 * @author synder
 * @date 16/1/10
 * @desc
 */

var path = require('path');

var projectPath = process.cwd();

var privateConfig = require('./' + (process.env.NODE_ENV || 'dev'));

var publicConfig = {
    project:{
        path : projectPath
    },
    server : {
        view : {
            path : path.join(projectPath, 'view'),
            cache : false,
            engine : 'html'
        },
        statics:{
            path : path.join(projectPath, 'public')
        }
    }
};


module.exports = {
    private : privateConfig,
    public : publicConfig
};