import * as bool from './boolean';
/*
 一个使用了promise 特性的轻量 ajax工具
使用例子
let $get = new Component({
  type: 'POST', //请求方式
  async: true, //是否异步请求
  fetch: true, // 是否启用fetchAPI
  dataProcess: null, // 处理数据，默认处理是encode，无须传入具有默认值
  dealRes: null, // 必须传入一个dealRes处理函数
  beforeSend: null, //请求前
  success: null, //成功
  fail: null,// 失败
  complete: null // 处理完成，会在success和fail后面调用
})

 dealRes 是这样子的一个处理返回结果的接口
  @prototype then: 暴露$ajax 返回的then接口
  @prototype catch: 捕获$ajax 返回的catch接口
  在then方法里可以处理与后台的约定结果，返回success、fail、complete 等不同的回调

function dealRes(options) {
this.success = options.success || function () { };
  this.fail = options.fail || function (res) { };
  this.complete = options.complete || function () { };
  this.error = options.error || function (res) { };
}
dealRes.prototype.then = (res,resolve,reject) => { };
dealRes.prototype.catch = (res,reject) => { };


*/
export default class Component {
  constructor(args) {
    let defaults = { url: '', data: {}, type: 'POST', async: true, fetch: true, catch: true, dataProcess: null, dealRes: function() { this.then = () => { }; this.catch = () => { }; }, success: null, fail: null, error: null, beforeSend: null, complete: null };
    if(bool.isObject(args)) {
      Object.keys(args).forEach(key => {
        defaults[key] = args[key];
      });
    };
    function ajax() {
      var opt;
      if (typeof arguments[0] === 'string') {
        opt = Object.assign({}, defaults, { url: arguments[0] }, arguments[1]);
      } else {
        opt = Object.assign({}, defaults, arguments[0]);
      }
      let timestamp = new Date().getTime();
      let DealRes = opt.dealRes;
      let dealResInstance = new DealRes(opt);
      dealResInstance.beginTime = Date.now();
      opt.type = String.prototype.toUpperCase.call(opt.type);
      const promise = new Promise((resolve, reject) => {
        if (bool.isFunction(opt.beforeSend)) {
          opt.beforeSend();
        }
        let url = opt.url;
        // let url = opt.url.indexOf('?') !== -1 ? opt.url += `&timestamp=${timestamp}` : opt.url += `?timestamp=${timestamp}`;
        if (bool.isFunction(opt.dataProcess)) {
          opt.data = opt.dataProcess(opt.data);
        } else {
          opt.data = dataProcess(opt.data);
        }
        let requestConfig = {
          credentials: 'include',
          method: opt.type,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          mode: 'cors',
          cache: 'force-cache'
        };
        if (opt.type === 'GET') {
          if (opt.data !== '') {
            url = url.indexOf('?') !== -1 ? url + `&${opt.data}` : url + `?${opt.data}`;
          }
          if (!opt.cache) {
            url = url.indexOf('?') !== -1 ? url += `&_=${timestamp}` : url += `?_=${timestamp}`;
          }
        } else {
          Object.defineProperty(requestConfig, 'body', {
            value: opt.data
          });
        }
        if(opt.async && window.fetch && opt.fetch) {
          fetch(url, requestConfig)
            .then((res) => {
              if(res.ok) {
                // return res;
                var contentType = res.headers.get('content-type');
                if(contentType && contentType.includes('application/json')) {
                  return res.json();
                }else{
                  return res.text();
                }
              }
            })
            .then(resJson => {
              typeof resJson === 'object' ? dealResInstance.then(resJson, resolve, reject)
              : dealResInstance.catch(resJson, reject);
            })
            .catch(e => {
              dealResInstance.catch(e, reject);
            });
        } else {
          let requestObj;
          if (window.XMLHttpRequest) {
            requestObj = new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
          } else {
            requestObj = new ActiveXObject(); // code for IE6, IE5
          }
          requestObj.open(opt.type, url, true, opt.async);
          requestObj.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          requestObj.send(opt.data);
          requestObj.onreadystatechange = () => {
            if (requestObj.readyState === 4) {
              if (requestObj.status === 200) {
                try {
                  let res = requestObj.response || requestObj.responseText; // responseText only in IE9
                  if(res.charAt(0) === '<') {
                    // 返回的是一个html
                    dealResInstance.catch(res, reject);
                  }else{
                    let resJson = JSON.parse(res);
                    dealResInstance.then(resJson, resolve, reject);
                  }
                } catch (e) { // 捕获后端异常返回
                  dealResInstance.catch(e, reject);
                }
              }else{
                let msg = `readyState [ ${requestObj.readyState}] is error`;
                let e = new Error(msg);
                dealResInstance.catch(e, reject);
              }
            }
          };
        }
      });
      promise.catch(function (err) {
        if (bool.isObject(err)) {
          // console.error('global:' + JSON.stringify(err));
          return false;
        }
        // console.error('global:' +String(err))
      });
      return promise;
    }
    return ajax;
  }
}

function dataProcess(data, newObj = [], newName) {
  function parseName(name, i) {
    return name ? `${name}[${i}]` : i;
  }
  Object.keys(data).forEach(key => {
    let currentData = data[key];
    let currentName = parseName(newName, key);
    if (bool.isArray(currentData)) {
      currentData.forEach((key2, index) => {
        // let name = key + `[${index}]`;

        let name = parseName(currentName, index);
        if (bool.isObject(key2)) {
          return dataProcess(key2, newObj, name);
        } else {
          newObj.push(encode(name, key2));
        }
      });
    } else if (bool.isObject(currentData)) {
      return dataProcess(currentData, newObj, currentName);
    } else {
      newObj.push(encode(currentName, currentData));
    }
  });
  return newObj.join('&');
}

function encode(key, val) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(val);
}
