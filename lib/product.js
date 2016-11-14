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
    this.getSubInfoRows($, fields);
    fields.attributes = this.getAttrRows($);
    fields.documents = this.getDocuments($);
    fields.imageUrl = this.getImageUrl($);
    return R.map((field) => field === '' ? undefined : field, fields);
  }

  getLead(val) {
    return val.indexOf('无铅') > -1
  }

  getRohs(val) {
    return val.indexOf('符合限制有害物质指令(RoHS)规范要求') > -1
  }

  getAmount(val) {
    const that = this;
    let amount = that.getData((val.split('可立即发货')[0]).split(':')[1]);
    amount = amount.replace(',', '');
    return parseInt(amount);
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

  // 一般訊息
  getSubInfoRows($, initFields) {
    let fields = initFields;
    let infoRows = [];

    try {
      var that = this;
      $('#DatasheetsTable1 tr').each(function(i, elem) {
        if (i == 0) return;
        let elemHtml = $(elem).html();
        let title = $(elem).find('th').html();
        let val = $(elem).find('td').html();
        title = that.getData(title);
        val = that.getData(val);
        let isExistPkg = title.indexOf('标准包装') != -1;
        if (isExistPkg) fields.pkg = val;
        if (title.indexOf('包装') != -1 && !isExistPkg) {
          fields.pkg_type = val;
        }
        if (title == '类别') fields.category = val;
        if (title == '其它名称') fields.param = val;
      });
    } catch (e) {
      console.error('e:', e.message);
    }
    return fields;
  }

  getImageUrl($) {
    try {
      var that = this;
      return $('.beablock-image img').attr('src');
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

  getDocuments($) {
    let that = this;
    let docRows = [];
    let docs = [];
    let docUrl = $('.lnkDatasheet').attr('href');
    docs.push(docUrl);
    return docs;
  }

  // 規格
  getAttrRows($) {
    let that = this;
    let attrThRows = [];
    let attrTdRows = [];
    let attrs = [];

    $('#SpecificationTable th').each(function(i, elem) {
      attrThRows[i] = that.getData($(this).html());
      attrThRows[i] = attrThRows[i].split('?')[0];
    });

    $('#SpecificationTable td').each(function(i, elem) {
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
