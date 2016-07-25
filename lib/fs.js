/**
 * Created by synder on 16/6/21.
 */


const fs = require('fs');
const os = require('os');
const url = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const readline = require('readline');
const async = require('async');
const crypto = require('crypto');

/**
 * @desc 获取当前用户的家目录
 * */
var homedir = function () {
    if (process.platform == 'win32') {
        return process.env.USERPROFILE;
    } else {
        return process.env.HOME;
    }
};

/**
 * @desc 获取系统的缓存目录
 * */
var tmpdir = function () {
    return os.tmpdir();
};

/**
 * @desc 获取文件名
 * */
var filename = function (pth) {
    return path.basename(pth);
};

/**
 * @desc 获取文件所在文件夹
 * */
var filedir = function (pth) {
    return path.dirname(pth);
};

/**
 * @desc 判断文件或者文件夹是否存在
 * */
var exists = function (pth, callback) {
    fs.stat(pth, function (err, stats) {
        if (err) {
            if (err && 'ENOENT' === err.code) {
                return callback(null, false);
            }

            return callback(err);
        }

        callback(null, !!stats);
    });
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

    dir = path.resolve(dir);

    fs.mkdir(dir, mode, function (er) {
        if (!er) {
            made = made || dir;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdir(path.dirname(dir), opts, function (er, made) {
                    if (er) {
                        cb(er, made);
                    } else {
                        mkdir(dir, opts, cb, made);
                    }
                });
                break;
            default:
                fs.stat(dir, function (er2, stat) {
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
var list = function (pth, iterator, callback) {
    fs.readdir(pth, function (err, files) {
        if (err) {
            if (err && 'ENOENT' === err.code) {
                return callback(null);
            }

            return callback(err);
        }
        async.forEach(files, function (file, next) {
            iterator(pth, file, next);
        }, callback);
    });
};

/**
 * @desc 深层遍历目录
 * */
var walk = function (pth, iterator, callback) {

    pth = path.resolve(pth);

    list(pth, function (pth, file, next) {

        var temp = path.join(pth, file);

        fs.lstat(temp, function (err, stats) {

            if (err) {
                if ('ENOENT' === err.code) {
                    return next(null);
                }
                return next(err);
            }

            if (stats.isDirectory()) {
                return walk(temp, iterator, next);
            }

            iterator(pth, file, next);
        });
    }, callback);
};

/**
 * @desc 读取文件
 * */
var read = function (pth, opt, callback) {
    fs.readFile.apply(fs, arguments);
};

/**
 * @desc 逐行读取文件
 * */
var readLine = function (pth, iterator, callback) {

    var inStream = fs.createReadStream(pth).on('error', callback);

    const rl = readline.createInterface({
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
var save = function (pth, data, opt, callback) {
    fs.writeFile.apply(fs, arguments);
};

/**
 * @desc 追加保存文件
 * */
var append = function (pth, data, opt, callback) {
    fs.appendFile.apply(fs, arguments);
};

/**
 * @desc 新建文件
 * */
var touch = function (pth, opt, callback) {
    var content = new Buffer(0);

    if (opt && !opt.override) {
        fs.stat(pth, function (err, stats) {
            if (err) {
                return callback && callback(err);
            }

            if (stats.isFile()) {
                return callback && callback(null);
            }

            fs.writeFile(pth, content, opt, callback);
        });
    } else {
        fs.writeFile(pth, content, opt, callback);
    }
};

/**
 * @desc 复制文件或者文件夹
 * */
var copy = function (src, dst, callback) {

    src = path.resolve(src);
    dst = path.resolve(dst);

    callback = callback || function () {
        };

    if (src == dst) {
        return callback();
    }

    fs.stat(src, function (err, stats) {
        if (err) {
            return callback(err);
        }

        if (stats.isFile()) {

            fs.stat(dst, function (err, stats) {
                if (err) {
                    return callback(err);
                }

                var dstPath = dst;

                if (stats.isDirectory()) {
                    dst = path.join(dstPath, path.basename(src));
                }

                mkdir(dstPath, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    var inStream = fs.createReadStream(src, {bufferSize: 64 * 1024}).on('error', callback);
                    var outStream = fs.createWriteStream(dst).on('error', callback).on('close', callback);
                    inStream.pipe(outStream);
                });
            });
        } else {
            mkdir(dst, function (err) {
                if (err) {
                    return callback(err);
                }

                //copy dir
                walk(src, function (pth, file, next) {

                    var srcFilePath = path.join(pth, file);
                    var dstFilePath = path.join(dst, path.relative(src, srcFilePath));

                    var dstPath = path.dirname(dstFilePath);

                    mkdir(dstPath, function (err) {
                        if (err) {
                            return next(err);
                        }

                        var inStream = fs.createReadStream(srcFilePath).on('error', next);
                        var outStream = fs.createWriteStream(dstFilePath).on('error', next).on('close', next);
                        inStream.pipe(outStream);
                    });
                }, function (err) {
                    callback(err);
                });

            });
        }
    });
};

/**
 * @desc 移动文件或者文件夹
 * */
var move = function (src, dst, callback) {
    src = path.resolve(src);
    dst = path.resolve(dst);

    callback = callback || function () {
        };

    if (src == dst) {
        return callback();
    }

    fs.stat(src, function (err, stats) {
        if (err) {
            return callback(err);
        }

        if (stats.isFile()) {

            fs.stat(dst, function (err, stats) {
                if (err) {
                    return callback(err);
                }

                var dstPath = dst;

                if (stats.isDirectory()) {
                    dst = path.join(dstPath, path.basename(src));
                }

                mkdir(dstPath, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    var inStream = fs.createReadStream(src, {bufferSize: 64 * 1024}).on('error', callback);
                    var outStream = fs.createWriteStream(dst).on('error', callback).on('close', function () {
                        fs.unlink(src, callback);
                    });
                    inStream.pipe(outStream);
                });
            });
        } else {

            mkdir(dst, function (err) {
                if (err) {
                    return callback(err);
                }

                //copy dir
                walk(src, function (pth, file, next) {

                    var srcFilePath = path.join(pth, file);
                    var dstFilePath = path.join(dst, path.relative(src, srcFilePath));

                    var dstPath = path.dirname(dstFilePath);

                    mkdir(dstPath, function (err) {
                        if (err) {
                            return next(err);
                        }

                        var inStream = fs.createReadStream(srcFilePath).on('error', next);
                        var outStream = fs.createWriteStream(dstFilePath).on('error', next).on('close', next);
                        inStream.pipe(outStream);
                    });
                }, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    remove(src, callback);
                });

            });
        }
    });
};

/**
 * @desc 重命名文件或者文件夹
 * */
var rename = function (oldPath, newPath, callback) {
    fs.rename.apply(fs, arguments);
};

/**
 * @desc 检测用户是否有权限
 * */
var access = function (pth, opt, callback) {
    var mode = null;

    if (opt.r) {
        mode = mode | fs.R_OK;
    }

    if (opt.w) {
        mode = mode | fs.W_OK;
    }

    if (opt.x) {
        mode = mode | fs.X_OK;
    }

    fs.access(pth, mode, callback);
};

/**
 * @desc 删除文件或者文件夹
 * */
var remove = function (pth, callback) {
    
    pth = path.resolve(pth);

    fs.stat(pth, function (err, stats) {
        if (err) {
            if ('ENOENT' === err.code) {
                return callback(null);
            }
            return callback(err);
        }

        if (!stats.isDirectory()) {
            return fs.unlink(pth, callback);
        }

        list(pth, function (pth, file, next) {
            remove(path.join(pth, file), next);
        }, function (err) {

            if (err) {
                return callback && callback(err);
            }
            fs.rmdir(pth, callback)
        });
    });
};

/**
 * @desc 观察文件或者文件夹
 * */
var watch = function (pth, callback) {
    fs.watch(pth, callback);
};

/**
 * @desc 异步计算文件MD5
 * */
var md5 = function (filepath, encode, callback) {

    filepath = path.resolve(filepath);

    if (typeof encode === 'function') {
        callback = encode;
        encode = 'hex';
    }

    var inStream = fs.createReadStream(filepath);

    var hash = crypto.createHash('md5');

    inStream.on('data', function (content) {
        hash.update(content);
    });

    inStream.on('error', function (err) {
        callback(err);
    });

    inStream.on('end', function () {
        callback(null, hash.digest(encode));
    });

};

/**
 * @desc 获取网络文件
 * */
var fetch = function (url, dst, filename, callback) {

    if(!dst){
        return callback(new Error('dst path should not be null'));
    }

    var temp = url.parse(url);

    if(typeof filename !== 'string'){
        callback = filename || function () {};
        filename = path.basename(temp.pathname);
    }

    var options = {
        protocol: temp.protocol,
        hostname: temp.hostname,
        port: temp.port,
        path: temp.path,
        method: 'GET'
    };

    dst = path.resolve(dst);

    mkdir(dst, function (err) {
        if(err){
            return callback(err);
        }

        var filePath = path.join(dst, filename);

        if(temp.protocol == 'http:'){
            http.request(options, function (res) {
                res.on('data', function (chunk) {
                    if(chunk.length > 0){
                        append(filePath, chunk);
                    }
                });
                res.on('end', function () {
                    callback(null, filePath);
                })
            }).on('error', function (err) {
                remove(filePath, function () {
                    callback(err);
                });
            }).end();
        }else{
            https.request(options, function (res) {
                res.on('data', function (chunk) {
                    if(chunk.length > 0){
                        append(filePath, chunk);
                    }
                });
                res.on('end', function () {
                    callback(null, filePath);
                })
            }).on('error', function (err) {
                remove(filePath, function () {
                    callback(err);
                });
            }).end();
        }
    });
};


//get dir
exports.homedir = homedir;
exports.tmpdir = tmpdir;

//get file name or dir
exports.filename = filename;
exports.filedir = filedir;

//create stream
exports.createReadStream = fs.createReadStream;
exports.createWriteStream = fs.createWriteStream;

//fs method
exports.chmod = fs.chmod;
exports.chown = fs.chown;
exports.link = fs.link;
exports.unlink = fs.unlink;
exports.utimes = fs.utimes;
exports.stat = fs.stat;

//fs extend method
exports.exists = exists;
exports.mkdir = mkdir;
exports.list = list;
exports.walk = walk;
exports.read = read;
exports.readline = readLine;
exports.save = save;
exports.append = append;
exports.touch = touch;
exports.copy = copy;
exports.move = move;
exports.rename = rename;
exports.remove = remove;
exports.access = access;
exports.watch = watch;
exports.md5 = md5;
exports.fetch = fetch;

//sync func
exports.statSync = fs.statSync;
exports.readFileSync = fs.readFileSync;
exports.writeFileSync = fs.writeFileSync;
exports.appendFileSync = fs.appendFileSync;
exports.chmodSync = fs.chmodSync;
exports.chownSync = fs.chownSync;
exports.existsSync = fs.existsSync;
exports.renameSync = fs.renameSync;
exports.linkSync = fs.linkSync;
exports.rmdirSync = fs.rmdirSync;
exports.mkdirSync = fs.mkdirSync;
exports.readdirSync = fs.readdirSync;
exports.unlinkSync = fs.unlinkSync;