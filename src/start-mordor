fuser -n tcp -k 8888 || true
fuser -n tcp -k 8000 || true
fuser -n tcp -k 4000 || true
fuser -n tcp -k 3000 || true
fuser -n tcp -k 3334 || true

npx concurrently -n eyeofsauron,eyeofsauron-2,blackgate,mordor \
"cd ~/FieldControl/eyeofsauron && . ~/.nvm/nvm.sh && nvm use && npm run start-dev" \
"cd ~/FieldControl/eyeofsauron-2 && . ~/.nvm/nvm.sh && nvm use && npm run start-dev" \
"cd ~/FieldControl/blackgate/api && . ~/.nvm/nvm.sh && nvm use && npm run start-dev" \
"cd ~/FieldControl/mordor && . ~/.nvm/nvm.sh && nvm use && npm run start-dev"