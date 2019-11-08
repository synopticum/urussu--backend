### Start
- `mongod --dbpath ~/Desktop/git-reps/urussu--db/`
- `mongorestore --drop --host localhost --gzip --archive=/Users/synoptic/Downloads/urussu.latest.gz --nsInclude 'urussu.*'`
- `npm start -- --env dev --uri localhost --port 3000 --apiVersion 5.95 --serviceKey ??? --clientId ??? --clientSecret ??? --identityPoolId ???`

### Dump
- `mongodump --archive=urussu.latest.gz --gzip --db urussu`