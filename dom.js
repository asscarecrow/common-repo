
/* 
主要集合 操作dom方法

*/


/* 简单的选择器，根据 className element id 去选择元素，第二参数可以传递标签名字，可以提高查找的性能 */
export function $(d, t) {

  var c = null, // className 
    e = null, // element
    i = null; // id

  function type(p) {
    /function.(\w*)\(\)/.test(p.constructor);
    return RegExp.$1.toLowerCase();
  }

  if (type(d) == 'string') {

    if (/^\.[a-z,A-Z,_]\w*$/.test(d)) { // 匹配class
      c = d;
    } else if (/^#[a-z,A-Z,_]\w*$/.test(d)) { // 匹配id
      i = d;
    } else if (/^[a-z,A-Z,_]+$/.test(d)) { // 匹配元素
      e = d;
    } else {
      return undefined;
    }
    if (document.querySelectorAll) {

      if (i) return document.getElementById(i);
      if (c || e) return document.querySelectorAll(c || e);
      

    } else {
      if (c) {
        var all = document.getElementsByTagName(t || '*'),
          cn = c.slice(1, c.length),
          reg = new RegExp('^' + cn + '\\b'), // 限定类名的起始，结束只要是相同字符结束即可。
          em = [];
        for (var i = 0; i < all.length; i++) {
          if (reg.test(all[i].className)) {
            em.push(all[i])
          }
        }
        return em;
      } else if (e) {
        return document.getElementsByTagName(e);
      } else if (i) {
        return document.getElementById(i);
      }
    }

  } else {
    return undefined;
  }

}


// 触发事件
/* 
支持触发浏览器原生事件和自定义事件
see on 
https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
https://stackoverflow.com/questions/2490825/how-to-trigger-event-in-javascript
support IE
触发自定义事件还有点问题
*/
function trigger(node, eventName, options = { detail: 'customer Event fire' }) {
  // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
  var doc;
  if (node.ownerDocument) {
    doc = node.ownerDocument;
  } else if (node.nodeType == 9) {
    // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
    doc = node;
  } else {
    throw new Error("Invalid node passed to fireEvent: " + node.id);
  }

  if (node.dispatchEvent) {
    // Gecko-style approach (now the standard) takes more work
    var eventClass = "";

    // Different events have different event classes.
    // If this switch statement can't map an eventName to an eventClass,
    // the event firing is going to fail.
    switch (eventName) {
      case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
      case "mousedown":
      case "mouseup":
        eventClass = "MouseEvents";
        break;

      case "focus":
      case "change":
      case "blur":
      case "select":
        eventClass = "HTMLEvents";
        break;

      default:
        eventClass = 'CustomEvent';
        // throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
        break;
    }


    var event;
    if (eventClass !== 'CustomEvent') {
      // 原生事件
      event = doc.createEvent(eventClass);
      var bubbles = eventName == "change" ? false : true;
      event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.
      event.synthetic = true; // allow detection of synthetic events
    } else {
      // 自定义事件
      if (window.CustomEvent) {
        event = new CustomEvent(eventName, options);
      } else {
        event = document.createEvent(eventClass);
        // event.initEvent(eventName, true, true);
        event.initCustomEvent(eventName, true, true, options);

      }
    }
    // The second parameter says go ahead with the default action
    node.dispatchEvent(event, true);
  } else if (node.fireEvent) {
    // IE-old school style
    var event = doc.createEventObject();
    event.synthetic = true; // allow detection of synthetic events
    node.fireEvent("on" + eventName, event);
  }
};