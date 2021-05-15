const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');
const { framework } = require('passport');
var isWin = process.platform === "win32";

class TrexArms {
    browser = null;
    mainPage = null;
    data = [];
    config = {
        url: 'https://esstac.com/shop-all/?sort=featured',
        urls: [
            'https://www.trex-arms.com/product-category/holster-categories/',
            'https://www.trex-arms.com/product-category/nylon/',
            'https://www.trex-arms.com/product-category/rifle-upgrades/',
            'https://www.trex-arms.com/product-category/pistol-upgrades/',
            'https://www.trex-arms.com/product-category/Targets/',
            'https://www.trex-arms.com/product-category/Body-Armor/',
            'https://www.trex-arms.com/product-category/handheld-lights-2/',
            'https://www.trex-arms.com/product-category/medical/',
            'https://www.trex-arms.com/product-category/swag/',
        ],
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
        let links = [];

        for(url in this.config.urls){
            let link = this.config.urls[url];
            await page.goto(link);
            let newLinks = await page.$$eval('.product-link-wrapper', links => links.map(l => l.href))
            links = newLinks.concat(links);
        }

        for(var l in links){
            await page.goto(links[l]);
            // let title = await page.$eval('.productView-title', name => name ? name.textContent: '')
            await page.waitForTimeout(1000)
            this.data.push({
                'link' : links[l],
                'title': await page.$eval('.product_title', name => name ? name.textContent: ''),
                'description': await page.$eval('.summary', name => name ? name.textContent: '') 
            });


        }
        await this.close();
        if (onfinish) onfinish(this.data);
        return this.data;
    }

    async close() {
        await this.browser.close();
    }

}


module.exports = TrexArms;