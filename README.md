[![Build Status](https://travis-ci.com/VictorCoder123/spambot.svg?token=UZhJsmNrPxkybgGEUmNz&branch=master)](https://travis-ci.com/VictorCoder123/spambot)
[![Code Climate](https://codeclimate.com/repos/58e1b7d8d6d38802920017f8/badges/9afd229bbf692233b78c/gpa.svg)](https://codeclimate.com/repos/58e1b7d8d6d38802920017f8/feed)

# spambot

The spambot-cli is a tool for initiating spam attack on WordPress blog using free proxy online to hide its trace.

## Quick start

### Install spambot Command-line tool
Install npm package `spambot-cli` in terminal.
```
npm install -g spambot-cli
```
[Chrome Webdriver](https://sites.google.com/a/chromium.org/chromedriver) and [PhantomJS](http://phantomjs.org/download.html) will be automatically downloaded and installed on your machine.

### Get a list of free proxy online
By default, spambot will return 10 or less available proxies.
```
spambot proxy -n --number 10
```

### Search for article urls under blog
```
spambot search yourwordpress.com
```

### Spam a random article in target blog
```
spambot spam yourwordpress.com
        -d --dirty
        -m --message <string>
        -i --interval <millisec>
        -v --verbose
```
