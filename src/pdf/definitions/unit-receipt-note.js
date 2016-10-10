module.exports = function (unitReceiptNote) {

    var items = [].concat.apply([], unitReceiptNote.items);

    var iso = unitReceiptNote.items.find(r => true).iso;
    var number = unitReceiptNote.no;

    var locale = 'id-id';
    var dateLocaleOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var numberLocaleOptions = {
        style: 'decimal',
        maximumFractionDigits: 4

    };
    var header = [{
        columns: [{
            columns: [{
                width: '*',
                stack: [{
                    text: 'PT DAN LIRIS',
                    style: ['size10', 'bold']
                }, {
                        text: 'BANARAN SUKOHARJO',
                        style: ['size09']
                    }]
            }]

        },
            {
                columns: [{
                    width: '*',
                    stack: [{
                        alignment: "right",
                        text: 'ISO',
                        style: ['size08', 'bold']
                    }, {
                            alignment: "right",
                            text: 'BON PENERIMAAN UNIT',
                            style: ['size09']
                        }]
                }]

            }]
    }];

    var subHeader = [{
        columns: [
            {
                width: '40%',
                columns: [{
                    width: '*',
                    stack: ['Tanggal', 'Diterima Dari']
                }, {
                        width: '1%',
                        stack: [':', ':']
                    }, {
                        width: '*',
                        stack: [`${new Date(unitReceiptNote.date).toLocaleString(locale, dateLocaleOptions)}`, unitReceiptNote.supplier.name]
                    }],
                style: ['size07']

            },
            {
                width: '20%',
                text: ''
            },
            {
                width: '40%',
                columns: [{
                    width: '42%',
                    stack: ['Bagian', 'No.']
                }, {
                        width: '1%',
                        stack: [':', ':']
                    }, {
                        width: '*',
                        stack: [unitReceiptNote.unit.division, unitReceiptNote.no]
                    }],
                style: ['size07']
            }
        ]
    }, '\n'];

    var line = [{
        canvas: [{
    	       type: 'line',
            x1: 0,
            y1: 5,
            x2: 378,
            y2: 5,
            lineWidth: 0.5
        }
        ]
    }, '\n'];

    var thead = [{
            text: 'No.',
            style: 'tableHeader'
        }, {
            text: 'Nama barang',
            style: 'tableHeader'
        }, {
            text: 'Jumlah',
            style: 'tableHeader'
        }, {
            text: 'Satuan',
            style: 'tableHeader'
        }, {
            text: 'Keterangan',
            style: 'tableHeader'
        }];

    
    
    var tbody = items.map(function(item){
        return [{
            text: $index,
            style: ['size07', 'center']
        }, {
            text: `${item.product.code} - ${item.product.name}`,
            style: ['size07', 'left']
        }, {
            text:  parseFloat(item.deliveredQuantity).toLocaleString(locale, numberLocaleOptions),
            style: ['size07', 'center']
        }, {
            text: item.deliveredUom.unit,
            style: ['size07', 'center']
        },
        {
            text: item.remark,
            style: ['size07', 'left']
        }];
    });
    
    tbody = tbody.length > 0 ? tbody : [
        [{
            text: "tidak ada barang",
            style: ['size08', 'center'],
            colSpan: 5
        }, "", "", "", ""]
    ];

    var table = [{
        table: {
				        widths: ['5%', '40%', '20%', '10%', '25%'],
				        headerRows: 1,
				        body: [thead, tbody]
        }
    }];

    var footer = [
        '\n', {
            stack: [{
                text: `Sukoharjo, ${new Date().toLocaleString(locale, dateLocaleOptions)}`,
                alignment: "right"
            },
                '\n', {
                    columns: [{
                        width: '35%',
                        stack: ['Mengetahui\n\n\n\n\n', '(_______________________)'],
                        style: 'center'
                    }, {
                            width: '30%',
                            text: ''
                        }, {
                            width: '35%',
                            stack: ['Menerima\n\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        },]
                }
            ],
            style: ['size08']
        }
    ];

    var dd = {
        pageSize: 'A5',
        pageOrientation: 'portrait',
        pageMargins: 20,
        content: [].concat(header, subHeader, table, footer),
        styles: {
            size06: {
                fontSize: 6
            },
            size07: {
                fontSize: 7
            },
            size08: {
                fontSize: 8
            },
            size09: {
                fontSize: 9
            },
            size10: {
                fontSize: 10
            },
            bold: {
                bold: true
            },
            center: {
                alignment: 'center'
            },
            left: {
                alignment: 'left'
            },
            right: {
                alignment: 'right'
            },
            justify: {
                alignment: 'justify'
            },
            tableHeader: {
                bold: true,
                fontSize: 8,
                color: 'black',
                alignment: 'center'
            }
        }
    };

    return dd;
}