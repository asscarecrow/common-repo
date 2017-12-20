import * as bool from './boolean';
export default class Component {
  constructor(args) {
    let defaults = { url: '', data: {}, type: 'POST', fetch: true, dataProcess: null, success: () => { }, fail: () => { }, beforeSend: () => { }, complete: () => { } };
      if(bool.isObject(args)) {
        Object.keys(args).forEach(key => {
          defaults[key] = args[key];
        })
      }
    function ajax(options) {
      let opt = Object.assign({},defaults,options);
      const _this = this;
      let timestamp = new Date().getTime();
      opt.type = String.prototype.toUpperCase.call(opt.type);
      const promise = new Promise((resolve,reject)=>{
        opt.beforeSend();
        let url =opt.url + `?timestamp=${timestamp}`;
        if(bool.isObject(opt.dataProcess)) {
          opt.data = opt.dataProcess(opt.data);
        }else {
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
        if(opt.type==='GET') {
          url = opt.data !== '' ? url + `&${opt.data}` : url;
        }else {
          Object.defineProperty(requestConfig, 'body', {
            value: opt.data
          });
        }
        if(window.fetch && opt.fetch) {
          fetch(url, requestConfig)
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            opt.fail();
            reject();
          })
          .then(resJson => {

            opt.success(resJson);
            opt.complete(resJson);
            resolve();
          })
          .catch(e => {
            opt.fail();
            opt.complete();
            reject(e);
          })
        }else {
          let requestObj;
          if (window.XMLHttpRequest) {
            requestObj = new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
          } else {
            requestObj = new ActiveXObject(); // code for IE6, IE5
          }
          requestObj.open(opt.type, opt.url, true);
          requestObj.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          requestObj.send(opt.data);
          requestObj.onreadystatechange = () => {
            if (requestObj.readyState === 4) {
              if (requestObj.status === 200) {
                try {
                  let resJson = JSON.parse(requestObj.response);
                  opt.success(resJson);
                  opt.complete(resJson);
                  resolve(resJson);
                } catch (e) { // 捕获后端异常返回
                  opt.fail(e);
                  reject(e);
                }
              } else {
                opt.fail();
                reject();
              }
            }
          };
        }
      });
      promise.catch(function(err) {
        if(!!err) {
          throw new Error(err);
        }
        throw new Error('网络状态不通，不 OK');
      });
      return promise;
    }
    return ajax;
  }
}

function dataProcess(data, newObj = [], newName) {
  Object.keys(data).forEach(key => {
    let currentData = data[key];
    if (bool.isArray(currentData)) {
      currentData.forEach(key2, index => {
        let name = key + `${index}`;
        if (bool.isObject(key2)) {
          return dataProcess(key2,newObj,name)
        }else {
          newObj.push(encode(name,key2));
        }
      });
    } else if (bool.isObject(currentData)) {
      return dataProcess(currentData, newObj, key)
    } else {
      newObj.push(encode(key, currentData));
    }
  })
  return newObj.join('&');
}

function encode (key, val) {
  return encodeURIComponent(key) + '=' + encodeURIComponent(val);
}
