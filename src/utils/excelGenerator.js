const ExcelJS = require('exceljs');

async function generateExcelReport(type, data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Travel Ticket Report');

    if (type === 'travel-ticket-report') {
        // Define columns
        worksheet.columns = [
            { header: 'Trip Ticket ID', key: 'tripticketId', width: 20 },
            { header: 'Driver', key: 'driver', width: 25 },
            { header: 'Vehicle', key: 'vehicle', width: 20 },
            { header: 'Requestor', key: 'requestor', width: 30 },
            { header: 'Passengers', key: 'passengers', width: 40 },
            { header: 'Departure Date', key: 'departureDate', width: 15 },
            { header: 'Departure Time', key: 'departureTime', width: 15 },
            { header: 'Arrival Date', key: 'arrivalDate', width: 15 },
            { header: 'Arrival Time', key: 'arrivalTime', width: 15 },
            { header: 'Date of Approval', key: 'approvedDate', width: 20 },
        ];

        // Format header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data
        data.travels.forEach(item => {
            worksheet.addRow({
                tripticketId: item.tripticketId,
                driver: item.driver,
                vehicle: item.vehicle,
                requestor: item.requestor,
                passengers: item.passengers,
                departureDate: item.departureDate,
                departureTime: item.departureTime,
                arrivalDate: item.arrivalDate,
                arrivalTime: item.arrivalTime,
                approvedDate: item.approvedDate
            });
        });

        // Add alternate row styling
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                if (rowNumber % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9F9F9' }
                    };
                }
            }
            row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        });
    }

    return await workbook.xlsx.writeBuffer();
}

module.exports = generateExcelReport;
