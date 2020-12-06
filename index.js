#!/usr/bin/env node

'use strict'

const { exec } = require("child_process");
const got = require('got');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

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
    backup(repo.clone_url);
  });

})();

async function get(endpoint = '') {
  return got.get(apiURL + endpoint + '?token=' + apiToken).json();
}

function backup(repoURL) {

  const r = new URL(repoURL);

  r.username = r.pathname.split('/')[1];
  r.password = apiToken;

  const repo = path.join(backupDir, path.basename(r.pathname));

  let gitArgs = ['clone', '--mirror', r.href];
  let commandDir = backupDir;

  if (fs.existsSync(repo)) {

    gitArgs = ['remote', 'update'];
    commandDir = repo;

  }

  const gitOp = spawn('git', gitArgs, { cwd: './' + commandDir });

  gitOp.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  gitOp.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  gitOp.on('close', function (code) {
    console.log(repo + ': exited with code ' + code);
  });
}
