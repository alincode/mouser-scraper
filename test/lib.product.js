import {
  ProductFields
}
from './field';

var Digikey = require('../lib/product').default;

function checklist(result) {
  result.should.have.keys(ProductFields);
  result.sku.should.String;
  result.amount.should.Number;
  result.mfs.should.String;
  result.pn.should.String;
  result.description.should.String;
  result.lead.should.Boolean;
  result.rohs.should.Boolean;
  result.attributes.should.Array;
  result.attributes.length.should.above(0);
  result.attributes[0].should.have.keys(['key', 'value']);
  result.documents.should.Array;
  result.documents.length.should.above(0);
  result.priceStores.should.Array;
  result.priceStores.length.should.above(0);
  result.priceStores[0].should.have.keys(['amount', 'unitPrice']);
}

describe('product page', function() {
  it('case 1', async(done) => {
    try {
      let digikey = new Digikey(null,
        'http://www.digikey.tw/product-detail/zh/comchip-technology/ZENER-KIT/641-1426-ND/2217259'
      );
      let result = await digikey.getResult();
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('case 2', async(done) => {
    try {
      let digikey = new Digikey(null,
        'http://www.digikey.tw/product-detail/zh/m-a-com-technology-solutions/MADP-011069-SAMKIT/1465-1784-ND/6003062'
      );
      let result = await digikey.getResult();
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('case 3', async(done) => {
    try {
      let digikey = new Digikey(null,
        'http://www.digikey.tw/product-detail/zh/tpi-test-products-int/120085/290-1925-ND/1832239'
      );
      let result = await digikey.getResult();
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('case 4', async(done) => {
    try {
      let digikey = new Digikey(null,
        'http://www.digikey.tw/product-detail/zh/comchip-technology/ZENER-KIT/641-1426-ND/2217259'
      );
      let result = await digikey.getResult();
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });
});
