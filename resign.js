var exec = require('child_process').exec;
var fileutil = require('./util/file-util');
var fs = require('fs');

var ipaFileName = '';
var provisionFileName = '';
var appFilePath = './source/Payload';
var bundleId = '';
var bundleIdFix = '';
//iPhone Developer: 386169040@qq.com (A3XD46C9GA)
//iPhone Developer: binsheng zhang (BLNPDWQJDT)
var cerName = '';

"use strict";
if(!fs.existsSync('./source')){
	console.log('The folder <source> is not exist! Please new one and put source file in it!');
	return;
}

initFileName();
var funcs = [getCerName,zipIpaFile,deleteCodeSignature,copyMobileProvision,getEntitlementsPlist,getBundleId,convertPlistToJson
	, readFileAndModifyJson
	, convertJsonToPlist,codeSign,zipIpa,removeFile
];
var len = funcs.length;
executeFunc(funcs, 0, len);


function getBundleId(callback){
	"use strict";
	var cmdStr = "plutil -convert json "+'./source/entitlements.plist'+" -o ./source/d.json";
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log(stderr);
			exit();
		}
		else{
			var jsonFilePath = './source/d.json';
			if(fs.existsSync(jsonFilePath)){
				fs.readFile(jsonFilePath, function (err, data) {
					if (err) {
						console.log(err);
						throw err;
					}
					var jsonObj = JSON.parse(data);
					bundleId = jsonObj["application-identifier"];
					bundleId = bundleId.substring(11);
					if(bundleId == '*')
						bundleId = bundleIdFix;
					console.log(bundleId);
					callback();
				});
			}
			else{
				exit();
			}
		}
	});
}


function getCerName(callback){
	var jsonFilePath = './source/cerName.json';
	if(fs.existsSync(jsonFilePath)){
		fs.readFile(jsonFilePath, function (err, data) {
			if (err) {
				console.log(err);
				throw err;
			}
			var jsonObj = JSON.parse(data);
			cerName = jsonObj.cerName;
			bundleIdFix = jsonObj.bundleId;
			callback();
		});
	}
	else{
		console.log('Error! CerName file does not exist');
		exit();
	}
}


/**
 * 初始化,检查文件
 */
function initFileName(){
	"use strict";
	var fileList = fileutil.getFiles('./source');
	for(var i=0; i < fileList.length; i++){
		var name = fileList[i].name;
		console.log(name);
		if(fileutil.matchEtension(name,'.ipa')){
			if(ipaFileName=='')
				ipaFileName = name;
			else{
				console.log('Error! The number of ipa files cannot be more than one');
				exit();
			}
		}
		else if(fileutil.matchEtension(name,".mobileprovision")){
			if(provisionFileName=='')
				provisionFileName = name;
			else{
				console.log('Error! The number of mobileprovision files cannot be more than one');
				exit();
			}
		}
	}
	if(ipaFileName==''){
		console.log('Error! The ipa file was not found!')
	}
	if(provisionFileName==''){
		console.log('Error! The mobileprovision file was not found!')
	}


}

/**
 * 解压缩IPA
 * @param callback
 */
function zipIpaFile(callback){
	"use strict";
	var cmdStr = "cd ./source && unzip -o "+ipaFileName;
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 1: unzip ipa file ("+ ipaFileName + ") error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 1: unzip ipa file ("+ ipaFileName + ") succeed !")
			callback();
		}
	});
}

/**
 * 删除原签名文件
 * @param callback
 */
function deleteCodeSignature(callback) {
	"use strict";
	if(!fs.existsSync(appFilePath)){
		console.log('The folder <source/Payload> is not exist!');
		exit();
	}
	appFilePath = fileutil.getAppPath(appFilePath);
	var cmdStr = "rm -rf "+appFilePath+'/_CodeSignature';
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 2: delete CodeSignature files ("+ appFilePath + "/_CodeSignature ) error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 2: delete CodeSignature files ("+ appFilePath + "/_CodeSignature ) succeed !")
			callback();
		}
	});
}

/**
 * 拷贝MobileProvision文件
 * @param callback
 */
function copyMobileProvision(callback){
	"use strict";
	var cmdStr = "cp ./source/"+provisionFileName+' '+appFilePath+'/embedded.mobileprovision';
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 3: copyMobileProvision file error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 3: copy MobileProvision file succeed !")
			callback();
		}
	});
}

/**
 * 将Plist转化为Json
 * @param callback
 */
function convertPlistToJson(callback){
	"use strict";
	var cmdStr = "plutil -convert json "+appFilePath+'/Info.plist'+" -o ./source/data.json";
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 4: convertPlistToJson error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 4: convertPlistToJson succeed !")
			callback();
		}
	});
}

/**
 * 修改Json中的BundleID
 * @param callback
 */
function readFileAndModifyJson(callback){
	var jsonFilePath = './source/data.json';
	if(fs.existsSync(jsonFilePath)){
		fs.readFile(jsonFilePath, function (err, data) {
			if (err) {
				console.log(err);
				throw err;
			}
			var jsonObj = JSON.parse(data);
			jsonObj.CFBundleIdentifier = bundleId;
			fs.writeFile(jsonFilePath, JSON.stringify(jsonObj, null, 7), function (err) {
				if (err) {
					console.log(err);
					exit();
				}
				console.log('Step 4: modify json file succeed!');
				callback();
			});
		});
	}
	else{
		console.log('Step 4: json file not exists');
		exit();
	}

}

/**
 * 将Json转化为Plist
 * @param callback
 */
function convertJsonToPlist(callback){
	"use strict";
	var cmdStr = "plutil -convert xml1 ./source/data.json -o "+appFilePath+'/Info.plist';
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 4: convertJsonToPlist error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 4: convertJsonToPlist succeed !")
			callback();
		}
	});
}

/**
 * 生成EntitlementsPlist
 * @param callback
 */
function getEntitlementsPlist(callback){
	var cmdStr = 'security cms -D -i ./source/' + provisionFileName + ' > ./source/t_entitlements_full.plist';
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 5: getEntitlementsPlist error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 5: getEntitlementsPlist succeed !")
			var cmdStr = '/usr/libexec/PlistBuddy -x -c "Print:Entitlements" ./source/t_entitlements_full.plist > ./source/entitlements.plist';
			console.log(cmdStr);
			exec(cmdStr, function (err, stdout, stderr) {
				if (err) {
					console.log("Step 5: getEntitlementsPlist error !");
					console.log(stderr);
					exit();
				}
				else{
					console.log("Step 5: getEntitlementsPlist succeed !")
					callback();
				}
			});
		}
	});
}
/**
 * 重签名
 * @param callback
 */
function codeSign(callback){
	"use strict";
	var cmdStr = 'codesign -f -s "'+cerName+'"  ' +
		'--entitlements ./source/'+ 'entitlements.plist' +' ' +appFilePath;
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log("Step 5: codeSign error !");
			console.log(stderr);
			exit();
		}
		else{
			console.log("Step 5: codeSign succeed !")
			callback();
		}
	});
}

/**
 * 压缩生成新的IPA文件
 * @param callback
 */
function zipIpa(callback){
	"use strict";
	if(fs.existsSync('./source/Payload')){
		var cmdStr = 'cd ./source && zip -r ../target.ipa ./Payload';
		console.log(cmdStr);
		exec(cmdStr, function (err, stdout, stderr) {
			if (err) {
				console.log("Step 6: zip target.ipa error !");
				console.log(stderr);
				exit();
			}
			else{
				console.log("Step 6: zip target.ipa succeed !")
				callback();
			}
		});
	}
	else{
		console.log("Step 6: zip target.ipa error !");
		console.log('./source/Payload is not existed');
		exit();
	}
}

/**
 * 删除中间生成的文件
 * @param callback
 */
function removeFile(callback){
	"use strict";
	if(!fs.existsSync('./source')){
		console.log('The folder <source> is not exist!');
		exit();
	}
	fileutil.deleteFile('./source/data.json');
	fileutil.deleteFile('./source/d.json');
	fileutil.deleteFile('./source/entitlements.plist');
	fileutil.deleteFile('./source/t_entitlements_full.plist');
	var cmdStr = "rm -rf ./source/Payload";
	console.log(cmdStr);
	exec(cmdStr, function (err, stdout, stderr) {
		if (err) {
			console.log(stderr);
			exit();
		}
		else{
			callback();
		}
	});
}

/**
 * 递归调用、实现顺序执行
 * @param funcs
 * @param count
 * @param sum
 */
function executeFunc(funcs, count, sum) {
	if (count == sum) {
		return;
	}
	else {
		funcs[count](function () {
			count++;
			executeFunc(funcs, count, sum);
		});
	}
}


function exit(){
	process.exit(0);
}
