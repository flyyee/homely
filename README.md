# Homely

## Requirements

- Node.js 12.18.1

- Npm 6.14.5

- Heroku CLI 7.47.11

- Python 3.8.3

## Setup

1. Clone this repo into a local folder.
2. Set-up heroku in your folder with: https://devcenter.heroku.com/articles/deploying-nodejs
3. Replace all instances of https://flyyee-homely.herokuapp.com in app.js and pages/site.html with your heroku site link
4. Place files you wish to remotely access in the data folder. It is currently populated with sample files and folders.
5. Launch homely with "python launcher.py"

## Launch options

-r: indicates that you wish to shut the heroku dyno down before any other operations begin.

-s: indicates that you only wish to end the heroku dyno. Launcher exits after the dyno shuts down.

-t XX: sets the interval (in XX seconds) for polling the data folder for changes. Default value: 10 seconds.

-u: indicates that you wish to update the server's copy of the data before launching. Necessary for an up-to-date copy if the data has been changed since the server was last launched.