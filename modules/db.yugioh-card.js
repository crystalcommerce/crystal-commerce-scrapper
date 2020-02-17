const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');

export default class Yugioh {
    browser = null;
    mainPage = null;
    data = {};

    config = {
        url: "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=1&pid=14415003&rp=99999",
        base_url: 'https://www.db.yugioh-card.com',
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
        const browser = await puppeteer.launch();
        return browser;
    }

    async start() {
        ///get urls
        if (!this.browser) await this.init();
        this.pagesLinks = await this.extactPagesLinks();
        //create data sheet
        this.data = this.pagesLinks.map(pl => {
            return { id: url.parse(pl, true).query.cid, url: pl };
        });

        for (var i = 0; i < this.data.length; i++){
            this.data[i] = await this.loadPageData(this.data[i]);
        }

        return this.data();
    }

    async loadPageData(pageInfo) {
        console.log('getting info for :'.gray, pageInfo.id.green);
        const page = await this.browser.newPage();
        await page.goto(pageInfo.url);

        pageInfo.img = await page.$eval('#card_frame img', img => img.src);
        pageInfo.name = await page.$eval('#broad_title h1', img => img.innerText);

        let texts = await page.evaluate(() => {
            let items = Array.from(document.querySelectorAll('.item_box'));
            items = items.map(a=> {
                        let title =  a.querySelector('.item_box_title b').innerHTML;
                        let value = a.querySelector('.item_box_value')? a.querySelector('.item_box_value').innerText : ""
                        if(!value) value = a.innerText.replace(title, '');
                        value = value.trim();
                        return {title, value};
                    });

            items2 = Array.from(document.querySelectorAll('.item_box_text'));
            items2 = items2.map(a=> {
                        let title =  a.querySelector('.item_box_title b').innerHTML;
                        let value = a.querySelector('.item_box_value')? a.querySelector('.item_box_value').innerText : ""
                        if(!value) value = a.innerText.replace(title, '');
                        value = value.trim();
                        return {title, value};
                    });
            return items.concat(items2);
        });

        // [ 
        //     { title: 'Attribute', value: 'LIGHT' },
        //     { title: 'Level', value: '2' },
        //     { title: 'Monster Type', value: 'Spellcaster' },
        //     { title: 'Card Type', value: 'Flip / Effect' },
        //     { title: 'ATK', value: '900' },
        //     { title: 'DEF', value: '100' },
        //     { title: 'Card Text', value: 'FLIP: You can Special Summon 1 "Shaddoll" monster from your hand in face-up or face-down Defense Position.\nIf this card is sent to the GY by a card effect: You can send 1 "Shaddoll" monster from your hand to the GY, and if you do, for the rest of this turn, all monsters you control gain ATK/DEF equal to the original Level of that monster sent to the GY x 100. You can only use 1 "Qadshaddoll Keios" effect per turn, and only once that turn.' }
        // ];
    
        // { id: 'id', title: 'Product Id' },
        // { id: 'img', title: 'Product Image' },
        // { id: 'name', title: 'Product Name' },
        // { id: 'atk_def', title: 'ATK/DEF' },
        // { id: 'attr', title: 'Attribute' },
        // { id: 'text', title: 'Card Text' },
        // { id: 'level', title: 'Level' },
        // { id: 'type', title: 'Monster Type' },
        // { id: 'passcode', title: 'Passcode' }
        
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
        console.log('Address loaded'.green);
        const linkHrefs = await page.$$eval('.box_list li .link_value', linkHrefs => linkHrefs.map(l => l.value));
        await page.close();
        return linkHrefs.map(l => `${this.config.base_url}${l}`);
    }
    async close() {
        await this.browser.close();
    }

}