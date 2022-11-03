/* eslint-disable no-console */
import agena from 'agena-api-js';
import fs from 'fs';
import path from 'path'; // path.resolve is relative to project root

const credentialsFile = path.resolve('./.local/credentials.json');
const modelFile = path.resolve('./input/model.json');
const dataFile = path.resolve('./input/data.csv');
const resultCacheFile = path.resolve('./output/cache.txt');
const outputFile = path.resolve('./output/results.json');

let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
} catch (error) {
  console.error('Failed to read credentials', error);
  process.exit(1);
}

let model;
let inputDatasets;

try {
  // Resolving from project root
  model = JSON.parse(fs.readFileSync(modelFile, 'utf8')).model;
  inputDatasets = agena.readCsv({
    network: 'New Risk Object0', // CHANGE THIS TO YOUR ACTUAL NETWORK ID, OR REMOVE THIS LINE IF YOUR NETWORK ID IS IN SECOND COLUMN
    data: fs.readFileSync(dataFile, 'utf8'),
  });
} catch (error) {
  console.error('Failed to load model or data', error.message);
  process.exit(1);
}

(async () => {
  await agena.logIn(credentials);

  // Reading result cache
  let cache = '';
  try {
    cache = fs.readFileSync(resultCacheFile, 'utf8');
  } catch (error) {
    console.log('No results cached', error.message);
  }
  const cachedDatasets = cache ? cache.split('\n').filter((line) => line.trim() !== '').map((line) => JSON.parse(line)) : [];
  const cachedDatasetIds = cachedDatasets.map((ds) => ds.id);
  if (cachedDatasetIds.length > 0) {
    console.log('Cached results:', cachedDatasetIds.length);
  }

  // Calculate
  await agena.calculateBatch({
    model,
    dataSets: inputDatasets.filter((ds) => !cachedDatasetIds.includes(ds.id)),
    dataSetCallback: async (dsCalculated) => {
      // Write to cache
      cachedDatasetIds.push(dsCalculated.id);
      fs.appendFile(resultCacheFile, `${JSON.stringify(dsCalculated)}\n`, (error) => {
        if (error) {
          console.log('Failed to write results to cache', error.message);
        }
      });
    },
  });

  try {
    console.log('Writing results');
    const results = fs.readFileSync(resultCacheFile, 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => JSON.parse(line));
      // If you want results also sorted by ID then add sort stage here
      // .sort((a, b) => a.id.localeCompare(b.id)) // If you have String IDs
      // .sort((a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10)) // If have integer IDs

    fs.writeFileSync(outputFile, JSON.stringify(results));
  } catch (error) {
    console.log('Failed to write results', error.message);
    process.exit(1);
  }

  process.exit(0);
})();
