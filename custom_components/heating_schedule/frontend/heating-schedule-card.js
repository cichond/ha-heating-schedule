function t(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),r=new WeakMap;let n=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(e,t))}return t}toString(){return this.cssText}};const o=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:a,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:l,getOwnPropertySymbols:d,getPrototypeOf:p}=Object,u=globalThis,_=u.trustedTypes,f=_?_.emptyScript:"",g=u.reactiveElementPolyfillSupport,m=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},$=(t,e)=>!a(t,e),v={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&h(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);r?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...l(t),...d(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(o(t))}else void 0!==t&&e.push(o(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:y).toAttribute(e,s.type);this._$Em=t,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=i;const n=r.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(void 0!==t){const n=this.constructor;if(!1===i&&(r=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??$)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[m("elementProperties")]=new Map,b[m("finalized")]=new Map,g?.({ReactiveElement:b}),(u.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,w=t=>t,A=x.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,k="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,C="?"+E,P=`<${C}>`,T=document,M=()=>T.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,U="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,N=/>/g,R=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,I=/"/g,L=/^(?:script|style|textarea|title)$/i,W=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),B=W(1),F=W(2),q=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),K=new WeakMap,Y=T.createTreeWalker(T,129);function J(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const Z=(t,e)=>{const s=t.length-1,i=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=D;for(let e=0;e<s;e++){const s=t[e];let a,h,c=-1,l=0;for(;l<s.length&&(o.lastIndex=l,h=o.exec(s),null!==h);)l=o.lastIndex,o===D?"!--"===h[1]?o=H:void 0!==h[1]?o=N:void 0!==h[2]?(L.test(h[2])&&(r=RegExp("</"+h[2],"g")),o=R):void 0!==h[3]&&(o=R):o===R?">"===h[0]?(o=r??D,c=-1):void 0===h[1]?c=-2:(c=o.lastIndex-h[2].length,a=h[1],o=void 0===h[3]?R:'"'===h[3]?I:j):o===I||o===j?o=R:o===H||o===N?o=D:(o=R,r=void 0);const d=o===R&&t[e+1].startsWith("/>")?" ":"";n+=o===D?s+P:c>=0?(i.push(a),s.slice(0,c)+k+s.slice(c)+E+d):s+E+(-2===c?e:d)}return[J(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class G{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[h,c]=Z(t,e);if(this.el=G.createElement(h,s),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=Y.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(k)){const e=c[n++],s=i.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:s,ctor:"."===o[1]?st:"?"===o[1]?it:"@"===o[1]?rt:et}),i.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:r}),i.removeAttribute(t));if(L.test(i.tagName)){const t=i.textContent.split(E),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],M()),Y.nextNode(),a.push({type:2,index:++r});i.append(t[e],M())}}}else if(8===i.nodeType)if(i.data===C)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=i.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const s=T.createElement("template");return s.innerHTML=t,s}}function X(t,e,s=t,i){if(e===q)return e;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const n=O(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(e=X(t,r._$AS(t,e.values),r,i)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??T).importNode(e,!0);Y.currentNode=i;let r=Y.nextNode(),n=0,o=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new tt(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new nt(r,this,t)),this._$AV.push(e),a=s[++o]}n!==a?.index&&(r=Y.nextNode(),n++)}return Y.currentNode=T,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),O(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=G.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Q(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new G(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new tt(this.O(M()),this.O(M()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=V}_$AI(t,e=this,s,i){const r=this.strings;let n=!1;if(void 0===r)t=X(this,t,e,0),n=!O(t)||t!==this._$AH&&t!==q,n&&(this._$AH=t);else{const i=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=X(this,i[s+o],e,o),a===q&&(a=this._$AH[o]),n||=!O(a)||a!==this._$AH[o],a===V?t=V:t!==V&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!i&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}class it extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}}class rt extends et{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??V)===q)return;const s=this._$AH,i=t===V&&s!==V||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==V&&(s===V||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const ot=x.litHtmlPolyfillSupport;ot?.(G,tt),(x.litHtmlVersions??=[]).push("3.3.3");const at=globalThis;class ht extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let r=i._$litPart$;if(void 0===r){const t=s?.renderBefore??null;i._$litPart$=r=new tt(e.insertBefore(M(),t),t,void 0,s??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}ht._$litElement$=!0,ht.finalized=!0,at.litElementHydrateSupport?.({LitElement:ht});const ct=at.litElementPolyfillSupport;ct?.({LitElement:ht}),(at.litElementVersions??=[]).push("4.2.2");const lt={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:$},dt=(t=lt,e,s)=>{const{kind:i,metadata:r}=s;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),n.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const r=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,r,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];e.call(this,s),this.requestUpdate(i,r,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};function pt(t){return(e,s)=>"object"==typeof s?dt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function ut(t){return pt({...t,state:!0,attribute:!1})}const _t={en:{days:["Mo","Tu","We","Th","Fr","Sa","Su"],schedule:"Schedule",now:"Now",target:"target",next:"next",at:"at",mode_off:"off",mode_heat:"heating",off_hint:"The thermostat is off. The schedule only sets the target temperature.",legend_schedule:"schedule",legend_current:"temperature",legend_target:"actual target",history_from:"history from",edit:"Edit",save:"Save",cancel:"Cancel",split:"Split",remove:"Remove",copy:"Copy day to…",copy_apply:"Copy",workdays:"Mon–Fri",weekend:"Weekend",all:"All",edit_hint:"Drag a level up or down, drag a boundary sideways. Double-click a level to split it. Tap a level for more options.",not_found:"This thermostat has no schedule. Add it under Settings → Devices & services → Heating Schedule."},pl:{days:["Pn","Wt","Śr","Cz","Pt","So","Nd"],schedule:"Harmonogram",now:"Teraz",target:"zadana",next:"następnie",at:"o",mode_off:"wyłączony",mode_heat:"grzanie",off_hint:"Termostat jest wyłączony. Harmonogram ustawia tylko temperaturę zadaną.",legend_schedule:"harmonogram",legend_current:"temperatura",legend_target:"zadana (faktyczna)",history_from:"historia z",edit:"Edytuj",save:"Zapisz",cancel:"Anuluj",split:"Podziel",remove:"Usuń",copy:"Kopiuj dzień na…",copy_apply:"Kopiuj",workdays:"Pn–Pt",weekend:"Weekend",all:"Wszystkie",edit_hint:"Przeciągnij poziom w górę lub w dół, a granicę w bok. Dwuklik na poziomie dzieli go na dwa. Dotknij poziomu, żeby zobaczyć więcej opcji.",not_found:"Ten termostat nie ma harmonogramu. Dodaj go w Ustawienia → Urządzenia i usługi → Harmonogram ogrzewania."}};const ft=["mon","tue","wed","thu","fri","sat","sun"],gt=1440;function mt(t){const[e,s]=t.split(":").map(Number);return 60*e+s}function yt(t){const e=Math.floor(t/60),s=Math.round(t%60);return`${String(e).padStart(2,"0")}:${String(s).padStart(2,"0")}`}function $t(t){return t.map(t=>({time:yt(t.m),temp:t.t}))}function vt(t,e){return Math.round(Math.round(t/e)*e*100)/100}function bt(t,e,s){return Math.min(s,Math.max(e,t))}function xt(t,e){return e+1<t.length?t[e+1].m:gt}function wt(t,e,s){return t.map((t,i)=>i===e?{...t,t:s}:t)}function At(t,e,s){if(e<=0||e>=t.length)return t;const i=bt(s,t[e-1].m,xt(t,e));return t.map((t,s)=>s===e?{...t,m:i}:t)}function St(t){const e=[];return t.forEach((s,i)=>{xt(t,i)<=s.m||(e.length&&e[e.length-1].m===s.m&&e.pop(),e.push(s))}),e.length?(e[0]={...e[0],m:0},e):[{m:0,t:t[t.length-1].t}]}function kt(t,e,s){const i=t[e].m,r=xt(t,e),n=vt(s??(i+r)/2,15);return n<=i||n>=r?null:[...t.slice(0,e+1),{m:n,t:t[e].t},...t.slice(e+1)]}function Et(t){return ft[(t.getDay()+6)%7]}const Ct=30,Pt=8,Tt=16,Mt=20;function Ot(t){return 60*t.getHours()+t.getMinutes()+t.getSeconds()/60}function zt(t){const e=(s=new Date,new Date(s.getFullYear(),s.getMonth(),s.getDate()));var s;const i=(ft.indexOf(Et(e))-ft.indexOf(t)+7)%7;return new Date(e.getFullYear(),e.getMonth(),e.getDate()-i)}function Ut(t){const e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}`}let Dt=class extends ht{constructor(){super(...arguments),this._day=Et(new Date),this._width=0,this._copyOpen=!1,this._copyTargets=[],this._saving=!1,this._subscribeFailed=!1}static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"climate"}}},{name:"name",selector:{text:{}}},{name:"height",selector:{number:{min:120,max:600,mode:"box",unit_of_measurement:"px"}}}]}}static getStubConfig(t){return{entity:Object.keys(t.states).find(t=>t.startsWith("climate."))??""}}setConfig(t){if(!t?.entity)throw new Error("entity is required");this._config?.entity!==t.entity&&(this._unsubscribe(),this._info=void 0,this._history=void 0,this._historyKey=void 0,this._draft=void 0,this._error=void 0,this._subscribeFailed=!1),this._config=t}getCardSize(){return 6}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}connectedCallback(){super.connectedCallback(),this._historyTimer=window.setInterval(()=>this._loadHistory(!0),3e5),this._resize=new ResizeObserver(t=>{const e=Math.floor(t[0].contentRect.width);e&&e!==this._width&&(this._width=e)}),this._observed=void 0}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribe(),window.clearInterval(this._historyTimer),this._resize?.disconnect()}updated(t){this.hass&&this._config&&!this._unsub&&!this._subscribeFailed&&this._subscribe(),(t.has("_day")||t.has("hass"))&&this._loadHistory();const e=this.renderRoot.querySelector(".chart");e&&e!==this._observed&&(this._observed=e,this._resize?.disconnect(),this._resize?.observe(e))}get _t(){return t=this.hass?.locale?.language??this.hass?.language,t?.startsWith("pl")?_t.pl:_t.en;var t}_subscribe(){const t=this._config.entity;this._unsub=this.hass.connection.subscribeMessage(t=>{this._info=t,this._error=void 0},{type:"heating_schedule/subscribe",entity_id:t}),this._unsub.catch(t=>{this._subscribeFailed=!0,this._unsub=void 0,this._error="not_found"===t?.code?this._t.not_found:t?.message??String(t)})}_unsubscribe(){this._unsub?.then(t=>t()).catch(()=>{}),this._unsub=void 0}async _loadHistory(t=!1){if(!this.hass||!this._config)return;const e=this._config.entity,s=zt(this._day),i=`${e}|${Ut(s)}`;if(!t&&i===this._historyKey)return;this._historyKey=i;const r=new Date,n=new Date(s.getFullYear(),s.getMonth(),s.getDate()+1),o=n<r?n:r;try{const t=await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:o.toISOString(),entity_ids:[e],minimal_response:!1,no_attributes:!1,significant_changes_only:!1});if(i!==this._historyKey)return;const n=[],a=[];for(const i of t[e]??[]){const t=bt((1e3*(i.lu??i.lc??0)-s.getTime())/6e4,0,gt),e=i.a??{};"number"==typeof e.current_temperature&&n.push([t,e.current_temperature]),"number"==typeof e.temperature&&a.push([t,e.temperature])}this._history={date:s,current:n,target:a,end:o===r?Ot(r):gt}}catch(t){this._history=void 0}}_week(){return this._draft??this._info?.days}_pts(t=this._day){const e=this._week();return e?function(t){return t.map(t=>({m:mt(t.time),t:t.temp}))}(e[t]):[{m:0,t:20}]}_setPts(t,e=this._day){this._draft&&(this._draft={...this._draft,[e]:$t(t)})}get _limits(){const t=this._info?.limits;return{min:t?.min??5,max:t?.max??35,step:t?.step||.5}}_fmtTemp(t){if(null==t||Number.isNaN(t))return"–";const e=this.hass?.locale?.language??this.hass?.language??"en";return`${t.toLocaleString(e,{maximumFractionDigits:1})}°`}_yRange(t){const e=t.map(t=>t.t),s=this._history;s&&Ut(s.date)===Ut(zt(this._day))&&e.push(...s.current.map(t=>t[1]));const i=this.hass?.states[this._config.entity]?.attributes.current_temperature;"number"==typeof i&&this._day===Et(new Date)&&e.push(i);let r=Math.floor(Math.min(...e))-1,n=Math.ceil(Math.max(...e))+1;if(n-r<6){const t=(6-(n-r))/2;r=Math.floor(r-t),n=Math.ceil(n+t)}return[r,n]}render(){if(!this._config)return V;const t=this._t,e=this.hass?.states[this._config.entity],s=this._config.name??e?.attributes.friendly_name??this._config.entity;return B`
      <ha-card>
        <div class="header">
          <div class="name">${s}</div>
          ${this._info?B`<label class="toggle">
                <span>${t.schedule}</span>
                <ha-switch
                  .checked=${this._info.enabled}
                  .disabled=${!!this._draft}
                  @change=${this._toggleEnabled}
                ></ha-switch>
              </label>`:V}
        </div>
        ${this._renderStatus(e)}
        ${this._error?B`<div class="error">${this._error}</div>`:V}
        ${this._info?this._renderBody():V}
      </ha-card>
    `}_renderStatus(t){if(!t)return V;const e=this._t,s=t.attributes,i="off"===t.state?e.mode_off:"heat"===t.state?e.mode_heat:t.state,r=this._info;let n=V;if(r?.enabled&&r.current.next_change&&null!==r.current.next_temp){const t=new Date(r.current.next_change),s=`${Ut(t)===Ut(new Date)?"":`${e.days[ft.indexOf(Et(t))]} `}${yt(Ot(t))}`;n=B`<span class="next">${e.next} ${this._fmtTemp(r.current.next_temp)} ${e.at} ${s}</span>`}return B`
      <div class="status">
        <span class="current">${this._fmtTemp(s.current_temperature)}</span>
        <span class="target">${e.target} ${this._fmtTemp(s.temperature)}</span>
        <span class="mode ${t.state}">${i}</span>
        ${n}
      </div>
      ${r?.enabled&&"off"===t.state?B`<div class="hint">${e.off_hint}</div>`:V}
    `}_renderBody(){const t=this._t,e=Et(new Date),s=this._history,i=s&&this._day!==e&&Ut(s.date)===Ut(zt(this._day));return B`
      <div class="days">
        ${ft.map((s,i)=>B`<button
            class="day ${s===this._day?"selected":""} ${s===e?"today":""}"
            @click=${()=>this._selectDay(s)}
          >
            ${t.days[i]}
          </button>`)}
      </div>
      <div class="chart ${this._draft?"editing":""}">${this._width?this._renderChart():V}</div>
      <div class="legend">
        <span><i class="line schedule"></i>${t.legend_schedule}</span>
        <span><i class="line current"></i>${t.legend_current}</span>
        <span><i class="line target"></i>${t.legend_target}</span>
        ${i?B`<span class="muted">${t.history_from} ${Ut(s.date)}</span>`:V}
      </div>
      ${this._draft?this._renderEditor():this._renderSummary()}
    `}_renderChart(){const t=this._pts(),e=this._width,s=this._config.height??220,[i,r]=this._range??this._yRange(t),n=e-Ct-Pt,o=s-Tt-Mt,a=t=>Ct+t/gt*n,h=t=>Tt+(r-t)/(r-i)*o;this._scale={x:a,y:h,minute:t=>(t-Ct)/n*gt,temp:t=>r-(t-Tt)/o*(r-i),lo:i,hi:r};const c=!!this._draft,l=r-i>12?2:1,d=[];for(let t=Math.ceil(i);t<=r;t+=l)d.push(t);const p=e<420?[0,6,12,18,24]:[0,3,6,9,12,15,18,21,24];let u=`M${a(0)},${h(t[0].t)}`;t.forEach((e,s)=>{u+=`H${a(xt(t,s))}`,s+1<t.length&&(u+=`V${h(t[s+1].t)}`)});const _=`${u}V${h(i)}H${a(0)}Z`,f=this._history;let g="",m="";if(f&&Ut(f.date)===Ut(zt(this._day))){const t=f.current;t.length&&(g=t.map(([t,e],s)=>`${s?"L":"M"}${a(t)},${h(bt(e,i,r))}`).join(""),g+=`L${a(f.end)},${h(bt(t[t.length-1][1],i,r))}`);const e=f.target;if(e.length){m=`M${a(e[0][0])},${h(bt(e[0][1],i,r))}`;for(let t=1;t<e.length;t++)m+=`H${a(e[t][0])}V${h(bt(e[t][1],i,r))}`;m+=`H${a(f.end)}`}}const y=this._day===Et(new Date),$=Ot(new Date),v=this.hass?.states[this._config.entity]?.attributes.current_temperature,b=this._drag;return B`<svg
      width=${e}
      height=${s}
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @dblclick=${this._onDoubleClick}
    >
      <defs>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" class="fill-top"></stop>
          <stop offset="1" class="fill-bottom"></stop>
        </linearGradient>
      </defs>
      ${d.map(t=>F`<line class="grid" x1=${Ct} x2=${e-Pt} y1=${h(t)} y2=${h(t)}></line>
          <text class="axis" x=${Ct-4} y=${h(t)+3.5} text-anchor="end">${t}°</text>`)}
      ${p.map(t=>F`<line class="grid" x1=${a(60*t)} x2=${a(60*t)} y1=${Tt} y2=${s-Mt}></line>
          <text class="axis" x=${a(60*t)} y=${s-5} text-anchor=${0===t?"start":24===t?"end":"middle"}>${t}</text>`)}
      <path class="area" d=${_}></path>
      ${m?F`<path class="target" d=${m}></path>`:V}
      ${g?F`<path class="current" d=${g}></path>`:V}
      <path class="schedule" d=${u}></path>
      ${void 0!==this._selected&&c&&t[this._selected]?F`<line class="selected" x1=${a(t[this._selected].m)} x2=${a(xt(t,this._selected))}
            y1=${h(t[this._selected].t)} y2=${h(t[this._selected].t)}></line>`:V}
      ${t.map((e,s)=>{const i=a(e.m),r=a(xt(t,s));return r-i>26?F`<text class="label" x=${(i+r)/2} y=${h(e.t)-5} text-anchor="middle">${this._fmtTemp(e.t)}</text>`:V})}
      ${y?F`<line class="now" x1=${a($)} x2=${a($)} y1=${Tt-6} y2=${s-Mt}></line>
          ${"number"==typeof v?F`<circle class="now-dot" cx=${a($)} cy=${h(bt(v,i,r))} r="4"></circle>`:V}`:V}
      ${c?F`${t.map((e,s)=>F`<rect class="hit seg" data-kind="seg" data-i=${s}
              x=${a(e.m)} y=${h(e.t)-14} width=${Math.max(0,a(xt(t,s))-a(e.m))} height="28"></rect>`)}
          ${t.slice(1).map((t,e)=>F`<rect class="hit edge" data-kind="edge" data-i=${e+1}
              x=${a(t.m)-9} y=${Tt} width="18" height=${o}></rect>`)}
          ${this._edgeLabels(t,a).map(t=>F`<text class="edge-label" x=${a(t.m)} y=${Tt-4} text-anchor="middle">${yt(t.m)}</text>`)}`:V}
      ${b?.moved?this._renderDragLabel(t,b):V}
    </svg>`}_edgeLabels(t,e){const s=t.slice(1),i=this._selected,r=new Set(void 0===i?[]:[i,i+1]),n=s.map((t,e)=>({p:t,k:e+1})).sort((t,e)=>Number(r.has(e.k))-Number(r.has(t.k))),o=[];for(const{p:t}of n)o.every(s=>Math.abs(e(s.m)-e(t.m))>=34)&&o.push(t);return o}_renderDragLabel(t,e){const s=this._scale,i=t[e.index];if(!i)return V;const r="seg"===e.kind?this._fmtTemp(i.t):`${yt(i.m)}`,n="seg"===e.kind?(s.x(i.m)+s.x(xt(t,e.index)))/2:s.x(i.m),o=s.y(i.t)-22;return F`<g class="drag-label">
      <rect x=${n-24} y=${o-12} width="48" height="18" rx="4"></rect>
      <text x=${n} y=${o+1} text-anchor="middle">${r}</text>
    </g>`}_renderSummary(){const t=this._pts();return B`
      <div class="points">
        ${t.map((e,s)=>B`<span class="chip">${yt(e.m)}–${yt(xt(t,s))}
            <b>${this._fmtTemp(e.t)}</b></span>`)}
      </div>
      <div class="actions">
        <span class="spacer"></span>
        <button class="primary" @click=${this._startEdit}>${this._t.edit}</button>
      </div>
    `}_renderEditor(){const t=this._t,e=this._pts(),s=void 0!==this._selected?e[this._selected]:void 0,{step:i}=this._limits,r=!this._info||!function(t,e){return JSON.stringify(ft.map(e=>t[e]))===JSON.stringify(ft.map(t=>e[t]))}(this._draft,this._info.days);return B`
      ${s?B`<div class="segment">
            ${this._selected>0?B`<button class="icon" @click=${()=>this._shiftStart(-15)}>‹</button>`:V}
            <span class="range">${yt(s.m)}–${yt(xt(e,this._selected))}</span>
            ${this._selected>0?B`<button class="icon" @click=${()=>this._shiftStart(15)}>›</button>`:V}
            <span class="spacer"></span>
            <button class="icon" @click=${()=>this._bump(-i)}>−</button>
            <span class="temp">${this._fmtTemp(s.t)}</span>
            <button class="icon" @click=${()=>this._bump(i)}>+</button>
            <span class="spacer"></span>
            <button @click=${this._split}>${t.split}</button>
            <button @click=${this._remove} .disabled=${e.length<=1}>${t.remove}</button>
          </div>`:B`<div class="hint">${t.edit_hint}</div>`}
      ${this._copyOpen?this._renderCopy():V}
      <div class="actions">
        <button @click=${()=>this._copyOpen=!this._copyOpen}>${t.copy}</button>
        <span class="spacer"></span>
        <button @click=${this._cancel}>${t.cancel}</button>
        <button class="primary" @click=${this._save} .disabled=${!r||this._saving}>${t.save}</button>
      </div>
    `}_renderCopy(){const t=this._t,e=t=>{this._copyTargets=this._copyTargets.includes(t)?this._copyTargets.filter(e=>e!==t):[...this._copyTargets,t]},s=t=>{this._copyTargets=t.filter(t=>t!==this._day)};return B`<div class="copy">
      ${ft.map((s,i)=>B`<button
          class="day ${this._copyTargets.includes(s)?"selected":""}"
          .disabled=${s===this._day}
          @click=${()=>e(s)}
        >
          ${t.days[i]}
        </button>`)}
      <span class="presets">
        <button @click=${()=>s(ft.slice(0,5))}>${t.workdays}</button>
        <button @click=${()=>s(ft.slice(5))}>${t.weekend}</button>
        <button @click=${()=>s(ft)}>${t.all}</button>
        <button class="primary" .disabled=${!this._copyTargets.length} @click=${this._applyCopy}>
          ${t.copy_apply}
        </button>
      </span>
    </div>`}_selectDay(t){this._day=t,this._selected=void 0,this._copyTargets=[]}_startEdit(){var t;this._info&&(this._draft=(t=this._info.days,Object.fromEntries(ft.map(e=>[e,t[e].map(t=>({...t}))]))),this._selected=void 0)}_cancel(){this._draft=void 0,this._selected=void 0,this._copyOpen=!1,this._copyTargets=[]}async _save(){if(this._draft&&this.hass){this._saving=!0;try{this._info=await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,days:this._draft}),this._cancel(),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._saving=!1}}}async _toggleEnabled(t){const e=t.target.checked;try{await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,enabled:e})}catch(t){this._error=t?.message??String(t)}}_bump(t){if(void 0===this._selected)return;const{min:e,max:s,step:i}=this._limits,r=this._pts(),n=bt(vt(r[this._selected].t+t,i),e,s);this._setPts(wt(r,this._selected,n))}_shiftStart(t){const e=this._selected;if(void 0===e||0===e)return;const s=this._pts(),i=At(s,e,s[e].m+t),r=St(i);r.length!==i.length&&(this._selected=void 0),this._setPts(r)}_split(){if(void 0===this._selected)return;const t=kt(this._pts(),this._selected);t&&(this._setPts(t),this._selected+=1)}_remove(){void 0!==this._selected&&(this._setPts(function(t,e){if(t.length<=1)return t;const s=t.filter((t,s)=>s!==e);return s[0]={...s[0],m:0},s}(this._pts(),this._selected)),this._selected=void 0)}_applyCopy(){if(!this._draft)return;const t=this._draft[this._day],e={...this._draft};for(const s of this._copyTargets)e[s]=t.map(t=>({...t}));this._draft=e,this._copyOpen=!1,this._copyTargets=[]}_local(t){const e=t.currentTarget.getBoundingClientRect();return[t.clientX-e.left,t.clientY-e.top]}_onPointerDown(t){if(!this._draft)return;const e=t.target,s=e.getAttribute("data-kind");if(!s)return void(this._selected=void 0);t.preventDefault(),t.currentTarget.setPointerCapture(t.pointerId);const i=Number(e.getAttribute("data-i"));this._range=this._yRange(this._pts()),this._drag={kind:s,index:i,pointerId:t.pointerId,x0:t.clientX,y0:t.clientY,moved:!1},"seg"===s&&(this._selected=i)}_onPointerMove(t){const e=this._drag;if(!e||t.pointerId!==e.pointerId||!this._scale)return;if(!e.moved&&Math.hypot(t.clientX-e.x0,t.clientY-e.y0)<4)return;e.moved=!0;const[s,i]=this._local(t),r=this._pts();if("seg"===e.kind){const{min:t,max:s,step:n}=this._limits,o=bt(vt(this._scale.temp(i),n),Math.max(t,this._scale.lo),Math.min(s,this._scale.hi));o!==r[e.index].t&&this._setPts(wt(r,e.index,o))}else{const t=vt(this._scale.minute(s),15);t!==r[e.index].m&&this._setPts(At(r,e.index,t))}this.requestUpdate()}_onPointerUp(t){const e=this._drag;if(e&&t.pointerId===e.pointerId){if("edge"===e.kind&&e.moved){const t=this._pts(),e=St(t);e.length!==t.length&&(this._selected=void 0),this._setPts(e)}this._drag=void 0,this._range=void 0}}_onDoubleClick(t){if(!this._draft||!this._scale)return;const e=t.target;if("seg"!==e.getAttribute("data-kind"))return;const s=Number(e.getAttribute("data-i")),[i]=this._local(t),r=kt(this._pts(),s,this._scale.minute(i));r&&(this._setPts(r),this._selected=s+1)}};Dt.styles=((t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new n(s,t,i)})`
    :host {
      --hs-schedule: var(--primary-color, #03a9f4);
      --hs-current: var(--state-climate-heat-color, #ff8100);
      --hs-target: var(--secondary-text-color, #727272);
      --hs-now: var(--error-color, #db4437);
      --hs-grid: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    ha-card {
      padding: 16px;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .name {
      font-size: 1.15em;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .status {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 12px;
      margin: 6px 0 4px;
    }
    .current {
      font-size: 1.8em;
      font-weight: 400;
    }
    .target,
    .next {
      color: var(--secondary-text-color);
    }
    .mode {
      font-size: 0.8em;
      padding: 1px 8px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: var(--secondary-text-color);
    }
    .mode.heat {
      background: var(--hs-current);
      color: #fff;
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 0.85em;
      margin: 4px 0;
    }
    .error {
      color: var(--error-color, #db4437);
      margin: 8px 0;
    }
    .days,
    .copy {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 8px 0;
    }
    .days .day {
      flex: 1;
    }
    button {
      font: inherit;
      font-size: 0.9em;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      min-width: 0;
    }
    button:disabled {
      opacity: 0.45;
      cursor: default;
    }
    button.selected,
    button.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    button.today:not(.selected) {
      border-color: var(--primary-color, #03a9f4);
    }
    button.icon {
      width: 32px;
      padding: 6px 0;
      font-size: 1.1em;
      line-height: 1;
    }
    .chart {
      width: 100%;
      min-height: 120px;
      user-select: none;
      -webkit-user-select: none;
    }
    .chart svg {
      display: block;
      overflow: visible;
    }
    .chart.editing svg {
      touch-action: none;
    }
    .grid {
      stroke: var(--hs-grid);
      stroke-width: 1;
    }
    .axis,
    .edge-label {
      fill: var(--secondary-text-color);
      font-size: 10px;
    }
    .label {
      fill: var(--hs-schedule);
      font-size: 11px;
      font-weight: 500;
    }
    .fill-top {
      stop-color: var(--hs-schedule);
      stop-opacity: 0.25;
    }
    .fill-bottom {
      stop-color: var(--hs-schedule);
      stop-opacity: 0.02;
    }
    .area {
      fill: url(#fill);
    }
    .schedule {
      fill: none;
      stroke: var(--hs-schedule);
      stroke-width: 2.5;
      stroke-linejoin: round;
    }
    svg .selected {
      stroke: var(--accent-color, #ff9800);
      stroke-width: 5;
      stroke-linecap: round;
    }
    svg .current {
      fill: none;
      stroke: var(--hs-current);
      stroke-width: 1.8;
      stroke-linejoin: round;
    }
    svg .target {
      fill: none;
      stroke: var(--hs-target);
      stroke-width: 1.5;
      stroke-dasharray: 4 3;
    }
    .now {
      stroke: var(--hs-now);
      stroke-width: 1.5;
      stroke-dasharray: 3 3;
    }
    .now-dot {
      fill: var(--hs-current);
      stroke: var(--card-background-color, #fff);
      stroke-width: 2;
    }
    .hit {
      fill: transparent;
    }
    .hit.seg {
      cursor: ns-resize;
    }
    .hit.edge {
      cursor: ew-resize;
    }
    .edge-label {
      font-size: 9px;
    }
    .drag-label rect {
      fill: var(--primary-text-color);
      opacity: 0.85;
    }
    .drag-label text {
      fill: var(--card-background-color, #fff);
      font-size: 11px;
      font-weight: 500;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-top: 4px;
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .line {
      display: inline-block;
      width: 16px;
      height: 0;
      border-top: 2.5px solid var(--hs-schedule);
    }
    .line.current {
      border-top: 2px solid var(--hs-current);
    }
    .line.target {
      border-top: 2px dashed var(--hs-target);
    }
    .muted {
      opacity: 0.8;
    }
    .points {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 10px;
    }
    .chip {
      font-size: 0.8em;
      padding: 3px 8px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .segment {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }
    .segment .range {
      font-variant-numeric: tabular-nums;
    }
    .segment .temp {
      min-width: 3em;
      text-align: center;
      font-weight: 500;
    }
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-left: auto;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .spacer {
      flex: 1;
    }
  `,t([pt({attribute:!1})],Dt.prototype,"hass",void 0),t([ut()],Dt.prototype,"_config",void 0),t([ut()],Dt.prototype,"_info",void 0),t([ut()],Dt.prototype,"_error",void 0),t([ut()],Dt.prototype,"_day",void 0),t([ut()],Dt.prototype,"_draft",void 0),t([ut()],Dt.prototype,"_selected",void 0),t([ut()],Dt.prototype,"_drag",void 0),t([ut()],Dt.prototype,"_history",void 0),t([ut()],Dt.prototype,"_width",void 0),t([ut()],Dt.prototype,"_copyOpen",void 0),t([ut()],Dt.prototype,"_copyTargets",void 0),t([ut()],Dt.prototype,"_saving",void 0),Dt=t([(t=>(e,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})("heating-schedule-card")],Dt),window.customCards=window.customCards??[],window.customCards.some(t=>"heating-schedule-card"===t.type)||window.customCards.push({type:"heating-schedule-card",name:"Heating Schedule",description:"Weekly thermostat schedule as a temperature chart, editable by dragging.",preview:!0});export{Dt as HeatingScheduleCard};
