/**
 * Created by synder on 16/6/21.
 */


const _fs = require('fs');
const _os = require('os');
const _path = require('path');
const _readline = require('readline');
const async = require('async');

/**
 * @desc 判断文件或者文件夹是否存在
 * */
var exists = function (path, callback) {
    _fs.stat(path, function (err, stats) {
        if(err){
            return callback(err);
        }

        callback(null, !!stats);
    });
};

/**
 * @desc 获取当前用户的家目录
 * */
var homedir = function () {
    if(process.platform == 'win32'){
        return process.env.USERPROFILE;
    }else{
        return process.env.HOME;
    }
};

/**
 * @desc 获取系统的缓存目录
 * */
var tmpdir = function () {
    return _os.tmpdir();
};

/**
 * @desc 创建文件夹
 * */
var mkdir = function (dir, opts, callback, made) {

    const _0777 = parseInt('0777', 8);

    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    } else if (!opts || typeof opts !== 'object') {
        opts = {mode: opts};
    }

    var mode = opts.mode;

    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;

    var cb = callback || function () {};
    dir = _path.resolve(dir);

    _fs.mkdir(dir, mode, function (er) {
        if (!er) {
            made = made || dir;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdir(_path.dirname(dir), opts, function (er, made) {
                    if (er) {
                        cb(er, made);
                    } else {
                        mkdir(dir, opts, cb, made);
                    }
                });
                break;
            default:
                _fs.stat(dir, function (er2, stat) {
                    if (er2 || !stat.isDirectory()) {
                        cb(er, made)
                    } else {
                        cb(null, made);
                    }
                });
                break;
        }
    });
};

/**
 * @desc 浅层遍历目录
 * */
var walkFlat = function (path, iterator, callback) {
    _fs.readdir(path, function (err, files) {
        if (err) {
            if (err && 'ENOENT' === err.code) {
                return callback(null);
            }

            return callback(err);
        }
        async.forEach(files, function (file, next) {
            iterator(path, file, next);
        }, callback);
    });
};

/**
 * @desc 深沉遍历目录
 * */
var walkDeep = function (path, iterator, callback) {

    path = _path.resolve(path);

    walkFlat(path, function (path, file, next) {

        var temp = _path.join(path, file);

        _fs.lstat(temp, function (err, stats) {

            if (err) {
                if ('ENOENT' === err.code) {
                    return next(null);
                }
                return next(err);
            }

            if (stats.isDirectory()) {
                return walkDeep(temp, iterator, next);
            }

            iterator(path, file, next);
        });
    }, callback);
};

/**
 * @desc 读取文件
 * */
var read = function (path, opt, callback) {
    _fs.readFile.apply(_fs, arguments);
};


/**
 * @desc 逐行读取文件
 * */
var readline = function (path, iterator, callback) {

    var inStream = _fs.createReadStream(path).on('error', callback);

    const rl = _readline.createInterface({
        input: inStream,
        output: null
    });

    rl.on('line', function (line) {
        iterator(line);
    });

    rl.on('close', callback);
};

/**
 * @desc 保存文件
 * */
var save = function (path, data, opt, callback) {
    _fs.writeFile.apply(_fs, arguments);
};

/**
 * @desc 新建文件
 * */
var touch = function (path, opt, callback) {
    var content = new Buffer(0);

    if(opt && !opt.override){
        _fs.stat(path, function (err, stats) {
            if(err){
                return callback && callback(err);
            }

            if(stats.isFile()){
                return callback && callback(null);
            }

            _fs.writeFile(path, content, opt, callback);
        });
    }else{
        _fs.writeFile(path, content, opt, callback);
    }
};

/**
 * @desc 赋值文件或者文件夹
 * */
var copy = function (src, dst, callback) {

    src = _path.resolve(src);
    dst = _path.resolve(dst);

    callback = callback || function () {};

    if(src == dst){
        return callback();
    }
    
    _fs.stat(src, function (err, stats) {
        if(err){
            return callback(err);
        }

        if(stats.isFile()){

            _fs.stat(dst, function (err, stats) {
                if(err){
                    return callback(err);
                }

                var dstPath = dst;

                if(stats.isDirectory()){
                    dst = _path.join(dstPath, _path.basename(src));
                }

                mkdir(dstPath, function (err) {
                    if(err){
                        return callback(err);
                    }

                    var inStream = _fs.createReadStream(src, {bufferSize: 64 * 1024}).on('error', callback);
                    var outStream = _fs.createWriteStream(dst).on('error', callback).on('close', callback);
                    inStream.pipe(outStream);
                });
            });
        }else{

            mkdir(dst, function (err) {
                if(err){
                    return callback(err);
                }

                //copy dir
                walkDeep(src, function (path, file, next) {

                    var srcFilePath = _path.join(path, file);
                    var dstFilePath = _path.join(dst, _path.relative(src, srcFilePath));

                    var dstPath = _path.dirname(dstFilePath);

                    mkdir(dstPath, function (err) {
                        if(err){
                            return next(err);
                        }

                        var inStream = _fs.createReadStream(srcFilePath).on('error', next);
                        var outStream = _fs.createWriteStream(dstFilePath).on('error', next).on('close', next);
                        inStream.pipe(outStream);
                    });
                }, function (err) {
                    callback(err);
                });

            });
        }
    });
};

var cut = function () {
    
};

var move = function () {

};

var remove = function (path, callback) {
    path = _path.normalize(path);

    _fs.stat(path, function (err, stats) {
        if (err) {
            if ('ENOENT' === err.code) {
                return callback(null);
            }
            return callback(err);
        }

        if (!stats.isDirectory()) {
            return _fs.unlink(path, callback);
        }

        walkDeep(path, function (file, next) {
            remove(file, next);
        }, function (err) {

            if(err){
                return callback && callback(err);
            }

            _fs.rmdir(path, callback)
        });
    });
};

var watch = function () {
    
};

var md5 = function () {
    
};

exports.exists = exists;
exports.homedir = homedir;
exports.tmpdir = tmpdir;
exports.mkdir = mkdir;
exports.walk = walkDeep;
exports.read = read;
exports.readline = readline;
exports.save = save;
exports.touch = touch;
exports.copy = copy;
exports.cut = cut;
exports.move = move;
exports.watch = watch;
exports.md5 = md5;



copy('../node_modules', './x', function (err) {
    console.log(err);
});