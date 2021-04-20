const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');

class TCGPlayer {
    browser = null;
    mainPage = null;
    data = {};

    config = {
        urls = [
            'https://www.tcgplayer.com/search/magic/product?productLineName=magic&page=1',
            'https://www.tcgplayer.com/search/yugioh/product?productLineName=yugioh&page=1',
            'https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&page=1',
            'tcgplayer.com/search/dragon-ball-super-ccg/product?productLineName=dragon-ball-super-ccg&page=1',
            'https://www.tcgplayer.com/search/flesh-and-blood-tcg/product?productLineName=flesh-and-blood-tcg&page=1',
        ],
        base_url: 'https://www.tcgplayer.com',
        onProgress: () => { },
        csvHeader: [
            { id: 'id', title: 'Product Id' },
            { id: 'cxid', title: 'Product Id' },
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
            executablePath: '/usr/bin/google-chrome-stable',
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
        for(url in this.config.urls){
            this.pagesLinks.push(await this.extactPagesLinks(url));
        }
        
        //create data sheet
        this.data = this.pagesLinks.map(pl => {
            return { id: url.parse(pl, true).query.xid, url: pl };
        });

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

        pageInfo.img = await page.$eval('#card_frame img', img => img.src);
        pageInfo.name = await page.$eval('#broad_title h1', img => img.innerText);

        let texts = await page.evaluate(() => {
            let items = Array.from(document.querySelectorAll('.item_box'));
            items = items.map(a => {
                let title = a.querySelector('.product-details__name').innerHTML;
                let value = a.querySelector('.product-description__value') ? a.querySelector('.product-description__value').innerText : ""
                if (!value) value = a.innerText.replace(title, '');
                value = value.trim();
                return { title, value };
            });

            items2 = Array.from(document.querySelectorAll('.item_box_text'));
            items2 = items2.map(a => {
                let title = a.querySelector('.item_box_title b').innerHTML;
                let value = a.querySelector('.item_box_value') ? a.querySelector('.item_box_value').innerText : ""
                if (!value) value = a.innerText.replace(title, '');
                value = value.trim();
                return { title, value };
            });
            return items.concat(items2);
        });
        pageInfo["atk_def"] = texts.filter(a => a.title == 'ATK').shift() + "/" + texts.filter(a => a.title == 'DEF').shift();
        pageInfo["attr"] = texts.filter(a => a.title == 'Attribute').shift();
        pageInfo["text"] = texts.filter(a => a.title == 'Card Text').shift();
        pageInfo["level"] = texts.filter(a => a.title == 'Level').shift();
        pageInfo["type"] = texts.filter(a => a.title == 'Monster Type').shift();
        pageInfo["passcode"] = '';
        return pageInfo;
    }

    async extactPagesLinks() {
        console.log('going to '.gray, `${this.config.url}`.green);
        const page = await this.browser.newPage();
        await page.goto(this.config.url);
        const linkHrefs = await page.$$eval('.search-result__product', linkHrefs => linkHrefs.map(l => l.href));
        console.log('Address loaded'.green);
        await page.close();
        console.log('Address loaded'.green);
        // let links =  linkHrefs.map(l => `${this.config.base_url}${l}`);
        console.log(links);
        return links;
    }
    async close() {
        await this.browser.close();
    }

}

module.exports = Yugioh;