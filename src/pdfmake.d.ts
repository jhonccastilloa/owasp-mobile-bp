declare module 'pdfmake' {
    interface TFontDictionary {
        [name: string]: {
            normal: string;
            bold?: string;
            italics?: string;
            bolditalics?: string;
        };
    }

    class PdfPrinter {
        constructor(fonts: TFontDictionary);
        createPdfKitDocument(
            definition: any,
            options?: any
        ): import('pdfkit');
    }

    export default PdfPrinter;
}
