#!/usr/bin/bash

sudo snap install slack --classic

sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

# trust google chrome public key
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -

# downoad google chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# update apt sources
sudo apt update

sudo apt install google-chrome-stable


