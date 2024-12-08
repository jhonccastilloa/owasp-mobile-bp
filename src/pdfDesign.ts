export const createPdfDefinition = (json: any) => {
    const owaspBlocks = Object.keys(json.owasp).reduce((acc: any, category) => {
        acc.push({
            text: category,
            style: 'header',
            margin: [0, 10, 0, 5]
        });

        json.owasp[category].permissions.forEach((permission: any) => {
            let statusColor = 'orange';
            if (permission.status === 'OK') {
                statusColor = 'green';
            } else if (permission.status === 'ERROR') {
                statusColor = 'red';
            }

            let extraContent = [];
            if (permission.permission === "Logs en archivos Java" && permission.extraData) {
                extraContent = permission.extraData.map((extra: any) => ({
                    text: [
                        { text: `Archivo: ${extra.file}\n`, bold: true },
                        {
                            text: `Líneas: ${extra.line}\n`,
                            //  italics: true
                        },
                        //   { text: `Patrón: ${extra.pattern}\n`, color: 'gray' }
                    ],
                    margin: [10, 5, 0, 5]
                }));
            } else {
                extraContent = [
                    {
                        text: `Archivo: ${permission.nameFile || 'No especificado'} - línea: ${permission.numLine || 'No especificado'}`,
                        // italics: true
                    }
                ];
            }

            acc.push({
                stack: [
                    {
                        text: [
                            { text: `${permission.status}`, color: statusColor },
                            { text: ` ${permission.permission} - ${permission.message || 'Sin descripción.'}`, color: 'black' }
                        ],
                        margin: [0, 0, 0, 5]
                    },
                    ...extraContent
                ],
                margin: [10, 0, 0, 5]
            });
        });

        return acc;
    }, []);

    return {
        content: [
            {
                table: {
                    widths: ['33%', '33%', '33%'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: 'Nombree de la aplicación:', bold: true },
                                    { text: json.appName },
                                    { text: 'Estado:', bold: true, margin: [0, 10, 0, 0] },
                                    { text: json.percentage }
                                ]
                            },
                            {
                                stack: [
                                    { text: 'Branch:', bold: true },
                                    { text: json.currentBranch },
                                    { text: 'Líneas:', bold: true, margin: [0, 10, 0, 0] },
                                    { text: '1000' }
                                ]
                            },
                            {
                                stack: [
                                    { text: 'Fecha:', bold: true },
                                    { text: json.date }, // Dinámico
                                    { text: 'Umbral de Calidad:', bold: true, margin: [0, 10, 0, 0] },
                                    { text: json.status ? 'OK' : 'ERROR' } // Dinámico
                                ]
                            }
                        ]
                    ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 10]
            },
            ...owaspBlocks
        ],
        defaultStyle: {
            // font: 'Roboto',
            fontSize: 12,
        },
        styles: {
            header: {
                fontSize: 14,
                bold: true
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: 'black'
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
