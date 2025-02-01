(()=>{var e={415:function(e){function t(e,n=100,i={}){let r,o,l,a,d;if("function"!=typeof e)throw TypeError(`Expected the first parameter to be a function, got \`${typeof e}\`.`);if(n<0)throw RangeError("`wait` must not be negative.");let{immediate:c}="boolean"==typeof i?{immediate:i}:i;function s(){let t=r,n=o;return r=void 0,o=void 0,d=e.apply(t,n)}function u(){let e=Date.now()-a;e<n&&e>=0?l=setTimeout(u,n-e):(l=void 0,c||(d=s()))}let p=function(...e){if(r&&this!==r&&Object.getPrototypeOf(this)===Object.getPrototypeOf(r))throw Error("Debounced method called with different contexts of the same prototype.");r=this,o=e,a=Date.now();let t=c&&!l;return l||(l=setTimeout(u,n)),t&&(d=s()),d};return Object.defineProperty(p,"isPending",{get:()=>void 0!==l}),p.clear=()=>{l&&(clearTimeout(l),l=void 0)},p.flush=()=>{l&&p.trigger()},p.trigger=()=>{d=s(),p.clear()},p}e.exports.debounce=t,e.exports=t}},t={};function n(i){var r=t[i];if(void 0!==r)return r.exports;var o=t[i]={exports:{}};return e[i](o,o.exports,n),o.exports}n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.rv=function(){return"1.2.2"},n.ruid="bundler=rspack@1.2.2",(()=>{"use strict";function e(e,t){for(var n=arguments.length,i=Array(n>2?n-2:0),r=2;r<n;r++)i[r-2]=arguments[r];let o=i;return(null==t?void 0:t.children)&&(o=Array.isArray(t.children)?t.children:[t.children],t.children=void 0),Array.isArray(i[0])&&1===i[0].length&&"string"==typeof i[0][0]?o=i[0]:Array.isArray(i[0])&&i[0].length>1&&(o=i[0]),{type:e,props:{...t,children:o.filter(e=>null!=e&&!1!==e&&""!==e).map(e=>"object"==typeof e?e:{type:"TEXT_ELEMENT",props:{nodeValue:"boolean"==typeof e?"":e,children:[]}})}}}var t=n(415),i={black:"\x1b[30m",red:"\x1b[31m",green:"\x1b[32m",yellow:"\x1b[33m",blue:"\x1b[34m",magenta:"\x1b[35m",cyan:"\x1b[36m",white:"\x1b[37m",gray:"\x1b[90m",grey:"\x1b[90m",redBright:"\x1b[91m",greenBright:"\x1b[92m",yellowBright:"\x1b[93m",blueBright:"\x1b[94m",magentaBright:"\x1b[95m",cyanBright:"\x1b[96m",whiteBright:"\x1b[97m",darkOrange:"\x1b[38;5;208m",orange:"\x1b[38;5;214m"},r=e=>`\x1b[1m${e}\x1b[0m`,o=(e,t)=>`${i[e]}${t}\x1b[0m`,l=(e,t)=>{let n=o(t.color,r(t.name)),i=[".","!","?","\n"].includes("string"==typeof e?e.slice(-1):".")?"":".",l=t.newLine?"\n":"";if("error"===t.type){if(console.error(`${n} ${o("red",r("Error"))} ${e}${i}${l}`),"undefined"!=typeof process)process.exit(0);else throw Error(e);return}if("warning"===t.type){console.warn(`${n} ${o("darkOrange","Warning")} ${e}${i}${l}`);return}console.log(`${n} ${e}${i}${l}`)},a=new Map,d=(e,t)=>{let{count:n}=a.get(t.group),i=t.groupMessage;n<2&&(i=e),n>1&&"function"==typeof i&&(i=i(n)),a.delete(t.group),l(i,t)};let c=((e,n="gray",i=!1)=>(e||console.error(`${o("gray",r("logua"))} ${o("red",r("Error"))} No name provided to create(name, color = 'gray', newLine = false).`),function(r,o){let c={name:e,color:n,type:o&&"string"!=typeof o?o.type:o,newLine:i};if("object"==typeof o&&Object.assign(c,o),"object"==typeof o&&o.group){a.has(o.group)?a.get(o.group).count+=1:a.set(o.group,{handler:t(d,o.timeout||50),count:1}),a.get(o.group).handler(r,c);return}l(r,c)}))("epic-jsx","blue");function s(e,t,n){let i=!(arguments.length>3)||void 0===arguments[3]||arguments[3];if("TEXT_ELEMENT"===e.type||!i&&"function"==typeof e.type)return t;if(e.native&&t.push(e.native),e.child){let i=s(e.child,n?t:[],n,!1);!n&&i.length>0&&(t.length>0?t.push(i):t.push(...i))}return!i&&e.sibling&&s(e.sibling,t,n,!1),t}function u(e){return window.requestIdleCallback?window.requestIdleCallback(e):(window.requestIdleCallback=window.requestIdleCallback||function(e,t){let n=Date.now();return setTimeout(()=>{e({didTimeout:!1,timeRemaining:()=>Math.max(0,50-(Date.now()-n))})},1),0},window.cancelIdleCallback=window.cancelIdleCallback||function(e){clearTimeout(e)},u(e))}let p=["accentHeight","alignmentBaseline","arabicForm","baselineShift","clipPath","clipRule","colorInterpolation","colorInterpolationFilters","colorProfile","colorRendering","dominantBaseline","enableBackground","fillOpacity","fillRule","floodColor","floodOpacity","fontFamily","fontSize","fontSizeAdjust","fontStretch","fontStyle","fontVariant","fontWeight","glyphOrientationHorizontal","glyphOrientationVertical","imageRendering","letterSpacing","lightingColor","markerEnd","markerMid","markerStart","paintOrder","pointerEvents","shapeRendering","stopColor","stopOpacity","strokeDasharray","strokeDashoffset","strokeLinecap","strokeLinejoin","strokeMiterlimit","strokeOpacity","strokeWidth","textAnchor","textDecoration","textRendering","unicodeBidi","wordSpacing","writingMode"];var h=function(e){return e[e.Update=0]="Update",e[e.Add=1]="Add",e[e.Delete=2]="Delete",e}({});let g=["width","height","border","margin","padding","top","right","bottom","left","gap","rowGap","columnGap"],f=e=>e.startsWith("on"),v=e=>"children"!==e&&!f(e),C=(e,t)=>n=>e[n]!==t[n],y=(e,t)=>e=>!(e in t);function m(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};Object.keys(t).filter(f).filter(e=>!(e in n)||C(t,n)(e)).forEach(n=>{let i=n.toLowerCase().substring(2);e.removeEventListener(i,t[n])}),Object.keys(t).filter(v).filter(y(t,n)).forEach(t=>{e[t]=""}),Object.keys(n).filter(v).filter(C(t,n)).forEach(t=>{if("ref"===t){n[t].current=e;return}if("value"===t){e.value=n[t];return}"function"==typeof e.setAttribute?"style"===t?Object.assign(e.style,function(e){let t={};for(let n in e)if(Object.hasOwn(e,n)){let i=e[n];"number"==typeof i&&function(e){return g.some(t=>e.startsWith(t))}(n)?t[n]=`${i}px`:t[n]=i}return t}(n[t])):e.setAttribute(t,n[t]):e[t]=n[t]}),Object.keys(n).filter(f).filter(C(t,n)).forEach(t=>{let i=t.toLowerCase().substring(2);e.addEventListener(i,n[t])})}function b(e){var t,n;if(!e)return;let{parent:i}=e,r=500;for(;!(null==i?void 0:i.native)&&(null==i?void 0:i.parent)&&r>0;)r-=1,i=i.parent;if(0===r&&c("Ran out of tries at commitFiber.","warning"),e.change===h.Add&&e.native?null==i||null===(t=i.native)||void 0===t||t.appendChild(e.native):e.change===h.Update&&e.native?m(e.native,null===(n=e.previous)||void 0===n?void 0:n.props,e.props):e.change===h.Delete&&i&&i.native&&function e(t,n){if(t.native){try{n.removeChild(t.native)}catch(e){c("Failed to remove node from the DOM","warning")}t.change=void 0}else t.child&&(t.change=void 0,t.child.change=h.Delete,e(t.child,n))}(e,i.native),e.afterListeners){for(let t of e.afterListeners)t.call(e.component);e.afterListeners=[]}e.child&&b(e.child),e.sibling&&b(e.sibling)}function L(e,t){var n;let i,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],o=0,l=null===(n=t.previous)||void 0===n?void 0:n.child,a=500;for(;(o<r.length||l)&&a>0;){let n;a-=1;let d=r[o],c=!(null===d||null===l)&&(null==d?void 0:d.type)===(null==l?void 0:l.type);c&&l&&(n=w(t,l,d)),d&&c&&!l&&(n=k(t,d,l)),d&&!c&&(n=k(t,d,l)),l&&!c&&function e(t,n){n.change!==h.Delete&&(n.change=h.Delete,t.deletions.push(n),n.child&&e(t,n.child),n.sibling&&e(t,n.sibling))}(e,l);let s=l;l&&(l=l.sibling),0===o?t.child=n:d&&i&&(i.sibling=n),i=n,(o+=1)>r.length&&(function e(t,n){n&&(n.change=h.Delete,t.deletions.push(n),(null==n?void 0:n.sibling)&&e(t,n.sibling))}(e,l??s),l=void 0)}0===a&&c("Ran out of tries at reconcileChildren.","warning")}let w=(e,t,n)=>({type:t.type,props:(null==n?void 0:n.props)??(null==t?void 0:t.props),native:t.native,parent:e,previous:t,hooks:t.hooks,svg:t.svg||"svg"===t.type,change:h.Update}),k=(e,t,n)=>({type:t.type,props:t.props,native:void 0,parent:e,previous:void 0,hooks:"function"==typeof t.type?n?n.hooks:[]:void 0,svg:e.svg||"svg"===t.type,change:h.Add});function x(e,t){if(!t.current&&0===t.pending.length){c("Trying to process an empty queue");return}!t.current&&(t.current=t.pending.shift(),t.current&&t.rendered.push(t.current));let n=!1,i=500;for(;t.current&&!n&&i>0;)i-=1,t.current=function(e,t){if(t.type instanceof Function)!function(e,t){if("function"!=typeof t.type)return;if(void 0===t.hooks&&(t.hooks=[]),t.hooks.length=0,I.context=e,t.afterListeners=[],!t.id){var n;t.id=(null===(n=t.previous)||void 0===n?void 0:n.id)??Math.floor(1e6*Math.random())}t.component={id:t.id,root:t,context:e,rerender:()=>(function(e,t){e.pending.push({...t,previous:t})})(e,t),get refs(){return s(t,[],!0)},get refsNested(){return s(t,[],!1)},refsByTag:e=>(function e(t,n,i){let r=!(arguments.length>3)||void 0===arguments[3]||arguments[3];return"TEXT_ELEMENT"!==t.type&&(r||"function"!=typeof t.type)&&(t.native&&t.native.tagName&&t.native.tagName.toLowerCase()===i.toLowerCase()&&n.push(t.native),!r&&t.sibling&&e(t.sibling,n,i,!1),t.child&&e(t.child,n,i,!1)),n})(t,[],e),after(e){var n;null===(n=t.afterListeners)||void 0===n||n.push(e)}},I.current=t;let i=[t.type.call(t.component,t.props)];I.current=void 0,I.context=void 0,L(e,t,i.flat())}(e,t);else{var n;t.native||(t.native=function(e){let t;if(e.type)return Object.hasOwn(e.props,"className")&&(Object.hasOwn(e.props,"class")?e.props.class=`${e.props.class} ${e.props.className}`:e.props.class=e.props.className,e.props.className=void 0),"TEXT_ELEMENT"===e.type?t=document.createTextNode(""):e.svg?(function(e){for(let t in e)p.includes(t)&&(e[t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()]=e[t],delete e[t])}(e.props),t=document.createElementNS("http://www.w3.org/2000/svg",e.type)):t=document.createElement(e.type),m(t,{},e.props),t}(t)),L(e,t,null===(n=t.props)||void 0===n?void 0:n.children.flat())}if(t.child)return t.child;let i=t,r=500;for(;i&&r>0;){if(r-=1,i.sibling)return i.sibling;i=i.parent}0===r&&c("Ran out of tries at render.","warning")}(t,t.current),!t.current&&t.pending.length>0&&(t.current=t.pending.shift(),t.current&&t.rendered.push(t.current)),n=1>e.timeRemaining();if(0===i&&c("Ran out of tries at process.","warning"),!t.current&&t.rendered.length>0){for(let e of t.rendered)!function(e,t){if(e.deletions.forEach(b),e.deletions.length=0,t.child&&b(t.child),I.effects.length>0){for(let e of I.effects)e();I.effects.length=0}}(t,e);t.rendered.length=0}(t.current||t.pending.length>0)&&u(e=>x(e,t))}let M=e=>x({timeRemaining:()=>99999,didTimeout:!1},e),I={context:void 0,effects:[],current:void 0},j=new Map,T=void 0,D=e=>{if(!j.has(e))return;let t=j.get(e);return t&&(t.pending.length>0||t.rendered.length>0)&&M(t),t},A=e=>{if(!e){c("Trying to unmount empty container","warning");return}e.innerHTML="",D(e)&&j.delete(e)};function E(e){var t,n,i,r,o,l,a;I.context||c("Hooks can only be used inside a JSX component.","warning");let d=null===(i=I.context)||void 0===i?void 0:null===(n=i.current)||void 0===n?void 0:null===(t=n.hooks)||void 0===t?void 0:t.length,{context:s}=I;if(!s)return;let{pending:p,current:h}=s;if(!h)return;let g=((null===(r=h.previous)||void 0===r?void 0:r.hooks)??[])[d],f={state:g?g.state:e},v=e=>{var t;let n=null===(t=h.hooks)||void 0===t?void 0:t[d];if(n&&v!==n.setState){n.setState(e);return}n.state=e,!p.find(e=>e.previous===h)&&(p.push({native:h.native,props:h.props,type:h.type,hooks:[],previous:h,parent:h.parent}),u(e=>x(e,s)))};f.setState=v,null===(o=h.hooks)||void 0===o||o.push(f);let C=null===(a=I.context)||void 0===a?void 0:null===(l=a.current)||void 0===l?void 0:l.previous;return(null==C?void 0:C.hooks)&&(C.hooks[d]=f),[f.state,v]}let N="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8yMzQ2XzIpIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yNTAgNTAwQzM4OC4wNzEgNTAwIDUwMCAzODguMDcxIDUwMCAyNTBDNTAwIDExMS45MjkgMzg4LjA3MSAwIDI1MCAwQzExMS45MjkgMCAwIDExMS45MjkgMCAyNTBDMCAzODguMDcxIDExMS45MjkgNTAwIDI1MCA1MDBaTTI1MCAzNTBDMzA1LjIyOCAzNTAgMzUwIDMwNS4yMjggMzUwIDI1MEMzNTAgMTk0Ljc3MiAzMDUuMjI4IDE1MCAyNTAgMTUwQzE5NC43NzIgMTUwIDE1MCAxOTQuNzcyIDE1MCAyNTBDMTUwIDMwNS4yMjggMTk0Ljc3MiAzNTAgMjUwIDM1MFoiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8yMzQ2XzIpIi8+CjwvZz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF8yMzQ2XzIiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUwIDI1MCkgcm90YXRlKDkwKSBzY2FsZSgyNTApIj4KPHN0b3Agb2Zmc2V0PSIwLjMzODU0MiIgc3RvcC1jb2xvcj0iIzAwNzVGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IndoaXRlIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMzQ2XzIiPgo8cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",z=t=>{let{Tag:n="h1",children:i}=t;return e(n,{style:{margin:0},children:i})};function H(t){return e("input",{style:{background:"lightgray",border:"none",outline:"none",padding:10,borderRadius:10,resize:"none",alignSelf:"normal"},...t})}function Z(t){let{inactive:n=!1,...i}=t;return e("button",{type:"button",style:{outline:"none",background:n?"gray":"black",border:"none",color:"white",borderRadius:10,display:"flex",flex:1,padding:"10px 20px",cursor:n?"auto":"pointer"},...i})}let S={display:"flex",gap:5},R={border:"none",outline:"none",cursor:"pointer",padding:10,borderBottom:"2px solid black",background:"none"},B={background:"#EFEFEF"},V={paddingTop:20};function O(){return e("svg",{width:"100",height:"100",viewBox:"0 0 500 500",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e("path",{id:"tag-orbit",d:"M249.5 154C309.557 154 363.685 165.267 402.611 183.267C441.959 201.462 464 225.592 464 250.5C464 275.408 441.959 299.538 402.611 317.733C363.685 335.733 309.557 347 249.5 347C189.443 347 135.315 335.733 96.3886 317.733C57.0406 299.538 35 275.408 35 250.5C35 225.592 57.0406 201.462 96.3886 183.267C135.315 165.267 189.443 154 249.5 154Z",stroke:"transparent"}),e("path",{id:"state-orbit",d:"M165.929 298.75C135.9 246.739 118.593 194.23 114.719 151.518C110.802 108.344 120.679 77.1916 142.25 64.7378C163.821 52.2839 195.738 59.3065 231.17 84.2853C266.222 108.997 303.043 150.239 333.071 202.25C363.1 254.261 380.407 306.771 384.281 349.482C388.198 392.656 378.321 423.809 356.75 436.263C335.179 448.716 303.262 441.694 267.83 416.715C232.778 392.004 195.957 350.761 165.929 298.75Z",stroke:"transparent"}),e("path",{id:"jsx-orbit",d:"M165.929 202.25C195.957 150.239 232.778 108.997 267.83 84.2853C303.262 59.3065 335.179 52.2839 356.75 64.7378C378.321 77.1916 388.198 108.344 384.281 151.518C380.407 194.23 363.1 246.739 333.071 298.75C303.043 350.761 266.222 392.004 231.17 416.715C195.738 441.694 163.821 448.716 142.25 436.263C120.679 423.809 110.802 392.656 114.719 349.482C118.593 306.771 135.9 254.261 165.929 202.25Z",stroke:"transparent"}),e("path",{fill:"black","fill-rule":"evenodd","clip-rule":"evenodd",d:"M99.1716 176.54C56.591 195.053 30 221.341 30 250.5C30 306.557 128.273 352 249.5 352C370.727 352 469 306.557 469 250.5C469 221.341 442.409 195.054 399.829 176.54C402.049 181.044 404.073 185.662 405.889 190.383C441.281 207.98 459 229.739 459 250.5C459 272.287 439.487 295.173 400.513 313.195C362.381 330.828 309.001 342 249.5 342C189.999 342 136.619 330.828 98.4872 313.195C59.5128 295.173 40 272.287 40 250.5C40 229.739 57.7188 207.98 93.1121 190.383C94.9281 185.662 96.9516 181.044 99.1716 176.54Z"}),e("path",{fill:"black","fill-rule":"evenodd","clip-rule":"evenodd",d:"M170.259 296.25C140.508 244.721 123.494 192.906 119.698 151.067C115.819 108.303 125.882 79.9614 144.75 69.068C162.754 58.6737 190.507 63.1649 223.501 85.0928C228.55 84.3422 233.612 83.8272 238.673 83.5435C201.248 55.7633 165.067 45.791 139.75 60.4078C91.2033 88.4362 100.985 196.265 161.598 301.25C222.212 406.236 310.703 468.621 359.25 440.593C384.764 425.863 394.167 389.091 388.548 342.275C385.79 346.514 382.832 350.641 379.677 354.639C382.421 394.779 372.417 421.444 354.25 431.933C335.382 442.826 305.806 437.37 270.711 412.629C236.375 388.422 200.009 347.779 170.259 296.25Z"}),e("path",{fill:"black","fill-rule":"evenodd","clip-rule":"evenodd",d:"M119.247 355.809C116.774 395.297 126.76 421.546 144.75 431.933C163.618 442.826 193.194 437.37 228.289 412.629C262.625 388.422 298.991 347.779 328.741 296.25C358.492 244.721 375.506 192.906 379.302 151.067C383.181 108.303 373.118 79.9614 354.25 69.068C336.213 58.6541 308.389 63.1818 275.313 85.2169C270.302 84.4464 265.277 83.9082 260.254 83.5983C297.705 55.7765 333.916 45.7813 359.25 60.4078C407.797 88.4362 398.015 196.265 337.402 301.25C276.788 406.236 188.297 468.621 139.75 440.593C114.473 425.999 105.009 389.772 110.299 343.576C113.085 347.772 116.069 351.855 119.247 355.809Z"}),e("g",{id:"globe",children:[e("path",{fill:"black",d:"M249.5 83C157.141 83 82 158.141 82 250.5C82 342.859 157.141 418 249.5 418C341.859 418 417 342.859 417 250.5C417 158.141 341.859 83 249.5 83ZM94.182 250.5C94.182 225.912 99.9501 202.644 110.169 181.96L125.778 192.256V205.577L136.439 212.43L138.341 239.842L130.346 277.148L137.96 290.854L141.768 304.554L160.168 316.481L159.405 329.429L164.479 336.029L168.542 337.55L168.287 342.624L172.603 344.151L171.84 352.524L168.034 354.304V368.509L177.171 375.62L182.501 384.499L188.338 376.888L188.843 371.556L183.261 369.272L183.769 360.64L193.919 342.882L209.338 336.913L225.325 322.639H234.463L236.176 315.023L240.173 313.691L240.65 307.602L249.882 305.507H253.403L258.445 303.223L259.208 301.036L259.016 297.133C259.208 284.191 237.129 272.958 237.129 272.958L234.273 268.39H225.518C223.994 263.442 210.67 252.405 210.67 252.405L200.393 253.926L193.54 252.974L187.64 236.984L174.695 234.131L161.563 232.036L159.468 235.273L148.428 234.321L145.955 232.415L144.812 219.473L141.768 216.999V207.104L144.052 201.962C144.052 201.962 143.67 196.446 144.052 192.635C144.431 188.83 151.284 181.219 151.284 181.219L153.697 183.756L156.994 187.314L159.279 184.898L162.453 182.993L164.355 179.566H167.021L169.937 184.898C169.937 184.898 171.461 185.788 172.095 186.419C172.726 187.05 177.042 183.63 177.042 183.63L181.737 182.488L182.627 188.577H186.435L187.448 182.614L189.861 175.382L194.683 173.855V166.245C194.683 166.245 196.585 163.197 199.122 163.329C201.659 163.461 204.328 168.024 204.328 168.024C204.328 168.024 210.036 168.782 212.828 168.024C215.617 167.261 223.612 160.276 223.612 160.276L224.884 158.887L227.549 159.139L229.452 160.276H236.176L239.602 153.808H243.029L244.266 150.571H249.5V153.808H255.018C255.018 153.808 258.637 153.429 258.637 150.571C258.637 147.718 262.635 146.576 262.635 146.576V138.77L257.495 136.296L252.76 134.58C252.76 134.58 252.166 132.107 252.737 126.97C253.308 121.827 243.789 116.501 243.789 116.501L238.842 115.17L236.747 117.259L233.892 117.643C233.892 117.643 232.749 121.449 232.749 122.022C232.749 122.591 232.178 128.68 231.418 129.822C230.657 130.965 227.231 129.822 227.231 129.822L225.897 123.922V116.117C225.897 116.117 229.894 113.454 230.657 111.554C231.418 109.648 240.555 109.459 240.555 109.459L241.887 106.985L239.878 95.5063C243.063 95.3111 246.266 95.1791 249.5 95.1791C255.423 95.1791 261.26 95.5464 267.011 96.195V101.274L269.462 105.458H275.388L282.238 107.364V99.5583L282.473 98.7376C311.816 105.108 338.094 119.778 358.704 140.188L353.553 144.67L351.78 159.392L346.448 161.676L340.863 167.008V174.108L335.79 177.666L329.953 178.929V191.877H331.984L333.758 200.756L341.371 203.041L347.211 204.561L348.985 201.009L353.806 201.52L357.361 208.12L355.077 211.168L350.761 213.446H345.687L336.295 217.952L329.953 221.189V226.899H334.392L339.532 230.136L345.687 231.847L352.664 234.699L361.419 238.126H368.083L369.607 236.415L374.743 235.841L377.409 240.031L383.691 241.937L390.162 240.605L399.3 245.553L398.347 253.353L401.963 259.258H404.557C404.304 263.775 403.845 268.235 403.211 272.643L402.281 271.311L386.039 273.854L379.949 268.774H369.454V250.5H353.553L340.863 254.053L329.953 250.5L306.349 259.258L302.289 272.838L315.994 288.57L317.007 297.707L302.289 316.481L308.381 330.697L311.931 340.34H318.531L329.953 330.697L339.34 340.34L357.109 332.729L360.659 343.387L351.522 352.019L334.774 354.55L333.758 371.815L324.624 384.499L325.235 386.031C302.814 398.606 276.989 405.821 249.5 405.821C163.859 405.821 94.182 336.144 94.182 250.5Z"}),e("path",{d:"M181.897 213H174.791L171.104 218.251L169 226H182.947L186.634 223.502H189V218.251L181.897 215.628V213Z",fill:"black"}),e("path",{d:"M322.121 160.836L324.439 165.767L329.592 167L335 159.849V154.673L327.786 149H322.121L318 155.409L320.059 160.591L322.121 160.836Z",fill:"black"})]}),e("g",{mask:"url(#jsx-mask)",children:e("ellipse",{id:"jsx",cx:"0",cy:"0",rx:"24.5",ry:"25",fill:"#0075FF",children:e("animateMotion",{repeatCount:"indefinite",dur:"5s",children:e("mpath",{href:"#jsx-orbit"})})})}),e("g",{mask:"url(#state-mask)",children:e("g",{transform:"translate(-360, -440)",children:e("path",{id:"state",d:"M361 401L390.445 452H331.555L361 401Z",fill:"#FF002E",children:e("animateMotion",{repeatCount:"indefinite",dur:"5s",begin:"-2s",children:e("mpath",{href:"#state-orbit"})})})})}),e("g",{mask:"url(#tag-mask)",children:e("rect",{id:"tag",x:"-24",y:"-24",width:"49",height:"49",fill:"#00BA6C",children:e("animateMotion",{repeatCount:"indefinite",dur:"5s",begin:"-2s",children:e("mpath",{href:"#tag-orbit"})})})}),e("mask",{id:"state-mask",children:[e("rect",{width:"100%",height:"100%",fill:"white"}),e("path",{"fill-rule":"evenodd","clip-rule":"evenodd",d:"M393.242 167.059C346.988 86.9454 244.547 59.4963 164.433 105.75C164.289 105.834 164.144 105.917 164 106.001L331.5 396.118C331.644 396.035 331.789 395.952 331.933 395.869C412.047 349.615 439.496 247.173 393.242 167.059Z",fill:"black"})]}),e("mask",{id:"tag-mask",children:[e("rect",{width:"100%",height:"100%",fill:"white"}),e("path",{id:"tag-mask","fill-rule":"evenodd","clip-rule":"evenodd",d:"M249.5 83C156.993 83 82.0005 157.992 82.0005 250.5C82.0005 250.667 82.0007 250.833 82.0012 251L417 251C417 250.833 417 250.667 417 250.5C417 157.992 342.008 83 249.5 83Z",fill:"black"})]}),e("mask",{id:"jsx-mask",children:[e("rect",{width:"100%",height:"100%",fill:"white"}),e("path",{id:"jsx-mask","fill-rule":"evenodd","clip-rule":"evenodd",d:"M104.75 167.059C58.4961 247.173 85.9452 349.615 166.059 395.869C166.204 395.952 166.348 396.035 166.493 396.118L333.992 106.001C333.848 105.917 333.704 105.833 333.559 105.75C253.445 59.4962 151.004 86.9452 104.75 167.059Z",fill:"black"})]})]})}function G(t){return e("textarea",{style:{background:"lightgray",border:"none",outline:"none",padding:10,borderRadius:10,resize:"none",alignSelf:"normal",fontFamily:"sans-serif"},...t})}function W(t){let{size:n=20,color:i="black",rotate:r=!0,...o}=t;return e("svg",{style:{width:n,height:n},viewBox:"0 0 50 50",...o,children:[e("title",{children:"Loader"}),e("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M36.7915 44.2353C36.0298 43.0573 36.4012 41.4938 37.4959 40.6167C42.0705 36.9515 45 31.3179 45 25C45 13.9543 36.0457 5 25 5C13.9543 5 5 13.9543 5 25C5 31.3179 7.92945 36.9515 12.5041 40.6167C13.5989 41.4938 13.9702 43.0573 13.2085 44.2353V44.2353C12.4716 45.3748 10.9497 45.7256 9.87005 44.9036C3.87179 40.3369 0 33.1206 0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 33.1206 46.1282 40.3369 40.1299 44.9036C39.0503 45.7256 37.5284 45.3748 36.7915 44.2353V44.2353Z",fill:i,children:e("animateTransform",{attributeName:"transform",attributeType:"xml",type:"rotate",from:"0 25 25",to:"360 25 25",dur:"1s",repeatCount:r?"indefinite":0,begin:"0s"})})]})}function F(t){let{size:n=24,stroke:i=3,color:r="blue",...o}=t;return e("svg",{style:{width:n,height:n},viewBox:"0 0 50 50",fill:"none",...o,children:[e("title",{children:"Branch"}),e("circle",{cx:"9",cy:"41",r:"6.5",stroke:r,strokeWidth:i}),e("circle",{cx:"41",cy:"9",r:"6.5",stroke:r,strokeWidth:i}),e("circle",{cx:"9",cy:"9",r:"6.5",stroke:r,strokeWidth:i}),e("path",{d:"M9 34.5V15.5",stroke:r,strokeWidth:i}),e("path",{d:"M9 34C9 27 17.5 25.5 25.5 25.5C33.5 25.5 41 23 41 15.5",stroke:r,strokeWidth:i})]})}let $=()=>Math.floor(256*Math.random()).toString(16).padStart(2,"0");function U(){let[t,n]=E(1),i={current:void 0};return function(e){var t;let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];I.context||c("Hooks can only be used inside a JSX component.","warning");let i=null===(t=I.context)||void 0===t?void 0:t.dependencies,r=null==i?void 0:i.get(e);r&&function(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n+=1)if(e[n]!==t[n])return!1;return!0}(n,r)||I.effects.push(e),null==i||i.set(e,n)}(()=>{i.current.style.backgroundColor=`#${$()}${$()}${$()}`,i.current.style.color="white"}),e(Z,{ref:i,onClick:()=>n(t+1),children:["Increment: ",t]})}function P(){let[t,n]=E("World!");return e(T,{children:[e(H,{placeholder:"Hello?",value:t,onInput:e=>n(e.target.value)}),e("p",{children:["Uppercase Value: ",t.toUpperCase()]})]})}!function(e,t){t||(t=document.body),j.has(t)?A(t):t.innerHTML="";let n={native:t,props:{children:[e]},previous:void 0,unmount:()=>A(t)},i={root:n,deletions:[],current:void 0,dependencies:new Map,pending:[n],rendered:[]};j.set(t,i),i.deletions=[],u(e=>x(e,i))}(e("div",{style:{fontFamily:"sans-serif",display:"flex",gap:"10px",flexDirection:"column"},children:[e("img",{src:N,alt:"epic-jsx Logo",style:{width:"10vw",height:"10vw",alignSelf:"center"}}),e(z,{Tag:"h1",children:"epic-jsx Demo"}),e(z,{Tag:"h2",children:"Features"}),e(function(t){let{tabs:n,children:i}=t,[r,o]=E(0);return e("div",{children:[e("header",{style:S,children:n.map((t,n)=>e("button",{onClick:()=>o(n),style:{...R,...n===r&&B},children:t}))}),e("main",{style:V,children:i[r]})]})},{tabs:["Basic","Interactive","State","SVG"],children:[e(function(){return e("div",{children:[e(z,{Tag:"h3",children:"HTML Tags"}),e("div",{children:["Hello ",e("button",{children:"World"})," Links ",e("a",{href:"https://google.com",children:"are"})," showing up! \uD83D\uDE0A"]}),e(z,{Tag:"h3",children:"Attributes"}),e(Z,{tabIndex:-1,"aria-label":"labelled",children:"Can't focus me."}),e(Z,{tabIndex:0,children:"Focus me instead."}),e(z,{Tag:"h3",children:"Event listeners"}),e(Z,{onClick:()=>alert("click"),children:"Event listeners"})]})},{}),e(function(){return e("div",{children:e(z,{Tag:"h3",children:"Events"})})},{}),e(function(){return e("div",{children:[e(z,{Tag:"h3",children:"useState (Legacy Hook Support)"}),e(P,{}),e(z,{Tag:"h3",children:"useState, useRef and useEffect"}),e(U,{})]})},{}),e(function(){return e("div",{children:[e(W,{}),e(F,{size:40})]})},{})]}),e("section",{style:{display:"flex",justifyContent:"center",padding:50},children:e(function(){let[t,n]=E(""),[i,r]=E(""),[o,l]=E(!1),[a,d]=E(!1),[c,s]=E(!1),[u,p]=E(10),h=function(e){return arguments.length>1&&void 0!==arguments[1]&&arguments[1],e}(function(e){if(e.preventDefault(),a){s(!0),p(10),d(!1),n(""),r("");return}s(!1),l(!0),p(u-1);let t=u-1,i=setInterval(()=>{p(--t),0===t&&(clearInterval(i),l(!1),d(!0))},1e3)},[u,p]);return e("form",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"normal",boxShadow:"2px 2px 5px 1px lightgray",padding:20,gap:20,width:300},children:[e("style",{children:`@keyframes pulsate {
    0% { 
        opacity: 0.5;
    }
    50% { 
        opacity: 1.0;
    }
    100% { 
        opacity: 0.5;
    }
}`}),e("h2",{style:{margin:0},children:"Contact Us"}),e(H,{placeholder:"Your name",value:t,onInput:e=>n(e.target.value)}),e(G,{placeholder:"Please enter your message",rows:4,value:i,onInput:e=>r(e.target.value)}),e(Z,{type:"submit",onClick:h,inactive:o,children:o?"Please wait...":a?"Confirm":"Submit"}),o&&e("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:20},children:[e("p",{style:{animation:"pulsate 3s ease-out",animationIterationCount:"infinite",opacity:.5,margin:0},children:["Checking connection: ",e("span",{style:{fontWeight:"bold",background:"gray",padding:10,borderRadius:10},children:u})]}),e(O,{})]}),c&&e("p",{style:{margin:0},children:"Message submitted!"})]})},{})}),e("aside",{style:{position:"absolute",bottom:20,right:30,left:40,display:"flex",flex:1,justifyContent:"space-between",alignItems:"center"},children:[e("div",{style:{fontWeight:"bold"},children:"A better React."}),e("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e("div",{children:[e("span",{style:{color:"gray"},children:"npmjs.com/"}),e("span",{style:{color:"black"},children:"epic-jsx"})]}),e("img",{src:N,alt:"epic-jsx Logo",style:{width:50,height:50}})]})]})]}))})()})();