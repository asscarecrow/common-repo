
import Ajax from './ajax';
import * as bool from './boolean';
import { AlertPlugin, ToastPlugin, LoadingPlugin } from 'vux';
const { alert, toast, loading } = Vue.$vux;
/*
实例化两个常用的 ajax请求；
一：简单调用：
$get('url')
.then((res)=>{
  // 成功回调
})
.catch(res => {
  // 失败回调
})
二：自定义调用
可以传入自定义的处理函数，来替代默认的处理函数
$get({
  url: '',
  beforeSend:()=>{
    // 个性化操作
  },
  success:()=>{
    // 可以定义一个空的回调函数来取消默认的回调
  }
})
*/

const $get = new Ajax({
  type: 'GET',
  beforeSend: function() {
     loading.show();
  },
  dealRes: dealRes
});
const $post = new Ajax({
  type: 'POST',
  dealRes: dealRes,
  success: function() {
     toast.show();
  },
  beforeSend: function() {
     loading.show();
  }
});

// 实现一个结果处理的接口
function dealRes(options) {
  // 关掉提示接口
  if (options.fail === false) {
    options.fail = () => { };
  }
  if (options.success === false) {
    options.success = () => { };
  }
  if (options.complete === false) {
    options.complete = () => { };
  }
  if (options.error === false) {
    options.error = () => { };
  }
  this.success = options.success || function() { };
  this.fail = options.fail || function(res) {
    alert.show({
      title: '温馨提示',
      content: `${res.message}`
    });
  };
  this.complete = options.complete || function() {
    try {
      loading.hide();
    } catch (e) {

    }
  };
  this.error = options.error || function(res) {
    alert.show({
      title: '温馨提示',
      content: `${res.message}`
    });
  };
};

dealRes.prototype.then = function(res, resolve, reject) {
  switch (res.code) {
    case '000':
      this.success(res);
      this.complete(res);
      resolve(res);
      break;
    case '003':
      unLogin(res);
      this.complete(res);
      reject(res);
      break;
    default:
      this.fail(res);
      this.complete(res);
      reject(res);
  }
};

dealRes.prototype.catch = function(res, reject) {
  if (bool.isObject(res) && res.code) {
    // 由then 方法抛出的异常

    this.fail(res);
    this.complete(res);
    reject();
  } else {
    this.complete();
    if (isFetchError(res) || res.status === 0) return; // 捕获 request be cancaled error
    // 由catch 抛出的 程序错误
    this.error({ message: '服务器当前正在开小差，请稍后重试' });
  }
};
function isFetchError(res) {
  let reg = /^TypeError:.*fetch/gi;
  let str = String(res);
  return reg.test(str);
}