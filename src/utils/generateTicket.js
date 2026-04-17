const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');

async function generateTicket(data) {
    try {
        const templatePath = path.join(__dirname, '../templates/trip-ticket.hbs');
        const templateHtml = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateHtml);
        
        let passengers = [];
        if (typeof data.passengers === 'string') {
            try {
                passengers = JSON.parse(data.passengers);
            } catch (e) {
                passengers = [data.passengers];
            }
        } else if (Array.isArray(data.passengers)) {
            passengers = data.passengers;
        }

        const html = template({
            ...data,
            passengers,
            logRows: new Array(32).fill({}) 
        });

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: "new"
        });
        const page = await browser.newPage();
        await page.setContent(html);
        
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        await browser.close();
        return pdf;
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }
}

module.exports = generateTicket;
