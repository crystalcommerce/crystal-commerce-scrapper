# Catalog Product information retrieval Tool

Uses Nodejs, Express web framework, and Puppeteer to access the sites where catalog information is provided.

Optional Configurations which should be used on production server:

* `PORT` port on which to accept http requests for the web server
* `MONGO_DB_URI` for example `mongodb://localhost:27017/`
* `CHROME_PATH` server file system path to chrome executable (e.g. `/usr/bin/google-chrome-stable`)
