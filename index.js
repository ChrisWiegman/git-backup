#!/usr/bin/env node

'use strict'

const { exec } = require("child_process");
const got = require('got');
const fs = require('fs');
const url = require('url');
const path = require('path');

const backupDir = './backups';

let apiURL = '';
let apiToken = '';

(async () => {

  if (!process.env.GITEA_TOKEN) {
    console.warn('You must provide the GITEA_TOKEN as an environment variable');
    process.exit(1);
  }

  if (!process.env.GITEA_DOMAIN) {
    console.warn('You must provide the GITEA_DOMAIN as an environment variable');
    process.exit(1);
  }

  apiToken = process.env.GITEA_TOKEN
  apiURL = 'https://' + process.env.GITEA_DOMAIN + '/api/v1/';

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const repos = await get('user/repos');

  repos.forEach(repo => {
    backup(repo.ssh_url);
  });

})();

async function get(endpoint = '') {
  return got.get(apiURL + endpoint + '?token=' + apiToken).json();
}

function backup(repoURL) {

  const r = url.parse(repoURL, true);
  const repo = path.join(backupDir, path.basename(r.pathname));

  if (!fs.existsSync(repo)) {

    exec(
      'git clone --mirror ' + repoURL + ' ' + repo,
      (error, stdout, stderr) => {
        processBackup(repo, error, stdout, stderr);
      }
    );

  } else {

    exec(
      'git remote update',
      {
        cwd: './' + repo
      },
      (error, stdout, stderr) => {
        processBackup(repo, error, stdout, stderr);
      }
    );

  }
}

function processBackup(repo, error, stdout, stderr) {

  if (error) {

    console.log(`Failed Backing up: ${repo}`);
    console.log(error);
    return;

  }
  if (stderr) {

    console.log(`Failed Backing up: ${repo}`);
    console.log(stderr);
    return;

  }

  console.log(`Backing up: ${repo}`);
  console.log(stdout);

}
