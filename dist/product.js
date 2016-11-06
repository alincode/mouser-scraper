'use strict';

var product = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(opts) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              var url = buildUrl(opts);
              request(url, opts.throttle).then(cheerio.load).then(parseFields).then(function (app) {
                app.url = url;
                resolve(app);
              }).catch(reject);
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function product(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var request = require('./utils/request');
var memoize = require('./utils/memoize');
var cheerio = require('cheerio');
var R = require('ramda');
var htmlToText = require('html-to-text');

function getData(htmlString) {
  var data = htmlToText.fromString(htmlString, {
    wordwrap: 130
  });
  return data;
}

function getArrayData($, selector) {
  var data = htmlToText.fromString($(selector), {
    wordwrap: 130
  });
  return _.split(data, ' ');
}

function getIndex(data, title) {
  var index = _.findIndex(data, function (o) {
    return o.indexOf(title) != -1;
  });
  return index;
}

function getValue(value, title) {
  if (value.indexOf(title) != -1) {
    return value.substring(title.length + 1);
  }
  return;
}

function getInfoRows($, initFields) {
  var fields = initFields;
  var infoRows = [];

  $('#product-details-side tr').each(function (i, elem) {
    infoRows[i] = getData($(this).html());
  });

  _.forEach(infoRows, function (value, key) {
    if (getValue(value, 'Digi-Key零件編號')) {
      fields.sku = getValue(value, 'Digi-Key零件編號');
    } else if (getValue(value, '現有數量')) {
      fields.amount = getValue(value, '現有數量');
      if (!_.isNumber(fields.amount)) fields.amount = fields.amount.split(' ')[0];
    } else if (getValue(value, '製造商 ')) {
      fields.mfs = getValue(value, '製造商');
    } else if (getValue(value, '製造商零件編號')) {
      fields.pn = getValue(value, '製造商零件編號');
    } else if (getValue(value, '說明 ')) {
      fields.desc = getValue(value, '說明');
    } else if (getValue(value, '無鉛狀態 / RoHS 指令狀態')) {
      fields.leadAndRohs = getValue(value, '無鉛狀態 / RoHS 指令狀態');
    } else {}
  });
  return fields;
}

function getDocRows($) {
  var docRows = [];
  var docs = [];

  $('.leftdivs .attributes-table-main td').each(function (i, elem) {
    docRows[i] = getData($(this).html());
  });
  _.forEach(docRows, function (value, key) {
    if (value.length > 15 && value.length < 100) {
      var newValue = _.replace(value.split('//')[1], ']', '');
      docs.push(newValue);
    }
  });
  return docs;
}

function getAttrRows($) {
  var attrThRows = [];
  var attrTdRows = [];
  var attrs = [];

  $('#prod-att-title-row').remove();

  $('.prod-attributes .attributes-td-checkbox').each(function (i, elem) {
    $(elem).remove();
  });

  $('.prod-attributes th').each(function (i, elem) {
    attrThRows[i] = getData($(this).html());
    attrThRows[i] = attrThRows[i].split('?')[0];
  });

  $('.prod-attributes td').each(function (i, elem) {
    attrTdRows[i] = getData($(this).html());
  });

  _.forEach(attrThRows, function (value, index) {
    var obj = {};
    obj.key = value;
    obj.value = attrTdRows[index];
    attrs.push(obj);
  });
  return attrs;
}

function getPriceList($, initFields) {
  var dollars = getArrayData($, '#product-dollars');
  var priceCollection = [];
  for (var i = 3; i < dollars.length; i = i + 3) {
    var obj = {};
    obj.amount = dollars[i];
    obj.unitPrice = dollars[i + 1];
    priceCollection.push(obj);
  }
  return priceCollection;
}

function parseFields($) {
  var fields = {};
  getInfoRows($, fields);
  fields.attrs = getAttrRows($);
  fields.docs = getDocRows($);
  fields.prices = getPriceList($, fields);
  return R.map(function (field) {
    return field === '' ? undefined : field;
  }, fields);
}

function validate(opts) {
  return true;
}

function buildUrl(opts) {
  return opts.url;
}

module.exports = memoize(product);