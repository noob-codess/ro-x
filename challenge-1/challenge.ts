import * as fs from 'fs';
import * as https from 'https';
import * as zlib from 'zlib';
import * as tar from 'tar';
import * as csv from 'fast-csv';
import { knex, setupDatabase } from './knex-setup';
import { DUMP_DOWNLOAD_URL } from './resources';

// Function to download the file
async function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();  // Just resolve without any value unless needed
      });
    }).on('error', (err: Error) => {
      fs.unlink(outputPath, () => reject(new Error(`Failed to download file: ${err.message}`)));
    });
  });
}

// Function to decompress and extract files
async function decompressAndExtract(inputPath: string, outputPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(zlib.createGunzip())
      .pipe(tar.extract({ cwd: outputPath }))
      .on('finish', resolve)
      .on('error', (error: Error) => reject(new Error(`Failed to decompress and extract: ${error.message}`)));
  });
}

// Function to process a CSV file and insert data into a database
async function processCsvFile(filePath: string, tableName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('data', async (row) => {
        try {
          await knex(tableName).insert(row);
        } catch (err) {
          reject(new Error(`Failed to insert data: ${(err as Error).message}`));
        }
      })
      .on('end', resolve)
      .on('error', (error: Error) => reject(new Error(`Failed to process CSV file: ${error.message}`)));
  });
}

// Main function that orchestrates the download, extraction, and database population
export async function processDataDump() {
  try {
    // Ensure base directories exist
    if (!fs.existsSync('./tmp')) {
      fs.mkdirSync('./tmp');
    }
    if (!fs.existsSync('./out')) {
      fs.mkdirSync('./out');
    }
    // Ensure the extraction directory exists
    const extractPath = './tmp/extracted';
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath);
    }

    await setupDatabase();
    const tmpPath = './tmp/dump.tar.gz';

    console.log('Downloading file...');
    await downloadFile(DUMP_DOWNLOAD_URL, tmpPath);

    console.log('Decompressing and extracting file...');
    await decompressAndExtract(tmpPath, extractPath);

    console.log('Processing organizations CSV...');
    await processCsvFile(`${extractPath}/dump/organizations.csv`, 'organizations');

    console.log('Processing customers CSV...');
    await processCsvFile(`${extractPath}/dump/customers.csv`, 'customers');

    console.log('Data processing complete.');
  } catch (error) {
    console.error('An error occurred:', (error as Error).message);
  }
}