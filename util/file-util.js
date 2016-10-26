var fs = require('fs');

/**
 * 获取文件夹下面所有文件,返回文件大小，文件名和文件绝对路径
 * @param dir
 */
exports.getAllFiles = function (dirPath) {
    var fileList = [];
    readFile(dirPath, fileList);
    return fileList;
};

exports.getFiles = function (dirPath) {
    var fileList = [];
    readOnlyFile(dirPath, fileList);
    return fileList;
};

exports.getAppPath = function (dirPath) {
    files = fs.readdirSync(dirPath);//需要用到同步读取
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            states = fs.statSync(dirPath + '/' + file);
            if (states.isDirectory()) {
                if (matchEtension(file, '.app'))
                    return dirPath + '/' + file;
            }
        }
    }
};

/**
 * 获取文件夹下面的文件路径列表
 * @param dir
 */
exports.getAllFilesPath = function (dirPath) {
    var filePathList = [];
    readFilePath(dirPath, filePathList);
    return filePathList;
};

function readOnlyFile(path, fileList) {
    files = fs.readdirSync(path);//需要用到同步读取
    if (files.length > 0) {
        files.forEach(walk);
        function walk(file) {
            states = fs.statSync(path + '/' + file);
            if (states.isDirectory()) {
            }
            else {
                //将文件路径保存
                var obj = new Object();
                obj.size = states.size;//文件大小，以字节为单位
                obj.name = file;//文件名
                obj.path = path + '/' + file; //文件绝对路径
                fileList.push(obj);
            }
        }
    }
}

function readFile(path, fileList) {
    files = fs.readdirSync(path);//需要用到同步读取
    if (files.length > 0) {
        files.forEach(walk);
        function walk(file) {
            states = fs.statSync(path + '/' + file);
            if (states.isDirectory()) {
                readFile(path + '/' + file, fileList);
            }
            else {
                //将文件路径保存
                var obj = new Object();
                obj.size = states.size;//文件大小，以字节为单位
                obj.name = file;//文件名
                obj.path = path + '/' + file; //文件绝对路径
                fileList.push(obj);
            }
        }
    }
}

function readFilePath(path, filePathList) {
    files = fs.readdirSync(path);//需要用到同步读取
    if (files.length > 0) {
        files.forEach(walk);
        function walk(file) {
            states = fs.statSync(path + '/' + file);
            if (states.isDirectory()) {
                readFilePath(path + '/' + file, filePathList);
            }
            else {
                filePathList.push(path + '/' + file);
            }
        }
    }
}

/**
 * 创建新的文件夹
 * @param folderpath
 * @param foldername
 */
exports.newFolder = function (folderpath, foldername) {
    var commonDirPath = folderpath + foldername;
    if (!fs.existsSync(commonDirPath)) {
        fs.mkdirSync(commonDirPath);
    }
};

/**
 * 删除目标文件
 * @param targetFilePath
 */
exports.deleteFile = function (targetFilePath) {
    if (fs.existsSync(targetFilePath)) {
        fs.unlinkSync(targetFilePath);
    }
};

function matchEtension(filename, etension) {
    var eten = filename.substring(filename.length - etension.length);
    if (eten == etension) {
        return true;
    }
    return false;
}
exports.matchEtension = matchEtension;





