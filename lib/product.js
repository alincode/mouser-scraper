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
    this.getInfoRows($, fields);
    fields.attributes = this.getAttrRows($);
    fields.documents = this.getDocuments($);
    fields.priceStores = this.getPriceStores($, fields);
    return R.map((field) => field === '' ? undefined : field, fields);
  }

  getLead(val) {
    return val.indexOf('無鉛' > -1)
  }

  getRohs(val) {
    return val.indexOf('符合 RoHS 指令' > -1)
  }

  getInfoRows($, initFields) {
    let fields = initFields;
    let infoRows = [];

    try {
      var that = this;
      $('#product-details-side tr').each(function(i, elem) {
        let elemHtml = $(elem).html();
        infoRows[i] = that.getData(elemHtml);
      });

      _.forEach(infoRows, function(value, key) {
        if (that.getValue(value, 'Digi-Key零件編號')) {
          fields.sku = that.getValue(value, 'Digi-Key零件編號');
        } else if (that.getValue(value, '現有數量')) {
          fields.amount = that.getValue(value, '現有數量');
          if (!_.isNumber(fields.amount))
            fields.amount = fields.amount.split(' ')[0];
        } else if (that.getValue(value, '製造商 ')) {
          fields.mfs = that.getValue(value, '製造商');
        } else if (that.getValue(value, '製造商零件編號')) {
          fields.pn = that.getValue(value, '製造商零件編號');
        } else if (that.getValue(value, '說明 ')) {
          fields.description = that.getValue(value, '說明');
        } else if (that.getValue(value, '無鉛狀態 / RoHS 指令狀態')) {
          let val = that.getValue(value, '無鉛狀態 / RoHS 指令狀態');
          fields.lead = that.getLead(val);
          fields.rohs = that.getRohs(val);
        } else {

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

    $('.leftdivs .attributes-table-main td').each(function(i, elem) {
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

    $('#prod-att-title-row').remove();

    $('.prod-attributes .attributes-td-checkbox').each(function(i, elem) {
      $(elem).remove();
    });

    $('.prod-attributes th').each(function(i, elem) {
      attrThRows[i] = that.getData($(this).html());
      attrThRows[i] = attrThRows[i].split('?')[0];
    });

    $('.prod-attributes td').each(function(i, elem) {
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
    let dollars = this.getArrayData($, '#product-dollars');
    let priceCollection = [];
    for (let i = 3; i < dollars.length; i = i + 3) {
      let obj = {};
      priceCollection.push(getPriceItem(dollars, i));
    }
    return priceCollection;
  }

  getPriceItem(dollars, i) {
    let obj = {};
    obj.amount = dollars[i];
    obj.unitPrice = dollars[i + 1];
    return obj;
  }

  validate(opts) {
    return true;
  }

  buildUrl(opts) {
    return opts.url;
  }
}
