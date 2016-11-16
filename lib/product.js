const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');
const R = require('ramda');
const htmlToText = require('html-to-text');
import _ from "lodash";

export default class Product {
  constructor(html, url) {
    this.html = html;
    this.url = url;
  }

  getResult() {
    if (this.html) return this.parseFields(cheerio.load(this.html));

    const url = this.url;
    var p = new Promise(function(resolve, reject) {
      request(url)
        .then(result => resolve(cheerio.load(result)))
        .catch(reject);
    });
    return p.then(result => {
      return this.parseFields(result)
    });
  }

  parseFields($) {
    let fields = {};
    fields.priceStores = this.getPriceStores($, fields);
    this.getInfoRows($, fields);
    fields.attributes = this.getAttrRows($);
    fields.imageUrl = this.getImageUrl($);
    return R.map((field) => field === '' ? undefined : field, fields);
  }

  getAmount($) {
    const that = this;
    let amount = that.getData($($('#availability .av-col2')[0]).html());
    amount = amount.split(' ')[0];
    amount = amount.replace(',', '');
    return parseInt(amount);
  }

  getInfoRows($, initFields) {
    let fields = initFields;
    let infoRows = [];

    try {
      var that = this;

      $('#product-desc .row').each(function(i, elem) {
        let elemHtml = $(elem).html();
        let title = that.getData($(elem).find('b').html());
        let val = $(elem).find('.col-xs-8').html();
        val = that.getData(val);
        if (title.indexOf('Mouser 零件编号') != -1) fields.sku = val;
        if (title.indexOf('制造商零件编号') != -1) fields.pn = val;
        if (title.indexOf('制造商:') != -1) fields.mfs = val;
        if (title.indexOf('说明：') != -1) {
          fields.category = val;
          fields.description = val;
        }
        if (val.indexOf('pdf') != -1) {
          let pdfUrl = $(elem).find(
            '.col-xs-8').find(
            '#ctl00_ContentMain_rptrCatalogDataSheet_ctl00_lnkCatalogDataSheet'
          ).attr('href');
          var docs = [];
          docs.push(pdfUrl);
          fields.documents = docs;
        }
      });

      fields.amount = that.getAmount($);
    } catch (e) {
      console.error('e:', e.message);
    }
    return fields;
  }

  getImageUrl($) {
    try {
      let that = this;
      let imageUrl = $('.default-img').attr('src').replace('../../../', '');
      imageUrl = 'http://www.mouser.cn/' + imageUrl;
      return imageUrl;
    } catch (e) {
      return;
    }
  }

  getData(htmlString) {
    const data = htmlToText.fromString(htmlString, {
      wordwrap: 130
    });
    return data;
  }

  getArrayData($, selector) {
    const data = htmlToText.fromString($(selector), {
      wordwrap: 130
    });
    return _.split(data, ' ');
  }

  getIndex(data, title) {
    const index = _.findIndex(data, function(o) {
      return o.indexOf(title) != -1;
    });
    return index;
  }

  getValue(value, title) {
    if (value.indexOf(title) != -1) {
      return _.trim(value.substring(title.length + 1));
    }
    return;
  }

  // 規格
  getAttrRows($) {
    let that = this;
    let attrThRows = [];
    let attrTdRows = [];
    let attrs = [];

    $('.specs tr').each(function(i, elem) {
      let obj = {};
      obj.key = that.getData($(elem).find('.leftcol').html());
      obj.value = that.getData($(elem).find('.ProductDetailData').html());
      attrs.push(obj);
    });
    return attrs;
  }

  getPriceStoresAmount($, elem) {
    let that = this;
    let amount = $(elem).find('.PriceBreakQuantity').html().replace(',',
      '');
    amount = parseInt(that.getData(amount));
    return amount;
  }

  getPriceStoresPrice($, elem) {
    let that = this;
    let price = $(elem).find('.PriceBreakPrice').html().substring(1);
    price = that.getData(price);
    return price;
  }

  getCurrency($) {
    let that = this;
    let currency = that.getData($('.tdFlag').parent().text());
    currency = currency.split(' ')[2];
    return currency;
  }

  getPriceStores($, fields) {
    let that = this;
    fields.currency = that.getCurrency($);
    let dollars = $('.PriceBreakQuantity').parent()
    let priceCollection = [];
    dollars.each(function(i, elem) {
      let obj = {};
      obj.amount = that.getPriceStoresAmount($, elem);
      obj.unitPrice = that.getPriceStoresPrice($, elem);
      priceCollection.push(obj);
    });
    $('.catalog-pricing tr').remove();
    return priceCollection;
  }

  validate(opts) {
    return true;
  }

  buildUrl(opts) {
    return opts.url;
  }
}
