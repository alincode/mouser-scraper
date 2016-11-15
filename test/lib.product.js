import fs from 'fs';
import path from 'path';

import {
  ProductFields
}
from './field';

var GrabStrategy = require('../lib/product').default;

function checklist(result) {
  result.should.have.keys(ProductFields);
  result.sku.should.be.a('string');
  result.amount.should.be.a('number');
  result.mfs.should.be.a('string');
  result.pn.should.be.a('string');
  result.description.should.be.a('string');
  // result.lead.should.be.a('boolean');
  // result.rohs.should.be.a('boolean');
  result.attributes.should.be.a('array');
  result.attributes.length.should.above(0);
  result.attributes[0].should.have.keys(['key', 'value']);
  result.documents.should.be.a('array');
  result.documents.length.should.above(0);
  result.priceStores.should.be.a('array');
  result.priceStores.length.should.above(0);
  result.priceStores[0].should.have.keys(['amount', 'unitPrice']);
  result.priceStores[0].amount.should.be.a('number');
}

function getHtml(fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path.join(__dirname, fileName), function(err, data) {
      if (err) return console.log(err);
      resolve(data.toString());
    })
  });
}

describe('product page', function() {
  it('case 1', async(done) => {
    try {
      let html = await getHtml(
        'sample.html'
      );
      let grabStrategy = new GrabStrategy(html,
        'http://www.mouser.cn/ProductDetail/Cree-Inc/XPEBRY-L1-0000-00S01/?qs=sGAEpiMZZMurHQmwyojo5NcGAOXvaz%252bjSO1mEKF%252bViaGhKf2J%252bdy5Q%3d%3d'
      );
      let result = await grabStrategy.getResult();
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('case 2', async(done) => {
    try {
      let html = await getHtml(
        'sample.html'
      );
      let grabStrategy = new GrabStrategy(html,
        'http://www.mouser.cn/ProductDetail/Fairchild-Semiconductor/FL77904MX/?qs=sGAEpiMZZMt82OzCyDsLFOSVHEbI1IbejkmDxCbcrM4%3d'
      );
      let result = await grabStrategy.getResult();
      checklist(result);
      done();
    } catch (e) {
      done(e);
    }
  });
});
