const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

const createCertificate = async (certificateName) => {
    try {
        const pdfDoc = await PDFDocument.load(fs.readFileSync(__dirname + '/certificate.pdf'))

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]

        const { width, height } = firstPage.getSize()

        const textWidth = helveticaFont.widthOfTextAtSize(certificateName, 30)

        // Draw a string of text diagonally across the first page
        firstPage.drawText(certificateName, {
            x: 405 - textWidth/2,
            y: 262,
            size: 30,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        })

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()

        return pdfBytes;
    }
    catch (error) {
        //console.error(`Error: ${error.message}`);
        console.log(error);
    }
}

module.exports = createCertificate;