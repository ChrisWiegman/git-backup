# Gitea Backup Script

This script will backup all the repos in a user's Gitea account.

## Use

1. Install Node dependencies:

`npm i`

2. Run the backup

`export GITEA_TOKEN=MyGiteaToken; export GITEA_DOMAIN=my.gitea.domain; npm start`

That's it. All repos will be backed up to a subfolder called "backups"
