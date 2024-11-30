export const createPdfDefinition = (contentArray: any) => {
    return {
        content: [
            {
                columns: [
                    {
                        text: 'Informe de Seguridad del Proyecto',
                        style: 'header',
                        alignment: 'center',
                        margin: [0, 10],
                        width: '*'
                    }
                ]
            },
            {
                columns: [
                    { text: 'Nombre del Proyecto: Proyecto X', style: 'subheader' },
                    { text: 'Rama: main', style: 'subheader' }
                ]
            },
            {
                columns: [
                    { text: 'Líneas de Código: 14500', style: 'subheader' },
                    { text: 'Fecha: 2024-11-20', style: 'subheader' }
                ]
            },
            {
                columns: [
                    { text: 'Estado: Aprobado', style: 'subheader' },
                    { text: 'Porcentaje: 90%', style: 'subheader' }
                ]
            },
            { text: '\n' }, // Espaciado

            { text: 'Distribución de Resultados OWASP Mobile Top 10', style: 'sectionHeader' },

            // M8
            {
                text: 'M8: Manipulación de código',
                style: 'cardTitle',
                fillColor: '#f2f2f2',
                alignment: 'center',
                margin: [0, 10]
            },
            {
                text: 'Porcentaje: 85%',
                style: 'cardPercent',
                alignment: 'center',
                margin: [0, 10]
            },
            {
                text: 'Ítems que pasaron:',
                style: 'cardDescription',
                bold: true
            },
            {
                text: 'The application should refuse to run on a rooted device',
                style: 'cardDescription'
            },
            {
                text: 'Ítems que fallaron:',
                style: 'cardDescription',
                bold: true
            },
            ...contentArray.map((line: any) => ({
                text: `Archivo: ${line.file}, Línea: ${line.line}`,
                style: 'cardDescription'
            }))
        ],
        defaultStyle: {
            // font: 'Roboto',
            fontSize: 12,
        },
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 10]
            },
            subheader: {
                fontSize: 12,
                margin: [0, 5]
            },
            sectionHeader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10]
            },
            cardTitle: {
                fontSize: 14,
                bold: true,
                margin: [5, 5, 5, 5]
            },
            cardPercent: {
                fontSize: 12,
                bold: true,
                color: 'green',
                margin: [5, 5, 5, 5]
            },
            cardDescription: {
                fontSize: 10,
                margin: [5, 5, 5, 5]
            }
        },
        pageMargins: [40, 60, 40, 60],
        footer: (currentPage: number, pageCount: number) => {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 10, 0, 0],
            };
        },
    };
};
