const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');

class BoardGameGeek {
    browser = null;
    mainPage = null;
    data = {};

    config = {
        url: "https://www.boardgamegeek.com/browse/boardgame/page/1",
        base_url: 'https://www.boardgamegeek.com/',
        onProgress: () => { },
        csvHeader: [
            { id: 'id', title: 'Product Id' },
            { id: 'img', title: 'Product Image' },
            { id: 'name', title: 'Product Name' },
            { id: 'atk_def', title: 'ATK/DEF' },
            { id: 'attr', title: 'Attribute' },
            { id: 'text', title: 'Card Text' },
            { id: 'level', title: 'Level' },
            { id: 'type', title: 'Monster Type' },
            { id: 'passcode', title: 'Passcode' }
        ]
    };


    constructor() {
        this.init();
    }

    async init() {
        this.browser = await this.initializePuppeteer(this.config.url);
    }

    async initializePuppeteer() {

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                'no-sandbox',
                'disable-setuid-sandbox',
            ]
        });
        return browser;
    }

    async start(onfinish) {
        ///get urls
        if (!this.browser) await this.init();
        this.pagesLinks = await this.extactPagesLinks();
        //create data sheet
        this.data = this.pagesLinks.map(pl => {
            return { id: this.location.href.split("/")[this.location.href.split("/").length - 2], url: pl };
        });

        console.log(this.data)
        for (var i = 0; i < this.data.length; i++) {
            let item = await this.loadPageData(this.data[i]);
            if (this.onNewItem) this.onNewItem(item);
            this.data[i] = item;
            if (this.config.onProgress) this.config.onProgress(item, (i / this.data.length));
        }

        if (onfinish) onfinish(this.data);
        this.close();
        return this.data;
    }

    async loadPageData(pageInfo) {
        console.log('getting info for :'.gray, pageInfo.id.green);
        const page = await this.browser.newPage();
        await page.goto(pageInfo.url);
        pageInfo.img = await page.$eval('.game-header img', img => img.src);
        pageInfo.name = await page.$eval('.game-header-title-info h1', img => img.innerText);
        return pageInfo;
    }

    async extactPagesLinks() {
        console.log('going to '.gray, `${this.config.url}`.green);
        const page = await this.browser.newPage();
        await page.goto(this.config.url);
        const linkHrefs = await page.$$eval('.primary', linkHrefs => linkHrefs.map(l => l.getProperty('href')));
        await page.close();
        return linkHrefs.map(l => `${this.config.base_url}${l}`);
    }
    async close() {
        await this.browser.close();
    }

}

module.exports = Yugioh;