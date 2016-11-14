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
      this.getSubInfoRows($, fields);
      fields.attributes = this.getAttrRows($);
      fields.documents = this.getDocuments($);
      fields.imageUrl = this.getImageUrl($);
      return R.map(function (field) {
        return field === '' ? undefined : field;
      }, fields);
    }
  }, {
    key: 'getLead',
    value: function getLead(val) {
      return val.indexOf('无铅') > -1;
    }
  }, {
    key: 'getRohs',
    value: function getRohs(val) {
      return val.indexOf('符合限制有害物质指令(RoHS)规范要求') > -1;
    }
  }, {
    key: 'getAmount',
    value: function getAmount(val) {
      var that = this;
      var amount = that.getData(val.split('可立即发货')[0].split(':')[1]);
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
        $('#pricingTable tr').each(function (i, elem) {
          if (i == 0) return;
          var elemHtml = $(elem).html();
          var val = $(elem).find('td').html();
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

  }, {
    key: 'getSubInfoRows',
    value: function getSubInfoRows($, initFields) {
      var fields = initFields;
      var infoRows = [];

      try {
        var that = this;
        $('#DatasheetsTable1 tr').each(function (i, elem) {
          if (i == 0) return;
          var elemHtml = $(elem).html();
          var title = $(elem).find('th').html();
          var val = $(elem).find('td').html();
          title = that.getData(title);
          val = that.getData(val);
          var isExistPkg = title.indexOf('标准包装') != -1;
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
  }, {
    key: 'getImageUrl',
    value: function getImageUrl($) {
      try {
        var that = this;
        return $('.beablock-image img').attr('src');
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
  }, {
    key: 'getDocuments',
    value: function getDocuments($) {
      var that = this;
      var docRows = [];
      var docs = [];
      var docUrl = $('.lnkDatasheet').attr('href');
      docs.push(docUrl);
      return docs;
    }

    // 規格

  }, {
    key: 'getAttrRows',
    value: function getAttrRows($) {
      var that = this;
      var attrThRows = [];
      var attrTdRows = [];
      var attrs = [];

      $('#SpecificationTable th').each(function (i, elem) {
        attrThRows[i] = that.getData($(this).html());
        attrThRows[i] = attrThRows[i].split('?')[0];
      });

      $('#SpecificationTable td').each(function (i, elem) {
        attrTdRows[i] = that.getData($(this).html());
      });

      _lodash2.default.forEach(attrThRows, function (value, index) {
        var obj = {};
        obj.key = value;
        obj.value = attrTdRows[index];
        attrs.push(obj);
      });
      return attrs;
    }
  }, {
    key: 'getPriceStores',
    value: function getPriceStores($, initFields) {
      var that = this;
      var dollars = $('.catalog-pricing tr');
      var priceCollection = [];
      $('.catalog-pricing tr').each(function (i, elem) {
        var obj = {};
        $(elem).find('td').each(function (i, subelem) {
          var val = $(subelem).html();
          if (i == 0) obj.amount = parseInt(val.replace(',', ''));
          if (i == 1) obj.unitPrice = val.substring(7);
          if (i == 2) priceCollection.push(obj);
        });
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