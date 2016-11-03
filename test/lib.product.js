import {
  ProductFields
}
from './field';
const digikey = require('../index');

describe('product page', function() {
  it('case 1', async(done) => {
    try {
      let result = await digikey.product({
        url: 'http://www.digikey.tw/product-detail/zh/comchip-technology/ZENER-KIT/641-1426-ND/2217259'
      });
      result.should.have.keys(ProductFields);
      done();
    } catch (e) {
      throw e;
    }
  });

  it('case 2', async(done) => {
    try {
      let result = await digikey.product({
        url: 'http://www.digikey.tw/product-detail/zh/m-a-com-technology-solutions/MADP-011069-SAMKIT/1465-1784-ND/6003062'
      });
      result.should.have.keys(ProductFields);
      done();
    } catch (e) {
      throw e;
    }
  });

  it('case 3', async(done) => {
    try {
      let result = await digikey.product({
        url: 'http://www.digikey.tw/product-detail/zh/tpi-test-products-int/120085/290-1925-ND/1832239'
      });
      result.should.have.keys(ProductFields);
      done();
    } catch (e) {
      throw e;
    }
  });
});
