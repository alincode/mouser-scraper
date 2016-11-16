'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('./utils/request');
var memoize = require('./utils/memoize');
var cheerio = require('cheerio');
var R = require('ramda');
var htmlToText = require('html-to-text');

var Product = function () {
  function Product(html, url) {
    _classCallCheck(this, Product);

    this.html = html;
    this.url = url;
  }

  _createClass(Product, [{
    key: 'getResult',
    value: function getResult() {
      var _this = this;

      if (this.html) return this.parseFields(cheerio.load(this.html));

      var url = this.url;
      var p = new Promise(function (resolve, reject) {
        request(url).then(function (result) {
          return resolve(cheerio.load(result));
        }).catch(reject);
      });
      return p.then(function (result) {
        return _this.parseFields(result);
      });
    }
  }, {
    key: 'parseFields',
    value: function parseFields($) {
      var fields = {};
      fields.priceStores = this.getPriceStores($, fields);
      this.getInfoRows($, fields);
      fields.attributes = this.getAttrRows($);
      fields.imageUrl = this.getImageUrl($);
      return R.map(function (field) {
        return field === '' ? undefined : field;
      }, fields);
    }
  }, {
    key: 'getAmount',
    value: function getAmount($) {
      var that = this;
      var amount = that.getData($($('#availability .av-col2')[0]).html());
      amount = amount.split(' ')[0];
      amount = amount.replace(',', '');
      return parseInt(amount);
    }
  }, {
    key: 'getInfoRows',
    value: function getInfoRows($, initFields) {
      var fields = initFields;
      var infoRows = [];

      try {
        var that = this;

        $('#product-desc .row').each(function (i, elem) {
          var elemHtml = $(elem).html();
          var title = that.getData($(elem).find('b').html());
          var val = $(elem).find('.col-xs-8').html();
          val = that.getData(val);
          if (title.indexOf('Mouser 零件编号') != -1) fields.sku = val;
          if (title.indexOf('制造商零件编号') != -1) fields.pn = val;
          if (title.indexOf('制造商:') != -1) fields.mfs = val;
          if (title.indexOf('说明：') != -1) {
            fields.category = val;
            fields.description = val;
          }
          if (val.indexOf('pdf') != -1) {
            var pdfUrl = $(elem).find('.col-xs-8').find('#ctl00_ContentMain_rptrCatalogDataSheet_ctl00_lnkCatalogDataSheet').attr('href');
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
  }, {
    key: 'getImageUrl',
    value: function getImageUrl($) {
      try {
        var that = this;
        var imageUrl = $('.default-img').attr('src').replace('../../../', '');
        imageUrl = 'http://www.mouser.cn/' + imageUrl;
        return imageUrl;
      } catch (e) {
        return;
      }
    }
  }, {
    key: 'getData',
    value: function getData(htmlString) {
      var data = htmlToText.fromString(htmlString, {
        wordwrap: 130
      });
      return data;
    }
  }, {
    key: 'getArrayData',
    value: function getArrayData($, selector) {
      var data = htmlToText.fromString($(selector), {
        wordwrap: 130
      });
      return _lodash2.default.split(data, ' ');
    }
  }, {
    key: 'getIndex',
    value: function getIndex(data, title) {
      var index = _lodash2.default.findIndex(data, function (o) {
        return o.indexOf(title) != -1;
      });
      return index;
    }
  }, {
    key: 'getValue',
    value: function getValue(value, title) {
      if (value.indexOf(title) != -1) {
        return _lodash2.default.trim(value.substring(title.length + 1));
      }
      return;
    }

    // 規格

  }, {
    key: 'getAttrRows',
    value: function getAttrRows($) {
      var that = this;
      var attrThRows = [];
      var attrTdRows = [];
      var attrs = [];

      $('.specs tr').each(function (i, elem) {
        var obj = {};
        obj.key = that.getData($(elem).find('.leftcol').html());
        obj.value = that.getData($(elem).find('.ProductDetailData').html());
        attrs.push(obj);
      });
      return attrs;
    }
  }, {
    key: 'getPriceStoresAmount',
    value: function getPriceStoresAmount($, elem) {
      var that = this;
      var amount = $(elem).find('.PriceBreakQuantity').html().replace(',', '');
      amount = parseInt(that.getData(amount));
      return amount;
    }
  }, {
    key: 'getPriceStoresPrice',
    value: function getPriceStoresPrice($, elem) {
      var that = this;
      var price = $(elem).find('.PriceBreakPrice').html().substring(1);
      price = that.getData(price);
      return price;
    }
  }, {
    key: 'getCurrency',
    value: function getCurrency($) {
      var that = this;
      var currency = that.getData($('.tdFlag').parent().text());
      currency = currency.split(' ')[2];
      return currency;
    }
  }, {
    key: 'getPriceStores',
    value: function getPriceStores($, fields) {
      var that = this;
      fields.currency = that.getCurrency($);
      var dollars = $('.PriceBreakQuantity').parent();
      var priceCollection = [];
      dollars.each(function (i, elem) {
        var obj = {};
        obj.amount = that.getPriceStoresAmount($, elem);
        obj.unitPrice = that.getPriceStoresPrice($, elem);
        priceCollection.push(obj);
      });
      $('.catalog-pricing tr').remove();
      return priceCollection;
    }
  }, {
    key: 'validate',
    value: function validate(opts) {
      return true;
    }
  }, {
    key: 'buildUrl',
    value: function buildUrl(opts) {
      return opts.url;
    }
  }]);

  return Product;
}();

exports.default = Product;