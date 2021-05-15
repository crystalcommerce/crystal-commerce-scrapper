const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');
const { framework } = require('passport');
var isWin = process.platform === "win32";

class ESSTAC {
    browser = null;
    mainPage = null;
    data = [];
    config = {
        url: 'https://esstac.com/shop-all/?sort=featured',
        csvHeader: [
            { id: 'productName', title: 'Product Name', xPath: `//*[@id="cardDetail"]/table/tbody/tr[1]/td[2]` },
            { id: 'cardName', title: 'Card Name', xPath: `//*[@id="cardDetail"]/table/tbody/tr[1]/td[2]` },
            { id: 'cardNumber', title: 'Card Number', xPath: `//*[@id="cardDetail"]/table/tbody/tr[2]/td[1]` },
            { id: 'cardText', title: 'Card Text', xPath: `//*[@id="cardDetail"]/table/tbody/tr[8]/td` },
            { id: 'color', title: 'Color', xPath: `//*[@id="cardDetail"]/table/tbody/tr[4]/td[2]` }
        ]
    };


    constructor() {
        // this.init();
    }

    async init() {
        this.browser = await this.initializePuppeteer(this.config.url);
    }

    async initializePuppeteer() {
        let config = {
            headless: true,
            args: [
                'no-sandbox',
                'disable-setuid-sandbox',
            ]
        };

        if (!isWin)
            config.executablePath = '/usr/bin/google-chrome-stable';


        const browser = await puppeteer.launch(config);
        return browser;
    }

    async start(onfinish) {
        ///get urls
        if (!this.browser) await this.init();

        if (!this.data) this.data = [];
        const page = await this.browser.newPage();
        await page.goto(this.config.url);

        // .card > figure > a

        let links = await page.$$eval('.card > figure > a', links => links.map(l => l.href))
        
        await page.goto('https://esstac.com/shop-all/?sort=featured&page=2');

        let links2 =  await page.$$eval('.card > figure > a', links => links.map(l => l.href));

        links = links2.concat(links);

        // console.log(links);

        for(var l in links){
            console.log(l)
            await page.goto(links[l]);
            let title = await page.$eval('.productView-title', name => name ? name.textContent: '')
            this.data.push({
                'link' : links[l],
                'title': await page.$eval('.productView-title', name => name ? name.textContent: ''),
                'description': await page.$eval('#accordion--description', name => name ? name.textContent: '') 
            });

            ///add item to retrun options
        }
        await this.close();
        if (onfinish) onfinish(this.data);
        return this.data;
    }

    async close() {
        await this.browser.close();
    }

}


module.exports = ESSTAC;