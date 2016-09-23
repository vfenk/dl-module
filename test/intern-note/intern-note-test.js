var helper = require("../helper");
var InternNoteManager = require("../../src/managers/intern-note/intern-note-manager");
var instanceManager = null;

require("should");

function getData() {
    var InternNote = require('dl-models').internNote.InternNote;
    var Supplier = require('dl-models').core.Supplier;

    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);
    
    var _supplier = new Supplier({
        code: '123',
        name: 'hot',
        description: 'hotline',
        phone: '0812....',
        address: 'test',
        local: true
    });

    var internNote=new InternNote();

    internNote.NINo=`NI1[${code}]`;
    internNote.NIDate= new Date();
    internNote.InvoiceNo=`Inv[${code}]`;
    internNote.TaxNoteNo=`Tax[${code}]`;
    internNote.SJNo=`SJ1[${code}]`;
    internNote.supplier = _supplier;
    internNote.Items=[];

    return InternNote;
}

before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new InternNoteManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});