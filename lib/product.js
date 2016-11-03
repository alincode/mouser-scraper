const request = require('./utils/request');
const memoize = require('./utils/memoize');
const cheerio = require('cheerio');
const R = require('ramda');
const htmlToText = require('html-to-text');

async function product(opts) {
  return new Promise(function(resolve, reject) {
    const url = buildUrl(opts);
    request(url, opts.throttle)
      .then(cheerio.load)
      .then(parseFields)
      .then(function(app) {
        app.url = url;
        resolve(app);
      })
      .catch(reject);
  });
}

function getData(htmlString) {
  const data = htmlToText.fromString(htmlString, {
    wordwrap: 130
  });
  return data;
}


function getArrayData($, selector) {
  const data = htmlToText.fromString($(selector), {
    wordwrap: 130
  });
  return _.split(data, ' ');
}

function getIndex(data, title) {
  const index = _.findIndex(data, function(o) {
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
  let fields = initFields;
  let infoRows = [];

  $('#product-details-side tr').each(function(i, elem) {
    infoRows[i] = getData($(this).html());
  });

  _.forEach(infoRows, function(value, key) {
    if (getValue(value, 'Digi-Key零件編號')) {
      fields.sku = getValue(value, 'Digi-Key零件編號');
    } else if (getValue(value, '現有數量')) {
      fields.amount = getValue(value, '現有數量');
      if (!_.isNumber(fields.amount))
        fields.amount = fields.amount.split(' ')[0];
    } else if (getValue(value, '製造商 ')) {
      fields.mfs = getValue(value, '製造商');
    } else if (getValue(value, '製造商零件編號')) {
      fields.pn = getValue(value, '製造商零件編號');
    } else if (getValue(value, '說明 ')) {
      fields.desc = getValue(value, '說明');
    } else if (getValue(value, '無鉛狀態 / RoHS 指令狀態')) {
      fields.leadAndRohs = getValue(value, '無鉛狀態 / RoHS 指令狀態');
    } else {

    }
  });
  return fields;
}

function getDocRows($) {
  let docRows = [];
  let docs = [];

  $('.leftdivs .attributes-table-main td').each(function(i, elem) {
    docRows[i] = getData($(this).html());
  });
  _.forEach(docRows, function(value, key) {
    if (value.length > 15 && value.length < 100) {
      let newValue = _.replace(value.split('//')[1], ']', '');
      docs.push(newValue);
    }
  });
  return docs;
}

function getAttrRows($) {
  let attrThRows = [];
  let attrTdRows = [];
  let attrs = [];

  $('#prod-att-title-row').remove();

  $('.prod-attributes .attributes-td-checkbox').each(function(i, elem) {
    $(elem).remove();
  });

  $('.prod-attributes th').each(function(i, elem) {
    attrThRows[i] = getData($(this).html());
    attrThRows[i] = attrThRows[i].split('?')[0];
  });

  $('.prod-attributes td').each(function(i, elem) {
    attrTdRows[i] = getData($(this).html());
  });

  _.forEach(attrThRows, function(value, index) {
    let obj = {};
    obj.key = value;
    obj.value = attrTdRows[index];
    attrs.push(obj);
  });
  return attrs;
}


function getPriceList($, initFields) {
  let dollars = getArrayData($, '#product-dollars');
  let priceCollection = [];
  for (let i = 3; i < dollars.length; i = i + 3) {
    let obj = {};
    obj.amount = dollars[i];
    obj.unitPrice = dollars[i + 1];
    priceCollection.push(obj);
  }
  return priceCollection;
}

function parseFields($) {
  let fields = {};
  getInfoRows($, fields);
  fields.attrs = getAttrRows($);
  fields.docs = getDocRows($);
  fields.prices = getPriceList($, fields);
  return R.map((field) => field === '' ? undefined : field, fields);
}

function validate(opts) {
  return true;
}

function buildUrl(opts) {
  return opts.url;
}

module.exports = memoize(product);
