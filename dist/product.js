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
      this.getInfoRows($, fields);
      fields.attributes = this.getAttrRows($);
      fields.documents = this.getDocuments($);
      fields.priceStores = this.getPriceStores($, fields);
      return R.map(function (field) {
        return field === '' ? undefined : field;
      }, fields);
    }
  }, {
    key: 'getLead',
    value: function getLead(val) {
      return val.indexOf('無鉛' > -1);
    }
  }, {
    key: 'getRohs',
    value: function getRohs(val) {
      return val.indexOf('符合 RoHS 指令' > -1);
    }
  }, {
    key: 'getInfoRows',
    value: function getInfoRows($, initFields) {
      var fields = initFields;
      var infoRows = [];

      try {
        var that = this;
        $('#product-details-side tr').each(function (i, elem) {
          var elemHtml = $(elem).html();
          infoRows[i] = that.getData(elemHtml);
        });

        _lodash2.default.forEach(infoRows, function (value, key) {
          if (that.getValue(value, 'Digi-Key零件編號')) {
            fields.sku = that.getValue(value, 'Digi-Key零件編號');
          } else if (that.getValue(value, '現有數量')) {
            fields.amount = that.getValue(value, '現有數量');
            if (!_lodash2.default.isNumber(fields.amount)) fields.amount = fields.amount.split(' ')[0];
          } else if (that.getValue(value, '製造商 ')) {
            fields.mfs = that.getValue(value, '製造商');
          } else if (that.getValue(value, '製造商零件編號')) {
            fields.pn = that.getValue(value, '製造商零件編號');
          } else if (that.getValue(value, '說明 ')) {
            fields.description = that.getValue(value, '說明');
          } else if (that.getValue(value, '無鉛狀態 / RoHS 指令狀態')) {
            var val = that.getValue(value, '無鉛狀態 / RoHS 指令狀態');
            fields.lead = that.getLead(val);
            fields.rohs = that.getRohs(val);
          } else {}
        });
      } catch (e) {
        console.error('e:', e.message);
      }
      return fields;
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

      $('.leftdivs .attributes-table-main td').each(function (i, elem) {
        docRows[i] = that.getData($(this).html());
      });
      _lodash2.default.forEach(docRows, function (value, key) {
        if (value.indexOf('//') > -1) {
          var newValue = _lodash2.default.replace(value.split('//')[1], ']', '');
          docs.push(newValue);
        }
      });
      return docs;
    }
  }, {
    key: 'getAttrRows',
    value: function getAttrRows($) {
      var that = this;
      var attrThRows = [];
      var attrTdRows = [];
      var attrs = [];

      $('#prod-att-title-row').remove();

      $('.prod-attributes .attributes-td-checkbox').each(function (i, elem) {
        $(elem).remove();
      });

      $('.prod-attributes th').each(function (i, elem) {
        attrThRows[i] = that.getData($(this).html());
        attrThRows[i] = attrThRows[i].split('?')[0];
      });

      $('.prod-attributes td').each(function (i, elem) {
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
      var dollars = this.getArrayData($, '#product-dollars');
      var priceCollection = [];
      for (var i = 3; i < dollars.length; i = i + 3) {
        var obj = {};
        priceCollection.push(that.getPriceItem(dollars, i));
      }
      return priceCollection;
    }
  }, {
    key: 'getPriceItem',
    value: function getPriceItem(dollars, i) {
      var obj = {};
      obj.amount = dollars[i];
      obj.unitPrice = dollars[i + 1];
      return obj;
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