module.exports = function (unitPaymentOrder) {

    var items = [].concat.apply([], unitPaymentOrder.items);

    var iso = "FM-6.00-06-012/R2";
    var number = unitPaymentOrder.no;

    var locale = 'id-ID';
    var dateLocaleOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var dateFormat = "DD-MMMM-YYYY";

    var moment = require('moment');
    moment.locale(locale);
    
    
    var numberLocaleOptions = {
        style: 'decimal',
        maximumFractionDigits: 4
    };
    
 var header =  [{ columns: [
            {
                width: '70%',
                columns: [{
                    width: '55%',
                    stack:  [{
                    text: '"DANLIRIS"',
                    style: ['size20', 'bold']
                     }, {
                        text: 'INDUSTRIAL & TRADING CO.LTD.',  
                        style: ['size08']
                    },{
                        text: 'Kel. Banaran Kec. Grogol Kab. Sukoharjo',  
                        style: ['size08']
                    },
                    {
                        text: 'Telp. (0271) 714400',  
                        style: ['size08']
                    }]
                }, {
                        width: '30%',
                        stack: ['NOTA KREDIT']
                    },  ],
                style: ['size20', "bold"]

            }, 
            {
                width: '60%',
                columns: [{
                    width: '60%',
                    stack: [ {
                        alignment: "left",
                        text: "FM-6.00-06-012/R2",
                        style: ['size08']
                    }, {
                            alignment: "left",
                            text: 'SUKOHARJO, 18 Juli 2016',
                            style: ['size09']
                        },{
                            alignment: "left",
                            text: '(W066) WAJA TEHNIK',
                            style: ['size09']
                        },{
                            alignment: "left",
                            text: 'SUKAHARJO',
                            style: ['size09']
                        }
                        ]
                }],
                style: ['size08']
            }
        ]
    }, '\n'] 
    
    var subHeader = [{
        columns: [
            {
                width: '100%',
                columns: [{
                    width: '70%',
                    stack: [{
                        text: 'Nota Pembelian BAHAN LAIN-LAIN',  
                        style: ['size08', "underline"]
                    },
                    {
                        text: 'Kreaditur : C6  Untuk: (K) Bagian Weaving III',  
                        style: ['size08']
                    }]
                    
                }],
                style: ['size09'] 
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
            text: 'Banyak',
            style: 'tableHeader'
        }, {
            text: 'Keterangan',
            style: 'tableHeader'
        }, {
            text: 'Harga',
            style: 'tableHeader'
        }, {
            text: 'Jumlah',
            style: 'tableHeader'
        },
         {
            text: 'Nomor Order',
            style: 'tableHeader'
        }];
  
    
    var tbody = items.map(function(item, index) {
        return [{
                    text: (index+1).toString() || '',
                    style: ['size07', 'center']
                },{
                    text: '8',
                    style: ['size07', 'left']
                },  {
                    text: unitPaymentOrder.remark || '',
                    style: ['size07', 'left']
                },{
                    text: parseFloat(1000).toLocaleString(locale, numberLocaleOptions),
                    style: ['size07', 'center']
                }, {
                    text: 'jumlah',
                    style: ['size07', 'center']
                }, {
                    text:  'order',
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
            widths: ['5%', '10%','20%', '15%', '15%', '25%'],
            headerRows: 1,
            body: [].concat([thead],tbody)
        }
    }];

    var closing = [
        '\n', {
            stack: [  {
                    columns: [{
                            width: '25%',
                            stack: ['Diperiksa,\nVerifikasi\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        }, {
                            width: '25%',
                            stack: ['Mengetahui,\nPimpinan Bagian\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        }, {
                            width: '25%',
                            stack: ['Tanda Terima,\nBagian Pembelian\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        },
                        {
                            width: '25%',
                            stack: ['Dibuat Oleh,\n\n\n\n\n', '(______'+this.user.username+'________)'],
                            style: 'center'
                        }]
                }
            ],
            style: ['size08']
        }
    ];

     var footer = [
        '\n', {
            stack: [  {
                    columns: [{
                            width: '25%',
                            stack: ['Diperiksa,\nVerifikasi\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        }, {
                            width: '25%',
                            stack: ['Mengetahui,\nPimpinan Bagian\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        }, {
                            width: '25%',
                            stack: ['Tanda Terima,\nBagian Pembelian\n\n\n\n', '(_______________________)'],
                            style: 'center'
                        },
                        {
                            width: '25%',
                            stack: ['Dibuat Oleh,\n\n\n\n\n', '(______'+this.user.username+'________)'],
                            style: 'center'
                        }]
                }
            ],
            style: ['size08']
        }
    ];

    var dd = {
        pageSize: 'A5',
        pageOrientation: 'portrait',
        pageMargins: 20,
        content: [].concat(header, line, subHeader, table, closing, footer),
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
            size15: {
                fontSize: 15
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