const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');

async function generateReport(type, data) {
    try {
        const templateFile = type === 'vehicle-summary' ? 'vehicle-summary.hbs' : 'trip-logs.hbs';
        const templatePath = path.join(__dirname, '../templates', templateFile);
        const templateHtml = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateHtml);
        
        // Convert header image if available
        let headerBase64 = "";
        try {
            const headerPath = path.join(__dirname, "../templates/header.png");
            const headerBuffer = await fs.readFile(headerPath);
            headerBase64 = `data:image/png;base64,${headerBuffer.toString('base64')}`;
        } catch (err) {
            console.error("Error reading header image:", err);
        }

        const html = template({
            ...data,
            headerBase64
        });

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: "new"
        });
        const page = await browser.newPage();
        await page.setContent(html);
        
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true, // All reports are now better in landscape
            printBackground: true,
            margin: {
                top: '5mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        await browser.close();
        return pdf;
    } catch (error) {
        throw error;
    }
}

module.exports = generateReport;
