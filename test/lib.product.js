import {
  ProductFields
}
from './field';

var Digikey = require('../dist/product').default;

describe('product page', function() {
  it('case 1', async(done) => {
    let digikey = new Digikey('http://www.digikey.tw/product-detail/zh/comchip-technology/ZENER-KIT/641-1426-ND/2217259');
    digikey.getResult().then(
      function (result) {
        console.log("==========> result:", result);
        // result.should.have.keys(ProductFields);
        done();
      },
      function (err) {
        done(err);
      }
    );
  });

  it('case 2', async(done) => {
    let digikey = new Digikey('http://www.digikey.tw/product-detail/zh/m-a-com-technology-solutions/MADP-011069-SAMKIT/1465-1784-ND/6003062');
    digikey.getResult().then(
      function (result) {
        console.log("==========> result:", result);
        // result.should.have.keys(ProductFields);
        done();
      },
      function (err) {
        done(err);
      }
    );
  });

  it('case 3', async(done) => {
    let digikey = new Digikey('http://www.digikey.tw/product-detail/zh/tpi-test-products-int/120085/290-1925-ND/1832239');
    digikey.getResult().then(
      function (result) {
        console.log("==========> result:", result);
        // result.should.have.keys(ProductFields);
        done();
      },
      function (err) {
        done(err);
      }
    );
  });
});
