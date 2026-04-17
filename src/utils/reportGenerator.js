const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs/promises');
const path = require('path');

async function generateReport(type, data) {
    try {
        const templateFile = type === 'driver-summary' ? 'driver-summary.hbs' : 'trip-logs.hbs';
        const templatePath = path.join(__dirname, '../templates', templateFile);
        const templateHtml = await fs.readFile(templatePath, 'utf-8');
        const template = handlebars.compile(templateHtml);
        
        // Convert logo if needed
        let logoBase64 = "";
        try {
            const logoPath = 'C:\\Users\\Mac\\Documents\\GitHub\\SDO-NEW-TRIPTICKET-CLIENT\\public\\kagawaran.png';
            const logoBuffer = await fs.readFile(logoPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } catch (err) {
            console.warn("Logo not found at specified path, continuing without logo.", err);
        }

        const html = template({
            ...data,
            logoBase64
        });

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: "new"
        });
        const page = await browser.newPage();
        await page.setContent(html);
        
        const pdf = await page.pdf({
            format: 'A4',
            landscape: type === 'driver-summary', // Driver summary is better in landscape
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
        console.error("Error generating report PDF:", error);
        throw error;
    }
}

module.exports = generateReport;
