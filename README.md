![](https://i.imgur.com/pUq7er4.png)

# Homely

---

## About

Remotely access files on your computer from anywhere, on any device. All your files are hosted on your ***OWN*** web server, which can be manually configured and tailored to your needs.

### [Installer for automatic set-up](https://github.com/flyyee/homelyinstaller)

Manual set-up guide below (only recommended for advanced users).

---

## Requirements

- Node.js 12.18.1
- Npm 6.14.5
- Heroku CLI 7.47.11
- Python 3.8.3

These are the versions on Windows 10 that Homely was tested to work with. Homely may still work with other versions, but support is not guaranteed.  

OSX/Linux is not supported.

---

## Setup

1. Clone this repo into a local folder.
2. Set-up heroku in your folder with: https://devcenter.heroku.com/articles/deploying-nodejs
3. Set heroku_url in app.js and pages/site.html with your heroku site link (https://example.herokuapp.com)
5. Launch homely with launcher.py

---

## Usage

1. Navigate to the main installation folder (called "Homely" by default).
2. Place files you wish to remotely access in the data folder. It is currently populated with sample files and folders.
3. Launch homely with launcher.py. Exiting the launcher will turn off dynamic file access, so any changes to files locally will not be reflected on the server until the launcher is restarted.
4. Bring the server offline with the "-s" option. You will be unable to access the site until it is launched again.

---

## Launch options

### Note:  All launch options indicate a non-default setting. If a launch option is not set, the launcher will run using the default value or the opposite of the option.

-na: disables all sound notifications. Sound notifications are emitted when the server has started and shut down.

-nc: disables checking loop. Launcher exits when the server has started, so the server's copy of the data will not be updated until the launcher is restarted without this option.

-nu: starts the server without updating the server's copy of the data from the previous launch.

-r: indicates that you wish to shut the heroku dyno down before any other operations begin.

-ra: enables sound notifications when running the check loop. Includes all sound notifications under "-na" and when the launcher detects updated data.

-s: indicates that you only wish to end the heroku dyno. Launcher exits after the dyno shuts down. Takes precedence over all other options.

-t XX: sets the interval (in XX seconds) for polling the data folder for changes. Default value: 10 seconds.

---

Created and maintained by [flyyee](https://github.com/flyyee) under GNU General Public License v3.0