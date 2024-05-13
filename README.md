# shared data folder

make sure that a data folder exists in the project root and that it contains a ratings.json filei
set the permissions on the folder and the file to 777

`chmod 777 -R data`

# generating images

this is done using the separate "openai" project. This project uses an array of prompts to create a series of images through the openai api

see the README.md in that project for instructions

#update babylon server

- check-in all local changes and push to github
- login over ssh then execute

```
cd /volume1/webserver-data/
cp select-images/data/ratings.json ./<currentdate>-ratings.json
cd select-images/
git pull
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

test site at https://backend.devilsshare.org
