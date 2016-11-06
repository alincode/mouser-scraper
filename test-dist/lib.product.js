'use strict';

var _field = require('./field');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Digikey = require('../dist/product').default;

describe('product page', function () {
  var _this = this;

  it('case 1', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(done) {
      var digikey;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              digikey = new Digikey('http://www.digikey.tw/product-detail/zh/comchip-technology/ZENER-KIT/641-1426-ND/2217259');

              digikey.getResult().then(function (result) {
                console.log("==========> result:", result);
                // result.should.have.keys(ProductFields);
                done();
              }, function (err) {
                done(err);
              });

            case 2:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  it('case 2', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(done) {
      var digikey;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              digikey = new Digikey('http://www.digikey.tw/product-detail/zh/m-a-com-technology-solutions/MADP-011069-SAMKIT/1465-1784-ND/6003062');

              digikey.getResult().then(function (result) {
                console.log("==========> result:", result);
                // result.should.have.keys(ProductFields);
                done();
              }, function (err) {
                done(err);
              });

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  it('case 3', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(done) {
      var digikey;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              digikey = new Digikey('http://www.digikey.tw/product-detail/zh/tpi-test-products-int/120085/290-1925-ND/1832239');

              digikey.getResult().then(function (result) {
                console.log("==========> result:", result);
                // result.should.have.keys(ProductFields);
                done();
              }, function (err) {
                done(err);
              });

            case 2:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
});