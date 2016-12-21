var global = require('../../global');

module.exports = function (productionOrder) {

    var details = [].concat.apply([], productionOrder.details);

    var iso = "FM.7-MK-03-015";

    var locale = global.config.locale; 

    var number=productionOrder.orderNo;

    var spelling=productionOrder.spelling;
    var orderQuantity=productionOrder.orderQuantity;
    var spellOrder=spelling+orderQuantity;

    var moment = require('moment');
    moment.locale(locale.name); 

    var header = [{
        columns: [{
            columns: [{
                width: '*',
                stack: [{
                    text: iso,
                    style: ['size06'],
                    alignment: "right"
                }, {
                        text: 'SURAT ORDER PRODUKSI',
                        style: ['size09'],
                        alignment: "center"
                    }]
            }]

        }]
    }];

   
    var thead = [{
        text: 'Warna yang Diminta',
        style: 'tableHeader'
    }, {
            text: 'Acuan/Color Way',
            style: 'tableHeader'
        }, {
            text: 'Jumlah',
            style: 'tableHeader'
        }];
        
    var tfoot = [[{
        text: 'Total',
        style: 'tableHeader',
        colSpan:2
    }, "", {
            text: productionOrder.orderQuantity +" "+productionOrder.uom.unit,
            style: 'tableHeader'
        }]];

    var tbody = details.map(function (detail, index) {
        return [{
            text: detail.colorRequest ,
            style: ['size07', 'center']
        },{
            text: detail.colorTemplate ,
            style: ['size07', 'center']
        },{
            text: detail.quantity + " "+detail.uom.unit ,
            style: ['size07', 'center']
        } ]
    });

    tbody = tbody.length > 0 ? tbody : [
        [{
            text: "tidak ada detail",
            style: ['size06', 'center'],
            colSpan: 3
        }, "", ""]
    ];

    var table = [{
        table: {
            widths: ['30%', '30%', '40%'],
            headerRows: 1,
            body: [].concat([thead], tbody,tfoot)
        }
    }];

    var body = [
        '\n', {
            stack: [{
                columns: [{
                    width: '55%',
                    columns: [{
                        width: '40%',
                        stack: ['Nomor Order', 'Nama Buyer' , 'Material', 'Konstruksi','Jenis Order','Jumlah Order','Jumlah Order Spelling','Asal Kain Greige', 'Lebar Finish', 'Design', 'Standar Handling', 'RUN', 'Standar Shrinkage', 'Panjang Roll', 'Standar Lampu','Sample', 'Keterangan', 'Tanggal Delivery','Tanggal Order dibuat']
                    }, {
                            width: '3%',
                            stack: [':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':', ':']
                    }, {
                            width: '*',
                            stack:[productionOrder.orderNo, productionOrder.buyer.name, productionOrder.material, productionOrder.construction, productionOrder.orderType, orderQuantity + " " + productionOrder.uom.unit,spellOrder+" " + productionOrder.uom.unit, productionOrder.originGreigeFabric, productionOrder.finishWidth,productionOrder.design, productionOrder.handlingStandard, productionOrder.RUN, productionOrder.shrinkageStandard, productionOrder.rollLength, productionOrder.lampStandard.name, productionOrder.sample, productionOrder.remark, `${moment(productionOrder.deliveryDate).format(locale.date.format)}`, `${moment(productionOrder._updatedDate).format(locale.date.format)}`]
                        }]
                },
                {
                    width:'*',
                    stack:[table]
                }]
            }
            ],
            style: ['size08']
        }, '\n'
    ];

    var thead2 = [{
        text: 'DIBUAT OLEH',
        style: 'tableHeader'
    }, {
            text: 'MENGETAHUI',
            style: 'tableHeader'
        }, {
            text: 'MENYETUJUI',
            style: 'tableHeader',
            colSpan:2
        },""];
        
    var tfoot2 = [[{
        text: 'PENJUALAN',
        style: 'tableHeader'
    }, {
            text: 'KABAG PENJUALAN',
            style: 'tableHeader'
        }, {
            text: 'KABAG F/P',
            style: 'tableHeader'
        },{
            text: 'PPIC F/P',
            style: 'tableHeader'
        }]];

    var tbody2 = [[{
        text: " ",
        style: ['size30', 'center']
    }, "", "",""]];

    var table2 = [{
        table: {
            widths: ['25%', '25%', '25%', '25%'],
            headerRows: 1,
            body: [].concat([thead2], tbody2,tfoot2)
        }
    }];
    var pr = {
        pageSize: 'A5',
        pageOrientation: 'portrait',
        pageMargins: 20,
        content: [].concat(header,body,table2),
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
            size30: {
                fontSize: 30
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

    return pr;
}