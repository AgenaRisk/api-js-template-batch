# Agena AI Cloud API - Template Batch Calculate Project
This is a template project that aims to make it easy to get into running batch calculations using Agena AI Cloud API.

# Environment
To set up your environment to run this project follow these steps:

1. Clone (or plain download) this example project repo
1. Install nodejs from https://nodejs.org/en/download/
1. In console (e.g. CMD or Powershell) navigate to the cloned repo
    
    Note: if running in PowerShell you may have to allow scripts to be executed by running command
    ```
    Set-ExecutionPolicy unrestricted
    ```
1. Install yarn
    ```
    npm install --global yarn
    ```
1. Install dependencies
    ```
    yarn install
    ```
1. Create directory .local in the cloned repo directory
1. Create file `.local/credentials.json` with your [Agena AI Cloud Portal](https://portal.agena.ai) credentials e.g.
    ```
    {
        "username": "test@example.com",
        "password": "111222333"
    }
    ```
1. Make sure this account is assigned a valid API key

    Note this account must be associated with an active subscription that would have sufficient allowances to run the intended workloads.
    
    The subscription owner would need to [assign a valid key](https://portal.agena.ai/account/license-keys) to the account that will be used to run the calculations.

# Inputs & Outputs
Default configuration assumes the following file paths:
| File | Path |
| ---- | ---- |
| Credentials | .local/credentials.json |
| Model | input/model.json |
| Data | input/data.csv |
| Results | output/cache.txt |
| Result Cache | output/results.json |

You can change any of these in `index.js` by editing this block:
```
const credentialsFile = path.resolve('./.local/credentials.json');
const modelFile = path.resolve('./input/model.json');
const dataFile = path.resolve('./input/data.csv');
const resultCacheFile = path.resolve('./output/cache.txt');
const outputFile = path.resolve('./output/results.json');
```

Note this script assumes all your observations are in a single network. You can either specify the network's ID on the second column of your CSV, or provide its ID to the `readCsv` function:
```
inputDatasets = agena.readCsv({
    network: 'New Risk Object0', // CHANGE THIS TO YOUR ACTUAL NETWORK ID, OR REMOVE THIS LINE IF YOUR NETWORK ID IS IN SECOND COLUMN
    data: fs.readFileSync(dataFile, 'utf8'),
});
```

If your observations are not limited to a single network, you will need to use a different method of providing observations:
```
inputDatasets = [
  agena.createDataset({
    id: '1',
    observations: [
      {
        network: 'net1',
        node: 'nodeA',
        entry: 'High',
      },
      {
        network: 'net2',
        node: 'nodeB',
        entry: 1000,
      },
    ],
  }),
];
```

# Running
Once all requuired files are in place, you can run your batch:
1. Open a console window and navigate to the repository directory
1. Execute command
    ```
    yarn start
    ```
1. The completed batch will be written to the output file as a JSON array of objects. Each such object would contain an ID of the dataset and an array of results.

    Check [documentation](https://agenarisk.atlassian.net/l/cp/hvpeVvJH#AgenaAICloudAPIManual-DataSet) for details of the JSON format.

Note
* This script will write results for individual datasets into result cache, and when all datasets are calculated, it will assemble the cache into the final results array.
* You can interrupt and restart the script, and it will pick up from where it left off, so it won't have to re-calculated results that had already been calculated.

# Documentation
More examples of the API usage can be found in the examples directory of the [library repository](https://github.com/AgenaRisk/api-js).

Relevant documentation includes details on the JSON format of Agena AI models and can be found [here](https://agenarisk.atlassian.net/l/cp/hvpeVvJH#AgenaAICloudAPIManual-DataSet).