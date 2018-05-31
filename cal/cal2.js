    /* 
     * 小数计算 
     * @example: 
     * 0.1+0.2     //0.30000000000000004 
     * var a=Decimal('0.1');var b=Decimal('0.2'); 
     * a.add(b).toNumber()    //0.3 
     * 
     * 四舍五入，保留一位小数 
     * a.add(b).add(0.14).toNumber(1)  //0.4 
     * 
     * Decimal.add(0.1,0.2,0.3).toNumber()  //0.6 
     * Decimal.add([0.1,0.2,0.3]).toNumber()  //0.6 
     * 
     * (0.1+0.2+0.3)*2/0.5      //2.4000000000000004 
     * Decimal.add([0.1,0.2,0.3]).mul(2).div(0.5).toNumber() //2.4 
     * */  
    (function (ROOT, factory) {  
        if (typeof exports === 'object') {  
            // Node.  
            module.exports = factory();  
        } else if (typeof define === 'function' && define.amd) {  
            // AMD. Register as an anonymous module.  
            define(factory);  
        } else {  
            // Browser globals (root is window)  
            ROOT.Decimal = factory();  
        }  
    }((0,eval)(this), function () {  
        var DECIMAL_SEPARATOR = '.';  
      
        // Decimal  
        var Decimal = function (num) {  
            if (this.constructor != Decimal) {  
                return new Decimal(num);  
            }  
      
            if (num instanceof Decimal) {  
                return num;  
            }  
      
            this.internal = String(num);  
            this.as_int = as_integer(this.internal);  
      
            this.add = function (target) {  
                var operands = [this, new Decimal(target)];  
                operands.sort(function (x, y) {  
                    return x.as_int.exp - y.as_int.exp  
                });  
      
                var smallest = operands[0].as_int.exp;  
                var biggest = operands[1].as_int.exp;  
      
                var x = Number(format(operands[1].as_int.value, biggest - smallest));  
                var y = Number(operands[0].as_int.value);  
      
                var result = String(x + y);  
      
                return Decimal(format(result, smallest));  
            };  
      
            this.sub = function (target) {  
                return Decimal(this.add(target * -1));  
            };  
      
            this.mul = function (target) {  
                target = new Decimal(target);  
                var result = String(this.as_int.value * target.as_int.value);  
                var exp = this.as_int.exp + target.as_int.exp;  
      
                return Decimal(format(result, exp));  
            };  
      
            this.div = function (target) {  
                target = new Decimal(target);  
      
                var smallest = Math.min(this.as_int.exp, target.as_int.exp);  
      
                var x = Decimal.mul(Math.pow(10, Math.abs(smallest)), this);  
                var y = Decimal.mul(Math.pow(10, Math.abs(smallest)), target);  
                return Decimal(x / y);  
            };  
      
            this.toString = function (precision) {  
                if (isNumber(precision)) {  
                    return ''+toFixed(Number(this.internal), precision);  
                }  
                return this.internal;  
            };  
      
            this.toNumber = function (precision) {  
                if (isNumber(precision)) {  
                    return toFixed(Number(this.internal), precision);  
                }  
                return Number(this.internal);  
            }  
        };  
      
        var as_integer = function (number) {  
            number = String(number);  
      
            var value,  
                exp,  
                tokens = number.split(DECIMAL_SEPARATOR),  
                integer = tokens[0],  
                fractional = tokens[1];  
      
            if (!fractional) {  
                var trailing_zeros = integer.match(/0+$/);  
      
                if (trailing_zeros) {  
                    var length = trailing_zeros[0].length;  
                    value = integer.substr(0, integer.length - length);  
                    exp = length;  
                } else {  
                    value = integer;  
                    exp = 0;  
                }  
            } else {  
                value = parseInt(number.split(DECIMAL_SEPARATOR).join(''), 10);  
                exp = fractional.length * -1;  
            }  
      
            return {  
                'value': value,  
                'exp': exp  
            };  
        };  
      
      
        // Helpers  
        var neg_exp = function (str, position) {  
            position = Math.abs(position);  
      
            var offset = position - str.length;  
            var sep = DECIMAL_SEPARATOR;  
      
            if (offset >= 0) {  
                str = zero(offset) + str;  
                sep = '0.';  
            }  
      
            var length = str.length;  
            var head = str.substr(0, length - position);  
            var tail = str.substring(length - position, length);  
            return head + sep + tail;  
        };  
      
        var pos_exp = function (str, exp) {  
            var zeros = zero(exp);  
            return String(str + zeros);  
        };  
      
        var format = function (num, exp) {  
            num = String(num);  
            var func = exp >= 0 ? pos_exp : neg_exp;  
            return func(num, exp);  
        };  
      
        var zero = function (exp) {  
            return new Array(exp + 1).join('0');  
        };  
      
        var methods = ['add', 'mul', 'sub', 'div'];  
        for (var i = 0; i < methods.length; i++) {  
            (function (method) {  
                Decimal[method] = function () {  
                    var args = [].slice.call(arguments);  
                    if (isArray(args[0])) {  
                        args = args[0];  
                    }  
                    if (args.length == 1) {  
                        return new Decimal(args[0]);  
                    }  
                    var option = args[args.length - 1];  
      
                    var sum = new Decimal(args[0]),  
                        index = 1;  
                    while (index < args.length) {  
                        sum = sum[method](args[index]);  
                        index++;  
                    }  
                    return sum;  
                };  
            })(methods[i]);  
        }  
      
        var toFixed = function (number, precision) {  
            var multiplier = Math.pow(10, precision + 1),  
                wholeNumber = Math.floor(number * multiplier);  
            return Math.round(wholeNumber / 10) * 10 / multiplier;  
        };  
        var isNumber = function (o) {  
            return Object.prototype.toString.call(o).slice(8, -1) === 'Number';  
        };  
        var isArray = function (o) {  
            return Object.prototype.toString.call(o).slice(8, -1) === 'Array';  
        };  
        var isObject = function (o) {  
            return Object.prototype.toString.call(o).slice(8, -1) === 'Object';  
        };  
        return Decimal;  
    }));  