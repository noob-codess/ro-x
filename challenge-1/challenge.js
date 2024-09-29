"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDataDump = void 0;
var fs = require("fs");
var https = require("https");
var zlib = require("zlib");
var tar = require("tar");
var csv = require("fast-csv");
var knex_setup_1 = require("./knex-setup");
var resources_1 = require("./resources");
// Function to download the file
function downloadFile(url, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var file = fs.createWriteStream(outputPath);
                    https.get(url, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            file.close();
                            resolve(); // Just resolve without any value unless needed
                        });
                    }).on('error', function (err) {
                        fs.unlink(outputPath, function () { return reject(new Error("Failed to download file: ".concat(err.message))); });
                    });
                })];
        });
    });
}
// Function to decompress and extract files
function decompressAndExtract(inputPath, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.createReadStream(inputPath)
                        .pipe(zlib.createGunzip())
                        .pipe(tar.extract({ cwd: outputPath }))
                        .on('finish', resolve)
                        .on('error', function (error) { return reject(new Error("Failed to decompress and extract: ".concat(error.message))); });
                })];
        });
    });
}
// Function to process a CSV file and insert data into a database
function processCsvFile(filePath, tableName) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.createReadStream(filePath)
                        .pipe(csv.parse({ headers: true }))
                        .on('data', function (row) { return __awaiter(_this, void 0, void 0, function () {
                        var err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, knex_setup_1.knex)(tableName).insert(row)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    err_1 = _a.sent();
                                    reject(new Error("Failed to insert data: ".concat(err_1.message)));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })
                        .on('end', resolve)
                        .on('error', function (error) { return reject(new Error("Failed to process CSV file: ".concat(error.message))); });
                })];
        });
    });
}
// Main function that orchestrates the download, extraction, and database population
function processDataDump() {
    return __awaiter(this, void 0, void 0, function () {
        var extractPath, tmpPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    // Ensure base directories exist
                    if (!fs.existsSync('./tmp')) {
                        fs.mkdirSync('./tmp');
                    }
                    if (!fs.existsSync('./out')) {
                        fs.mkdirSync('./out');
                    }
                    extractPath = './tmp/extracted';
                    if (!fs.existsSync(extractPath)) {
                        fs.mkdirSync(extractPath);
                    }
                    return [4 /*yield*/, (0, knex_setup_1.setupDatabase)()];
                case 1:
                    _a.sent();
                    tmpPath = './tmp/dump.tar.gz';
                    console.log('Downloading file...');
                    return [4 /*yield*/, downloadFile(resources_1.DUMP_DOWNLOAD_URL, tmpPath)];
                case 2:
                    _a.sent();
                    console.log('Decompressing and extracting file...');
                    return [4 /*yield*/, decompressAndExtract(tmpPath, extractPath)];
                case 3:
                    _a.sent();
                    console.log('Processing organizations CSV...');
                    return [4 /*yield*/, processCsvFile("".concat(extractPath, "/dump/organizations.csv"), 'organizations')];
                case 4:
                    _a.sent();
                    console.log('Processing customers CSV...');
                    return [4 /*yield*/, processCsvFile("".concat(extractPath, "/dump/customers.csv"), 'customers')];
                case 5:
                    _a.sent();
                    console.log('Data processing complete.');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('An error occurred:', error_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.processDataDump = processDataDump;
