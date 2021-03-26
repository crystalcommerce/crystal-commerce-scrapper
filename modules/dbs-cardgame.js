const puppeteer = require('puppeteer');

var url = require('url');
var colors = require('colors');

class dbsCardgame {
    browser = null;
    mainPage = null;
    data = {};

    config = {
        url: "http://www.dbs-cardgame.com/us-en/cardlist/?search=true&category=428013",
        base_url: 'http://www.dbs-cardgame.com',
        onProgress: () => { },
        csvHeader: [
            { id: 'card_number', title: 'Card Number' },
            { id: 'card_name', title: 'Card Name' },
            { id: 'rarity', title: 'Rarity' },
            { id: 'type', title: 'Type' },
            { id: 'color', title: 'Color' },
            { id: 'power', title: 'Power' },
            { id: 'energy', title: 'Energy (Color Cost)' },
            { id: 'combo_energy', title: 'Combo Energy' },
            { id: 'combo_power', title: 'Combo Power' },
            { id: 'character', title: 'Character' },
            { id: 'special_trait', title: 'Special Trait' },
            { id: 'era', title: 'Era' },
            { id: 'skill', title: 'Skill' }
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
        console.log(this.browser);
        if (!this.browser) await this.init();
        console.log(this.browser);
        let cards = await this.extactPageData();
        //create data sheet


        if (onfinish) onfinish(cards);
        this.close();
        return this.data;
    }
    async extactPageData() {
        console.log('going to '.gray, `${this.config.url}`.green);
        const page = await this.browser.newPage();
        await page.goto(this.config.url, { waitUntil: 'load', timeout: 0 });
        console.log("here 3")
        // const listItems = await page.$$eval('li', as => as);
        await page.waitForSelector('li');

        let elements = await page.$$('li');
        // loop trough items
        let cards = []
        for (let i = 0; i < elements.length; i++) {

            // capturing button and its text
            let cardName = await elements[i].$('.cardName');
            let cardNumber = await elements[i].$('.cardNumber');
            let rarityCol = await elements[i].$('.rarityCol dd');
            let typeCol = await elements[i].$('.typeCol dd');
            let colorCol = await elements[i].$('.colorCol dd');
            let powerCol = await elements[i].$('.powerCol dd');
            let energyCol = await elements[i].$('.energyCol dd');
            let comboEnergyCol = await elements[i].$('.comboEnergyCol dd');
            let comboPowerCol = await elements[i].$('.comboPowerCol dd');
            let characterCol = await elements[i].$('.characterCol dd');
            let specialTraitCol = await elements[i].$('.specialTraitCol dd');
            let eraCol = await elements[i].$('.eraCol dd');
            let skillCol = await elements[i].$('.skillCol dd');

            let card_number = "";
            let card_name = "";
            let rarity = "";
            let type = "";
            let color = "";
            let power = "";
            let energy = "";
            let combo_energy = "";
            let combo_power = "";
            let character = "";
            let special_trait = "";
            let era = "";
            let skill = "";

            if (cardName)
                card_name = await page.evaluate(el => el.innerText, cardName);
            if (cardNumber)
                card_number = await page.evaluate(el => el.innerText, cardNumber);
            if (rarityCol)
                rarity = await page.evaluate(el => el.innerText, rarityCol);
            if (typeCol)
                type = await page.evaluate(el => el.innerText, typeCol);
            if (colorCol)
                color = await page.evaluate(el => el.innerText, colorCol);
            if (powerCol)
                power = await page.evaluate(el => el.innerText, powerCol);
            if (energyCol)
                energy = await page.evaluate(el => el.innerText, energyCol);
            if (comboEnergyCol)
                combo_energy = await page.evaluate(el => el.innerText, comboEnergyCol);
            if (comboPowerCol)
                combo_power = await page.evaluate(el => el.innerText, comboPowerCol);
            if (characterCol)
                character = await page.evaluate(el => el.innerText, characterCol);
            if (specialTraitCol)
                special_trait = await page.evaluate(el => el.innerText, specialTraitCol);
            if (eraCol)
                era = await page.evaluate(el => el.innerText, eraCol);
            if (skillCol)
                skill = await page.evaluate(el => el.innerText, skillCol);

            cards.push({
                card_name, card_number, rarity, type, color, power, energy, combo_energy, combo_power,
                combo_power, character, special_trait, era, skill
            })
        }
        await page.close();
        return cards;
    }

    

    async close() {
        await this.browser.close();
    }

}

module.exports = dbsCardgame;