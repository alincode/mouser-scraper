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
    fields.documents = this.getDocuments($);
    return R.map((field) => field === '' ? undefined : field, fields);
  }

  getLead(val) {
    return val.indexOf('无铅') > -1
  }

  getRohs(val) {
    return val.indexOf('符合限制有害物质指令(RoHS)规范要求') > -1
  }

  getAmount(val) {
    return parseInt(val.split(' ')[val.split(' ').length - 1].replace(',', ''));
  }

  getInfoRows($, initFields) {
    let fields = initFields;
    let infoRows = [];

    try {
      var that = this;
      $('#pricingTable tr').each(function(i, elem) {
        if (i == 0) return;
        let elemHtml = $(elem).html();
        let val = $(elem).find('td').html();
        val = that.getData(val);
        if (i == 1) fields.sku = val;
        if (i == 2) fields.amount = that.getAmount(val);
        if (i == 3) fields.mfs = val;
        if (i == 4) fields.pn = val;
        if (i == 5) fields.description = val;
        if (i == 6) {
          fields.lead = that.getLead(val);
          fields.rohs = that.getRohs(val);
        }
      });
    } catch (e) {
      console.error('e:', e.message);
    }
    return fields;
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

  getDocuments($) {
    let that = this;
    let docRows = [];
    let docs = [];

    $('#DocumentsTable1 td').each(function(i, elem) {
      docRows[i] = that.getData($(this).html());
    });
    _.forEach(docRows, function(value, key) {
      if (value.indexOf('//') > -1) {
        let newValue = _.replace(value.split('//')[1], ']', '');
        docs.push(newValue);
      }
    });
    return docs;
  }

  getAttrRows($) {
    let that = this;
    let attrThRows = [];
    let attrTdRows = [];
    let attrs = [];

    $('#DatasheetsTable1 th').each(function(i, elem) {
      attrThRows[i] = that.getData($(this).html());
      attrThRows[i] = attrThRows[i].split('?')[0];
    });

    $('#DatasheetsTable1 td').each(function(i, elem) {
      attrTdRows[i] = that.getData($(this).html());
    });

    _.forEach(attrThRows, function(value, index) {
      let obj = {};
      obj.key = value;
      obj.value = attrTdRows[index];
      attrs.push(obj);
    });
    return attrs;
  }

  getPriceStores($, initFields) {
    let that = this;
    let dollars = $('.catalog-pricing tr');
    let priceCollection = [];
    $('.catalog-pricing tr').each(function(i, elem) {
      let obj = {};
      $(elem).find('td').each(function(i, subelem) {
        let val = $(subelem).html();
        if (i == 0) obj.amount = parseInt(val.replace(',', ''));
        if (i == 1) obj.unitPrice = val.substring(7);
        if (i == 2) priceCollection.push(obj);
      });
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
