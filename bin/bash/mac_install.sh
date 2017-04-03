#!/bin/bash

CHROMEDRIVER="chromedriver_mac32"
PHANTOM_JS="phantomjs-2.1.1-macosx"
SCRIPT_DIR=$(dirname $0)

# Clean up and create tmp folder.
if [ -d $SCRIPT_DIR/tmp ]; then
  sudo rm -rf $SCRIPT_DIR/tmp
fi

sudo mkdir -p $SCRIPT_DIR/tmp
cd $SCRIPT_DIR/tmp

# Install `wget` in brew if command not found.
if ! type wget > /dev/null; then
  brew install wget --with-libressl
fi

# Download, extract and link PhantomJS to use in commandline.
sudo wget -c --show-progress https://bitbucket.org/ariya/phantomjs/downloads/$PHANTOM_JS.zip 2>&1
sudo unzip -a -q $PHANTOM_JS.zip
sudo rm -rf $SCRIPT_DIR/tmp/$PHANTOM_JS.zip
sudo mv $SCRIPT_DIR/tmp/$PHANTOM_JS/bin/phantomjs /usr/local/share
sudo ln -sf /usr/local/share/phantomjs /usr/local/bin

# Set up chromedriver
sudo wget -c --show-progress https://chromedriver.storage.googleapis.com/2.9/$CHROMEDRIVER.zip 2>&1
sudo unzip -a -q $CHROMEDRIVER.zip
sudo rm -rf $SCRIPT_DIR/tmp/$CHROMEDRIVER.zip
sudo mv $SCRIPT_DIR/tmp/chromedriver /usr/local/share
sudo ln -sf /usr/local/share/chromedriver /usr/local/bin

# Clear things up.
sudo rm -rf $SCRIPT_DIR/tmp
echo -e "PhantomJS version $(phantomjs --version) is installed.\n"
echo -e "Chromedriver version 2.9 is installed.\n"
echo "Done!"
