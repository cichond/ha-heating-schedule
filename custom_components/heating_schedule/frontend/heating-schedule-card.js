function t(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),r=new WeakMap;let n=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new n(s,t,i)},a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,m=g?g.emptyScript:"",f=_.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},v=(t,e)=>!c(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:v};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&l(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);r?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:$).toAttribute(e,s.type);this._$Em=t,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=i;const n=r.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(void 0!==t){const n=this.constructor;if(!1===i&&(r=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??v)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,f?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=t=>t,A=w.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+C,T=`<${z}>`,P=document,M=()=>P.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,U="[ \t\n\f\r]",j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,N=/>/g,R=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),I=/'/g,L=/"/g,W=/^(?:script|style|textarea|title)$/i,B=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),q=B(1),F=B(2),V=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),Y=new WeakMap,Z=P.createTreeWalker(P,129);function J(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const G=(t,e)=>{const s=t.length-1,i=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=j;for(let e=0;e<s;e++){const s=t[e];let a,c,l=-1,h=0;for(;h<s.length&&(o.lastIndex=h,c=o.exec(s),null!==c);)h=o.lastIndex,o===j?"!--"===c[1]?o=H:void 0!==c[1]?o=N:void 0!==c[2]?(W.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=R):void 0!==c[3]&&(o=R):o===R?">"===c[0]?(o=r??j,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?R:'"'===c[3]?L:I):o===L||o===I?o=R:o===H||o===N?o=j:(o=R,r=void 0);const d=o===R&&t[e+1].startsWith("/>")?" ":"";n+=o===j?s+T:l>=0?(i.push(a),s.slice(0,l)+E+s.slice(l)+C+d):s+C+(-2===l?e:d)}return[J(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class X{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[c,l]=G(t,e);if(this.el=X.createElement(c,s),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=Z.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(E)){const e=l[n++],s=i.getAttribute(t).split(C),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:s,ctor:"."===o[1]?it:"?"===o[1]?rt:"@"===o[1]?nt:st}),i.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:r}),i.removeAttribute(t));if(W.test(i.tagName)){const t=i.textContent.split(C),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],M()),Z.nextNode(),a.push({type:2,index:++r});i.append(t[e],M())}}}else if(8===i.nodeType)if(i.data===z)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=i.data.indexOf(C,t+1));)a.push({type:7,index:r}),t+=C.length-1}r++}}static createElement(t,e){const s=P.createElement("template");return s.innerHTML=t,s}}function Q(t,e,s=t,i){if(e===V)return e;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const n=O(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,i)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??P).importNode(e,!0);Z.currentNode=i;let r=Z.nextNode(),n=0,o=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new et(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new ot(r,this,t)),this._$AV.push(e),a=s[++o]}n!==a?.index&&(r=Z.nextNode(),n++)}return Z.currentNode=P,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),O(t)?t===K||null==t||""===t?(this._$AH!==K&&this._$AR(),this._$AH=K):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==K&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=X.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new tt(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new X(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new et(this.O(M()),this.O(M()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=K,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=K}_$AI(t,e=this,s,i){const r=this.strings;let n=!1;if(void 0===r)t=Q(this,t,e,0),n=!O(t)||t!==this._$AH&&t!==V,n&&(this._$AH=t);else{const i=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=Q(this,i[s+o],e,o),a===V&&(a=this._$AH[o]),n||=!O(a)||a!==this._$AH[o],a===K?t=K:t!==K&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!i&&this.j(t)}j(t){t===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===K?void 0:t}}class rt extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==K)}}class nt extends st{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??K)===V)return;const s=this._$AH,i=t===K&&s!==K||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==K&&(s===K||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=w.litHtmlPolyfillSupport;at?.(X,et),(w.litHtmlVersions??=[]).push("3.3.3");const ct=globalThis;class lt extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let r=i._$litPart$;if(void 0===r){const t=s?.renderBefore??null;i._$litPart$=r=new et(e.insertBefore(M(),t),t,void 0,s??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}}lt._$litElement$=!0,lt.finalized=!0,ct.litElementHydrateSupport?.({LitElement:lt});const ht=ct.litElementPolyfillSupport;ht?.({LitElement:lt}),(ct.litElementVersions??=[]).push("4.2.2");const dt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:v},pt=(t=dt,e,s)=>{const{kind:i,metadata:r}=s;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),n.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const r=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,r,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];e.call(this,s),this.requestUpdate(i,r,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ut(t){return(e,s)=>"object"==typeof s?pt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function _t(t){return ut({...t,state:!0,attribute:!1})}const gt={en:{days:["Mo","Tu","We","Th","Fr","Sa","Su"],schedule:"Schedule",now:"Now",target:"target",next:"next",at:"at",mode_off:"off",mode_heat:"heating",off_hint:"The thermostat is off. The schedule only sets the target temperature.",legend_schedule:"schedule",legend_current:"temperature",legend_target:"actual target",history_from:"history from",edit:"Edit",save:"Save",cancel:"Cancel",split:"Split",remove:"Remove",copy:"Copy day to…",copy_apply:"Copy",workdays:"Mon–Fri",weekend:"Weekend",all:"All",edit_hint:"Drag a level up or down, drag a boundary sideways. Double-click a level to split it. Tap a level for more options.",legend_typical:"typical presence",legend_presence:"presence that day",legend_heating:"heating",suggest_apply:"Apply",suggest_dismiss:"Dismiss",suggest_lower_at:"Lower to {temp} at {to} instead of {from}",suggest_raise_at:"{temp} from {to} instead of {from}",suggest_setback:"Lower to {temp} {start}–{end}",suggest_temp:"{temp} instead of {from_temp}, {start}–{end}",weeks:"wk",panel_title:"Heating",panel_settings:"Settings",panel_empty:"No thermostats yet. Add one with the + button.",panel_no_floor:"Other",panel_add:"Add thermostat",add_apply:"Add",field_entity:"Thermostat",field_title:"Name",field_presence_entities:"Room presence entities (any of them)",presence_help:"The room is occupied when any presence entity is on (OR) (person / device tracker: home). These entities also build the typical-presence profile. They are shown on the chart and do not change the temperature.",remove_schedule:"Remove schedule",remove_confirm:"Remove the schedule of {name}? Its schedule, switch and sensors will be deleted.",not_found:"This thermostat has no schedule. Add it under Settings → Devices & services → Heating Schedule."},pl:{days:["Pn","Wt","Śr","Cz","Pt","So","Nd"],schedule:"Harmonogram",now:"Teraz",target:"zadana",next:"następnie",at:"o",mode_off:"wyłączony",mode_heat:"grzanie",off_hint:"Termostat jest wyłączony. Harmonogram ustawia tylko temperaturę zadaną.",legend_schedule:"harmonogram",legend_current:"temperatura",legend_target:"zadana (faktyczna)",history_from:"historia z",edit:"Edytuj",save:"Zapisz",cancel:"Anuluj",split:"Podziel",remove:"Usuń",copy:"Kopiuj dzień na…",copy_apply:"Kopiuj",workdays:"Pn–Pt",weekend:"Weekend",all:"Wszystkie",edit_hint:"Przeciągnij poziom w górę lub w dół, a granicę w bok. Dwuklik na poziomie dzieli go na dwa. Dotknij poziomu, żeby zobaczyć więcej opcji.",legend_typical:"typowa obecność",legend_presence:"obecność tego dnia",legend_heating:"grzanie",suggest_apply:"Zastosuj",suggest_dismiss:"Odrzuć",suggest_lower_at:"Obniżka do {temp} o {to} zamiast {from}",suggest_raise_at:"{temp} od {to} zamiast {from}",suggest_setback:"Obniżka do {temp} w godz. {start}–{end}",suggest_temp:"{temp} zamiast {from_temp} w godz. {start}–{end}",weeks:"tyg.",panel_title:"Ogrzewanie",panel_settings:"Ustawienia",panel_empty:"Brak termostatów. Dodaj pierwszy przyciskiem +.",panel_no_floor:"Inne",panel_add:"Dodaj termostat",add_apply:"Dodaj",field_entity:"Termostat",field_title:"Nazwa",field_presence_entities:"Encje obecności w pokoju (wystarczy dowolna)",presence_help:"Pokój jest zajęty, gdy którakolwiek encja obecności jest włączona (LUB) (osoba / urządzenie: w domu). Z tych encji powstaje też profil typowej obecności. Są pokazywane na wykresie i nie zmieniają temperatury.",remove_schedule:"Usuń harmonogram",remove_confirm:"Usunąć harmonogram termostatu {name}? Harmonogram, przełącznik i sensory zostaną usunięte.",not_found:"Ten termostat nie ma harmonogramu. Dodaj go w Ustawienia → Urządzenia i usługi → Harmonogram ogrzewania."}};function mt(t){return t?.startsWith("pl")?gt.pl:gt.en}const ft=["mon","tue","wed","thu","fri","sat","sun"],yt=1440;function $t(t){const[e,s]=t.split(":").map(Number);return 60*e+s}function vt(t){const e=Math.floor(t/60),s=Math.round(t%60);return`${String(e).padStart(2,"0")}:${String(s).padStart(2,"0")}`}function bt(t){return t.map(t=>({time:vt(t.m),temp:t.t}))}function xt(t,e){return Math.round(Math.round(t/e)*e*100)/100}function wt(t,e,s){return Math.min(s,Math.max(e,t))}function kt(t,e){return e+1<t.length?t[e+1].m:yt}function At(t,e){let s=t[0].t;for(const i of t){if(i.m>e)break;s=i.t}return s}function St(t,e,s){return t.map((t,i)=>i===e?{...t,t:s}:t)}function Et(t,e,s){if(e<=0||e>=t.length)return t;const i=wt(s,t[e-1].m,kt(t,e));return t.map((t,s)=>s===e?{...t,m:i}:t)}function Ct(t){const e=[];return t.forEach((s,i)=>{kt(t,i)<=s.m||(e.length&&e[e.length-1].m===s.m&&e.pop(),e.push(s))}),e.length?(e[0]={...e[0],m:0},e):[{m:0,t:t[t.length-1].t}]}function zt(t,e,s){const i=t[e].m,r=kt(t,e),n=xt(s??(i+r)/2,15);return n<=i||n>=r?null:[...t.slice(0,e+1),{m:n,t:t[e].t},...t.slice(e+1)]}function Tt(t){return ft[(t.getDay()+6)%7]}const Pt=["mon","tue","wed","thu","fri","sat","sun"];function Mt(t){const e=Math.floor(t/60),s=Math.round(t%60);return`${e}:${String(s).padStart(2,"0")}`}function Ot(t,e,s,i){const r=t.params;let n;if("shift"===t.kind){const o=function(t,e,s){const i=t?.[e];if(!i?.length)return;let r=i[0].temp;for(const t of i){const[e,i]=t.time.split(":").map(Number);if(60*e+i>=s)break;r=t.temp}return r}(e,t.days[0],r.from??t.start);n=(void 0!==o&&(r.temp??t.temp)<o?s.suggest_lower_at:s.suggest_raise_at).replace("{temp}",i(r.temp??t.temp)).replace("{to}",Mt(r.to??t.start)).replace("{from}",Mt(r.from??t.end))}else n="setback"===t.kind?s.suggest_setback.replace("{temp}",i(t.temp)).replace("{start}",Mt(t.start)).replace("{end}",Mt(t.end)):s.suggest_temp.replace("{temp}",i(t.temp)).replace("{from_temp}",i(r.from_temp??t.temp)).replace("{start}",Mt(t.start)).replace("{end}",Mt(t.end));const o=function(t,e){const s=[...new Set(t)].map(t=>Pt.indexOf(t)).sort((t,e)=>t-e);if(7===s.length)return"";const i=s.join(",");if("0,1,2,3,4"===i)return e.workdays;if("5,6"===i)return e.weekend;const r=t=>e.days[t],n=s.every((t,e)=>0===e||t===s[e-1]+1);return n&&s.length>2?`${r(s[0])}–${r(s[s.length-1])}`:s.map(r).join(", ")}(t.days,s);return o?`${n} (${o})`:n}const Dt=30,Ut=8,jt=16,Ht=20;function Nt(t){return 60*t.getHours()+t.getMinutes()+t.getSeconds()/60}function Rt(t){const e=(s=new Date,new Date(s.getFullYear(),s.getMonth(),s.getDate()));var s;const i=(ft.indexOf(Tt(e))-ft.indexOf(t)+7)%7;return new Date(e.getFullYear(),e.getMonth(),e.getDate()-i)}function It(t){const e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}`}class Lt extends lt{constructor(){super(...arguments),this._day=Tt(new Date),this._width=0,this._copyOpen=!1,this._copyTargets=[],this._saving=!1,this._subscribeFailed=!1}static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"climate"}}},{name:"name",selector:{text:{}}},{name:"height",selector:{number:{min:120,max:600,mode:"box",unit_of_measurement:"px"}}}]}}static getStubConfig(t){return{entity:Object.keys(t.states).find(t=>t.startsWith("climate."))??""}}setConfig(t){if(!t?.entity)throw new Error("entity is required");this._config?.entity!==t.entity&&(this._unsubscribe(),this._info=void 0,this._history=void 0,this._historyKey=void 0,this._draft=void 0,this._error=void 0,this._subscribeFailed=!1),this._config=t}getCardSize(){return 6}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}connectedCallback(){super.connectedCallback(),this._historyTimer=window.setInterval(()=>this._loadHistory(!0),3e5),this._resize=new ResizeObserver(t=>{const e=Math.floor(t[0].contentRect.width);e&&e!==this._width&&(this._width=e)}),this._observed=void 0}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribe(),window.clearInterval(this._historyTimer),window.clearTimeout(this._hoverTimer),this._resize?.disconnect()}updated(t){this.hass&&this._config&&!this._unsub&&!this._subscribeFailed&&this._subscribe(),(t.has("_day")||t.has("hass")||t.has("_info"))&&this._loadHistory();const e=this.renderRoot.querySelector(".chart");e&&e!==this._observed&&(this._observed=e,this._resize?.disconnect(),this._resize?.observe(e))}get _t(){return mt(this.hass?.locale?.language??this.hass?.language)}_subscribe(){const t=this._config.entity;this._unsub=this.hass.connection.subscribeMessage(t=>{this._info=t,this._error=void 0},{type:"heating_schedule/subscribe",entity_id:t}),this._unsub.catch(t=>{this._subscribeFailed=!0,this._unsub=void 0,this._error="not_found"===t?.code?this._t.not_found:t?.message??String(t)})}_unsubscribe(){this._unsub?.then(t=>t()).catch(()=>{}),this._unsub=void 0}get _presence(){return!!this._info?.presence?.entities.length}async _loadHistory(t=!1){if(!this.hass||!this._config)return;const e=this._config.entity,s=this._presence?this._info?.occupancy_entity??null:null,i=Rt(this._day),r=`${e}|${s}|${It(i)}`;if(!t&&r===this._historyKey)return;this._historyKey=r;const n=new Date,o=new Date(i.getFullYear(),i.getMonth(),i.getDate()+1),a=o<n?o:n;try{const t=await this.hass.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:a.toISOString(),entity_ids:s?[e,s]:[e],minimal_response:!1,no_attributes:!1,significant_changes_only:!1});if(r!==this._historyKey)return;const o=a===n?Nt(n):yt,c=[],l=[],h=[];let d;for(const s of t[e]??[]){const t=wt((1e3*(s.lu??s.lc??0)-i.getTime())/6e4,0,yt),e=s.a??{};"number"==typeof e.current_temperature&&c.push([t,e.current_temperature]),"number"==typeof e.temperature&&l.push([t,e.temperature]);const r="heating"===e.hvac_action;r&&void 0===d&&(d=t),r||void 0===d||(t>d&&h.push([d,t]),d=void 0)}void 0!==d&&o>d&&h.push([d,o]);const p=t=>wt((1e3*(t.lu??t.lc??0)-i.getTime())/6e4,0,yt),u=[],_=s?t[s]??[]:[];_.forEach((t,e)=>{if("on"!==t.s)return;const s=p(t),i=e+1<_.length?p(_[e+1]):o;i>s&&u.push([s,i])}),this._history={date:i,current:c,target:l,occupied:u,heating:h,end:o}}catch(t){this._history=void 0}}_week(){return this._draft??this._info?.days}_pts(t=this._day){const e=this._week();return e?function(t){return t.map(t=>({m:$t(t.time),t:t.temp}))}(e[t]):[{m:0,t:20}]}_setPts(t,e=this._day){this._draft&&(this._draft={...this._draft,[e]:bt(t)})}get _limits(){const t=this._info?.limits;return{min:t?.min??5,max:t?.max??35,step:t?.step||.5}}_fmtTemp(t){if(null==t||Number.isNaN(t))return"–";const e=this.hass?.locale?.language??this.hass?.language??"en";return`${t.toLocaleString(e,{maximumFractionDigits:1})}°`}_yRange(t){const e=t.map(t=>t.t),s=this._history;s&&It(s.date)===It(Rt(this._day))&&e.push(...s.current.map(t=>t[1]));const i=this.hass?.states[this._config.entity]?.attributes.current_temperature;"number"==typeof i&&this._day===Tt(new Date)&&e.push(i);let r=Math.floor(Math.min(...e))-1,n=Math.ceil(Math.max(...e))+1;if(n-r<6){const t=(6-(n-r))/2;r=Math.floor(r-t),n=Math.ceil(n+t)}return[r,n]}render(){if(!this._config)return K;const t=this._t,e=this.hass?.states[this._config.entity],s=this._config.name??this._info?.title??e?.attributes.friendly_name??this._config.entity;return q`
      <ha-card>
        <div class="header">
          <div class="name">${s}</div>
          <div class="header-end">
            ${this._info?q`<label class="toggle">
                  <span>${t.schedule}</span>
                  <ha-switch
                    .checked=${this._info.enabled}
                    .disabled=${!!this._draft}
                    @change=${this._toggleEnabled}
                  ></ha-switch>
                </label>`:K}
            ${this._config.settings&&this._info&&!1!==this.hass?.user?.is_admin?q`<button
                  class="settings"
                  title=${t.panel_settings}
                  aria-label=${t.panel_settings}
                  @click=${this._openSettings}
                >
                  <ha-icon icon="mdi:cog"></ha-icon>
                </button>`:K}
          </div>
        </div>
        ${this._renderStatus(e)}
        ${this._error?q`<div class="error">${this._error}</div>`:K}
        ${this._info?this._renderBody():K}
      </ha-card>
    `}_openSettings(){this.dispatchEvent(new CustomEvent("heating-schedule-settings",{detail:{info:this._info},bubbles:!0,composed:!0}))}_renderStatus(t){if(!t)return K;const e=this._t,s=t.attributes,i="off"===t.state?e.mode_off:"heat"===t.state?e.mode_heat:t.state,r="off"===t.state?"mdi:fire-off":"heat"===t.state?"mdi:fire":"mdi:thermostat",n=this._info;let o=K;if(n?.enabled&&n.current.next_change&&null!==n.current.next_temp){const t=new Date(n.current.next_change),s=`${It(t)===It(new Date)?"":`${e.days[ft.indexOf(Tt(t))]} `}${vt(Nt(t))}`;o=q`<span class="next">${e.next} ${this._fmtTemp(n.current.next_temp)} ${e.at} ${s}</span>`}return q`
      <div class="status">
        <span class="current">${this._fmtTemp(s.current_temperature)}</span>
        <span class="target">${e.target} ${this._fmtTemp(s.temperature)}</span>
        <ha-icon class="mode ${t.state}" icon=${r} title=${i} aria-label=${i}></ha-icon>
        ${o}
      </div>
      ${n?.enabled&&"off"===t.state?q`<div class="hint">${e.off_hint}</div>`:K}
    `}_renderBody(){const t=this._t,e=Tt(new Date),s=this._history,i=!!s&&It(s.date)===It(Rt(this._day)),r=i&&this._day!==e,n=i?s.heating.reduce((t,[e,s])=>t+s-e,0):0;return q`
      <div class="days">
        ${ft.map((s,i)=>q`<button
            class="day ${s===this._day?"selected":""} ${s===e?"today":""}"
            @click=${()=>this._selectDay(s)}
          >
            ${t.days[i]}
          </button>`)}
      </div>
      <div class="chart ${this._draft?"editing":""}">
        ${this._width?this._renderChart():K}${this._renderTooltip()}
      </div>
      <div class="legend">
        <span><i class="line schedule"></i>${t.legend_schedule}</span>
        <span><i class="line current"></i>${t.legend_current}</span>
        <span><i class="line target"></i>${t.legend_target}</span>
        ${n?q`<span><i class="swatch heating"></i>${t.legend_heating} <b>${function(t){const e=Math.round(t),s=Math.floor(e/60);return s?`${s} h ${e%60} min`:`${e} min`}(n)}</b></span>`:K}
        ${this._presence&&this._info?.occupancy_entity?q`<span><i class="swatch actual"></i>${t.legend_presence}</span>`:K}
        ${this._presence&&this._info?.profile?.weeks?q`<span
              ><i class="swatch typical"></i>${t.legend_typical} (${this._info.profile.weeks}
              ${t.weeks})</span
            >`:K}
        ${r?q`<span class="muted">${t.history_from} ${It(s.date)}</span>`:K}
      </div>
      ${this._renderSuggestions()}
      ${this._draft?this._renderEditor():this._renderSummary()}
    `}_renderChart(){const t=this._pts(),e=this._width,s=this._config.height??220,[i,r]=this._range??this._yRange(t),n=Ht+(this._presence?12:0),o=e-Dt-Ut,a=s-jt-n,c=t=>Dt+t/yt*o,l=t=>jt+(r-t)/(r-i)*a;this._scale={x:c,y:l,minute:t=>(t-Dt)/o*yt,temp:t=>r-(t-jt)/a*(r-i),lo:i,hi:r};const h=!!this._draft,d=r-i>12?2:1,p=[];for(let t=Math.ceil(i);t<=r;t+=d)p.push(t);const u=e<420?[0,6,12,18,24]:[0,3,6,9,12,15,18,21,24];let _=`M${c(0)},${l(t[0].t)}`;t.forEach((e,s)=>{_+=`H${c(kt(t,s))}`,s+1<t.length&&(_+=`V${l(t[s+1].t)}`)});const g=`${_}V${l(i)}H${c(0)}Z`,m=this._history,f=m&&It(m.date)===It(Rt(this._day));let y="",$="";if(f){const t=m.current,e=t=>l(wt(t,i,r));t.length&&(y=t.map(([t,s],i)=>`${i?"L":"M"}${c(t)},${e(s)}`).join(""),y+=`L${c(m.end)},${e(t[t.length-1][1])}`);const s=m.target;if(s.length){$=`M${c(s[0][0])},${l(wt(s[0][1],i,r))}`;for(let t=1;t<s.length;t++)$+=`H${c(s[t][0])}V${l(wt(s[t][1],i,r))}`;$+=`H${c(m.end)}`}}const v=this._day===Tt(new Date),b=Nt(new Date),x=this.hass?.states[this._config.entity]?.attributes.current_temperature,w=this._drag;return q`<svg
      width=${e}
      height=${s}
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @pointerleave=${this._onPointerLeave}
      @dblclick=${this._onDoubleClick}
    >
      <defs>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" class="fill-top"></stop>
          <stop offset="1" class="fill-bottom"></stop>
        </linearGradient>
      </defs>
      ${f?m.heating.map(([t,e])=>F`<rect class="heating" x=${c(t)} y=${jt}
              width=${Math.max(1,c(e)-c(t))} height=${a}></rect>`):K}
      ${p.map(t=>F`<line class="grid" x1=${Dt} x2=${e-Ut} y1=${l(t)} y2=${l(t)}></line>
          <text class="axis" x=${Dt-4} y=${l(t)+3.5} text-anchor="end">${t}°</text>`)}
      ${u.map(t=>F`<line class="grid" x1=${c(60*t)} x2=${c(60*t)} y1=${jt} y2=${jt+a}></line>
          <text class="axis" x=${c(60*t)} y=${s-5} text-anchor=${0===t?"start":24===t?"end":"middle"}>${t}</text>`)}
      <path class="area" d=${g}></path>
      ${this._presence&&f?m.occupied.map(([t,e])=>F`<rect class="presence-strip" x=${c(t)} y=${jt+a+1}
              width=${Math.max(1,c(e)-c(t))} height="5"></rect>`):K}
      ${this._renderProfile(c,o,jt+a+7)}
      ${y?F`<path class="current" d=${y}></path>`:K}
      <path class="schedule" d=${_}></path>
      ${void 0!==this._selected&&h&&t[this._selected]?F`<line class="selected" x1=${c(t[this._selected].m)} x2=${c(kt(t,this._selected))}
            y1=${l(t[this._selected].t)} y2=${l(t[this._selected].t)}></line>`:K}
      ${$?F`<path class="target" d=${$}></path>`:K}
      ${t.map((e,s)=>{const i=c(e.m),r=c(kt(t,s));return r-i>26?F`<text class="label" x=${(i+r)/2} y=${l(e.t)-5} text-anchor="middle">${this._fmtTemp(e.t)}</text>`:K})}
      ${v?F`<line class="now" x1=${c(b)} x2=${c(b)} y1=${jt-6} y2=${jt+a}></line>
          ${"number"==typeof x?F`<circle class="now-dot" cx=${c(b)} cy=${l(wt(x,i,r))} r="4"></circle>`:K}`:K}
      ${h?F`${t.map((e,s)=>F`<rect class="hit seg" data-kind="seg" data-i=${s}
              x=${c(e.m)} y=${l(e.t)-14} width=${Math.max(0,c(kt(t,s))-c(e.m))} height="28"></rect>`)}
          ${t.slice(1).map((t,e)=>F`<rect class="hit edge" data-kind="edge" data-i=${e+1}
              x=${c(t.m)-9} y=${jt} width="18" height=${a}></rect>`)}
          ${this._edgeLabels(t,c).map(t=>F`<text class="edge-label" x=${c(t.m)} y=${jt-4} text-anchor="middle">${vt(t.m)}</text>`)}`:K}
      ${w?.moved?this._renderDragLabel(t,w):K}
      ${this._renderSuggestionMarkers(t,c,l,a)}
      ${this._renderCrosshair(c,l,a)}
    </svg>`}_edgeLabels(t,e){const s=t.slice(1),i=this._selected,r=new Set(void 0===i?[]:[i,i+1]),n=s.map((t,e)=>({p:t,k:e+1})).sort((t,e)=>Number(r.has(e.k))-Number(r.has(t.k))),o=[];for(const{p:t}of n)o.every(s=>Math.abs(e(s.m)-e(t.m))>=34)&&o.push(t);return o}_renderProfile(t,e,s){const i=this._presence?this._info?.profile:void 0;if(!i?.weeks)return K;const r=i.days[this._day]??[],n=e/r.length;return r.map((e,i)=>e>.02?F`<rect class="profile" x=${t(15*i)} y=${s} width=${n+.5}
            height="5" fill-opacity=${.45+.55*Math.min(1,e)}></rect>`:K)}_hoverValues(t){const e=this._history,s=!!e&&It(e.date)===It(Rt(this._day))&&t<=e.end,i=e=>{let s;for(const[i,r]of e){if(i>t)break;s=r}return s};return{schedule:At(this._pts(),t),current:s?i(e.current):void 0,target:s?i(e.target):void 0}}_renderCrosshair(t,e,s){const i=this._hover;if(void 0===i||this._draft||!this._scale)return K;const{lo:r,hi:n}=this._scale,o=this._hoverValues(i),a=t=>e(wt(t,r,n));return F`<g class="crosshair">
      <line x1=${t(i)} x2=${t(i)} y1=${jt} y2=${jt+s}></line>
      <circle class="dot schedule" cx=${t(i)} cy=${a(o.schedule)} r="3.5"></circle>
      ${void 0!==o.target?F`<circle class="dot target" cx=${t(i)} cy=${a(o.target)} r="3.5"></circle>`:K}
      ${void 0!==o.current?F`<circle class="dot current" cx=${t(i)} cy=${a(o.current)} r="3.5"></circle>`:K}
    </g>`}_renderTooltip(){const t=this._hover;if(void 0===t||this._draft||!this._scale)return K;const e=this._t,s=this._hoverValues(t),i=this._scale.x(t),r=i>this._width-160?`right:${this._width-i+12}px`:`left:${i+12}px`;return q`<div class="tooltip" style=${r}>
      <b>${vt(t)}</b>
      <div><span><i class="line schedule"></i>${e.legend_schedule}</span><span>${this._fmtTemp(s.schedule)}</span></div>
      ${void 0!==s.current?q`<div><span><i class="line current"></i>${e.legend_current}</span><span>${this._fmtTemp(s.current)}</span></div>`:K}
      ${void 0!==s.target?q`<div><span><i class="line target"></i>${e.legend_target}</span><span>${this._fmtTemp(s.target)}</span></div>`:K}
    </div>`}_renderDragLabel(t,e){const s=this._scale,i=t[e.index];if(!i)return K;const r="seg"===e.kind?this._fmtTemp(i.t):`${vt(i.m)}`,n="seg"===e.kind?(s.x(i.m)+s.x(kt(t,e.index)))/2:s.x(i.m),o=s.y(i.t)-22;return F`<g class="drag-label">
      <rect x=${n-24} y=${o-12} width="48" height="18" rx="4"></rect>
      <text x=${n} y=${o+1} text-anchor="middle">${r}</text>
    </g>`}get _suggestions(){return!this._config?.settings||this._draft?[]:this._info?.suggestions??[]}_renderSuggestionMarkers(t,e,s,i){const r=this._scale;if(!r)return K;const n=t=>s(wt(t,r.lo,r.hi));return this._suggestions.map((s,r)=>{if(!s.days.includes(this._day))return K;const o=function(t){return"shift"===t.kind?{m:t.params.to??t.start,t:t.temp}:{m:t.start,t:t.temp}}(s),a=At(t,s.start),c=Math.min(n(s.temp),n(a));return F`<g class="suggestion">
        <rect class="suggestion-diff" x=${e(s.start)} y=${c}
          width=${Math.max(1,e(s.end)-e(s.start))} height=${Math.abs(n(s.temp)-n(a))}></rect>
        <line x1=${e(o.m)} x2=${e(o.m)} y1=${n(o.t)-4} y2=${jt+i}></line>
        <circle cx=${e(o.m)} cy=${n(o.t)-13} r="9"></circle>
        <text x=${e(o.m)} y=${n(o.t)-9} text-anchor="middle">${r+1}</text>
      </g>`})}_renderSuggestions(){const t=this._suggestions;if(!t.length)return K;const e=this._t,s=t=>this._fmtTemp(t);return q`<div class="suggestions">
      ${t.map((t,i)=>q`<div class="suggestion-row">
          <span class="num">${i+1}</span>
          <span class="text">${Ot(t,this._info?.days,e,s)}</span>
          <span class="buttons">
            <button ?disabled=${!!this._suggestBusy} @click=${()=>this._suggestion("dismiss",t.id)}>
              ${e.suggest_dismiss}
            </button>
            <button
              class="primary"
              ?disabled=${!!this._suggestBusy}
              @click=${()=>this._suggestion("apply",t.id)}
            >
              ${e.suggest_apply}
            </button>
          </span>
        </div>`)}
    </div>`}async _suggestion(t,e){if(this.hass&&this._config){this._suggestBusy=e;try{const s=await this.hass.callWS({type:`heating_schedule/suggestion/${t}`,entity_id:this._config.entity,suggestion_id:e});s&&(this._info=s),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._suggestBusy=void 0}}}_renderSummary(){const t=this._pts();return q`
      <div class="points">
        ${t.map((e,s)=>q`<span class="chip">${vt(e.m)}–${vt(kt(t,s))}
            <b>${this._fmtTemp(e.t)}</b></span>`)}
      </div>
      <div class="actions">
        <span class="spacer"></span>
        <button class="primary" @click=${this._startEdit}>${this._t.edit}</button>
      </div>
    `}_renderEditor(){const t=this._t,e=this._pts(),s=void 0!==this._selected?e[this._selected]:void 0,{step:i}=this._limits,r=!this._info||!function(t,e){return JSON.stringify(ft.map(e=>t[e]))===JSON.stringify(ft.map(t=>e[t]))}(this._draft,this._info.days);return q`
      ${s?q`<div class="segment">
            ${this._selected>0?q`<button class="icon" @click=${()=>this._shiftStart(-15)}>‹</button>`:K}
            <span class="range">${vt(s.m)}–${vt(kt(e,this._selected))}</span>
            ${this._selected>0?q`<button class="icon" @click=${()=>this._shiftStart(15)}>›</button>`:K}
            <span class="spacer"></span>
            <button class="icon" @click=${()=>this._bump(-i)}>−</button>
            <span class="temp">${this._fmtTemp(s.t)}</span>
            <button class="icon" @click=${()=>this._bump(i)}>+</button>
            <span class="spacer"></span>
            <button @click=${this._split}>${t.split}</button>
            <button @click=${this._remove} .disabled=${e.length<=1}>${t.remove}</button>
          </div>`:q`<div class="hint">${t.edit_hint}</div>`}
      ${this._copyOpen?this._renderCopy():K}
      <div class="actions">
        <button @click=${()=>this._copyOpen=!this._copyOpen}>${t.copy}</button>
        <span class="spacer"></span>
        <button @click=${this._cancel}>${t.cancel}</button>
        <button class="primary" @click=${this._save} .disabled=${!r||this._saving}>${t.save}</button>
      </div>
    `}_renderCopy(){const t=this._t,e=t=>{this._copyTargets=this._copyTargets.includes(t)?this._copyTargets.filter(e=>e!==t):[...this._copyTargets,t]},s=t=>{this._copyTargets=t.filter(t=>t!==this._day)};return q`<div class="copy">
      ${ft.map((s,i)=>q`<button
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
    </div>`}_selectDay(t){this._day=t,this._selected=void 0,this._copyTargets=[]}_startEdit(){var t;this._info&&(this._draft=(t=this._info.days,Object.fromEntries(ft.map(e=>[e,t[e].map(t=>({...t}))]))),this._selected=void 0)}_cancel(){this._draft=void 0,this._selected=void 0,this._copyOpen=!1,this._copyTargets=[]}async _save(){if(this._draft&&this.hass){this._saving=!0;try{this._info=await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,days:this._draft}),this._cancel(),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._saving=!1}}}async _toggleEnabled(t){const e=t.target.checked;try{await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,enabled:e})}catch(t){this._error=t?.message??String(t)}}_bump(t){if(void 0===this._selected)return;const{min:e,max:s,step:i}=this._limits,r=this._pts(),n=wt(xt(r[this._selected].t+t,i),e,s);this._setPts(St(r,this._selected,n))}_shiftStart(t){const e=this._selected;if(void 0===e||0===e)return;const s=this._pts(),i=Et(s,e,s[e].m+t),r=Ct(i);r.length!==i.length&&(this._selected=void 0),this._setPts(r)}_split(){if(void 0===this._selected)return;const t=zt(this._pts(),this._selected);t&&(this._setPts(t),this._selected+=1)}_remove(){void 0!==this._selected&&(this._setPts(function(t,e){if(t.length<=1)return t;const s=t.filter((t,s)=>s!==e);return s[0]={...s[0],m:0},s}(this._pts(),this._selected)),this._selected=void 0)}_applyCopy(){if(!this._draft)return;const t=this._draft[this._day],e={...this._draft};for(const s of this._copyTargets)e[s]=t.map(t=>({...t}));this._draft=e,this._copyOpen=!1,this._copyTargets=[]}_local(t){const e=t.currentTarget.getBoundingClientRect();return[t.clientX-e.left,t.clientY-e.top]}_onPointerDown(t){if(!this._draft)return void this._onHover(t);const e=t.target,s=e.getAttribute("data-kind");if(!s)return void(this._selected=void 0);t.preventDefault(),t.currentTarget.setPointerCapture(t.pointerId);const i=Number(e.getAttribute("data-i"));this._range=this._yRange(this._pts()),this._drag={kind:s,index:i,pointerId:t.pointerId,x0:t.clientX,y0:t.clientY,moved:!1},"seg"===s&&(this._selected=i)}_onPointerLeave(t){window.clearTimeout(this._hoverTimer),"mouse"===t.pointerType?this._hover=void 0:this._hoverTimer=window.setTimeout(()=>this._hover=void 0,3e3)}_onHover(t){if(this._draft||!this._scale)return;window.clearTimeout(this._hoverTimer);const e=5*Math.round(this._scale.minute(this._local(t)[0])/5);this._hover=e<0||e>yt?void 0:Math.min(e,1439)}_onPointerMove(t){if(!this._draft)return void this._onHover(t);const e=this._drag;if(!e||t.pointerId!==e.pointerId||!this._scale)return;if(!e.moved&&Math.hypot(t.clientX-e.x0,t.clientY-e.y0)<4)return;e.moved=!0;const[s,i]=this._local(t),r=this._pts();if("seg"===e.kind){const{min:t,max:s,step:n}=this._limits,o=wt(xt(this._scale.temp(i),n),Math.max(t,this._scale.lo),Math.min(s,this._scale.hi));o!==r[e.index].t&&this._setPts(St(r,e.index,o))}else{const t=xt(this._scale.minute(s),15);t!==r[e.index].m&&this._setPts(Et(r,e.index,t))}this.requestUpdate()}_onPointerUp(t){const e=this._drag;if(e&&t.pointerId===e.pointerId){if("edge"===e.kind&&e.moved){const t=this._pts(),e=Ct(t);e.length!==t.length&&(this._selected=void 0),this._setPts(e)}this._drag=void 0,this._range=void 0}}_onDoubleClick(t){if(!this._draft||!this._scale)return;const e=t.target;if("seg"!==e.getAttribute("data-kind"))return;const s=Number(e.getAttribute("data-i")),[i]=this._local(t),r=zt(this._pts(),s,this._scale.minute(i));r&&(this._setPts(r),this._selected=s+1)}}Lt.styles=o`
    :host {
      --hs-schedule: var(--primary-color, #03a9f4);
      --hs-current: var(--state-climate-heat-color, #ff8100);
      --hs-target: var(--secondary-text-color, #727272);
      --hs-now: var(--error-color, #db4437);
      --hs-grid: var(--divider-color, rgba(127, 127, 127, 0.2));
      --hs-presence: var(--green-color, #4caf50);
      --hs-typical: color-mix(in srgb, var(--hs-presence) 45%, #000);
      --hs-heating: var(--state-climate-heat-color, #ff8100);
      --hs-suggest: var(--orange-color, #ff9800);
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
    .header-end {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    button.settings {
      display: inline-flex;
      padding: 6px;
      background: none;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
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
      --mdc-icon-size: 20px;
      color: var(--disabled-text-color, var(--secondary-text-color));
    }
    .mode.heat {
      color: var(--hs-current);
    }
    .profile {
      shape-rendering: crispEdges;
    }
    .presence-strip {
      fill: var(--hs-presence);
    }
    .profile {
      fill: var(--hs-typical);
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 10px;
      border-radius: 2px;
      background: var(--hs-presence);
    }
    .swatch.typical {
      background: var(--hs-typical);
    }
    .swatch.heating {
      background: var(--hs-heating);
      opacity: 0.35;
    }
    .heating {
      fill: var(--hs-heating);
      fill-opacity: 0.16;
    }
    .suggestion line {
      stroke: var(--hs-suggest);
      stroke-width: 1.2;
      stroke-dasharray: 2 2;
    }
    .suggestion circle {
      fill: var(--hs-suggest);
    }
    .suggestion text {
      fill: #fff;
      font-size: 11px;
      font-weight: 700;
    }
    .suggestion-diff {
      fill: none;
      stroke: var(--hs-suggest);
      stroke-width: 1.2;
      stroke-dasharray: 3 2;
    }
    .suggestions {
      display: grid;
      gap: 6px;
      margin-top: 10px;
    }
    .suggestion-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
      font-size: 0.9em;
    }
    .suggestion-row .num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--hs-suggest);
      color: #fff;
      font-size: 0.75em;
      font-weight: 700;
    }
    .suggestion-row .text {
      flex: 1 1 12em;
      min-width: 0;
    }
    .suggestion-row .buttons {
      display: flex;
      gap: 6px;
      margin-left: auto;
    }
    .crosshair line {
      stroke: var(--primary-text-color);
      stroke-opacity: 0.35;
      stroke-width: 1;
    }
    .crosshair .dot {
      stroke: var(--card-background-color, #fff);
      stroke-width: 1.5;
    }
    .crosshair .dot.schedule {
      fill: var(--hs-schedule);
    }
    .crosshair .dot.current {
      fill: var(--hs-current);
    }
    .crosshair .dot.target {
      fill: var(--hs-target);
    }
    .tooltip {
      position: absolute;
      top: 4px;
      pointer-events: none;
      min-width: 130px;
      padding: 6px 10px;
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
      font-size: 0.78em;
      line-height: 1.5;
      font-variant-numeric: tabular-nums;
      z-index: 1;
    }
    .tooltip div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .tooltip span:first-child {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--secondary-text-color);
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
      position: relative;
      width: 100%;
      min-height: 120px;
      user-select: none;
      -webkit-user-select: none;
    }
    .chart svg {
      display: block;
      overflow: visible;
    }
    .chart svg {
      touch-action: pan-y; /* a horizontal swipe moves the tooltip, a vertical one scrolls */
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
      pointer-events: none;
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
  `,t([ut({attribute:!1})],Lt.prototype,"hass",void 0),t([_t()],Lt.prototype,"_config",void 0),t([_t()],Lt.prototype,"_info",void 0),t([_t()],Lt.prototype,"_error",void 0),t([_t()],Lt.prototype,"_day",void 0),t([_t()],Lt.prototype,"_draft",void 0),t([_t()],Lt.prototype,"_selected",void 0),t([_t()],Lt.prototype,"_drag",void 0),t([_t()],Lt.prototype,"_history",void 0),t([_t()],Lt.prototype,"_width",void 0),t([_t()],Lt.prototype,"_copyOpen",void 0),t([_t()],Lt.prototype,"_copyTargets",void 0),t([_t()],Lt.prototype,"_saving",void 0),t([_t()],Lt.prototype,"_hover",void 0),t([_t()],Lt.prototype,"_suggestBusy",void 0),customElements.get("heating-schedule-card")||customElements.define("heating-schedule-card",Lt),window.customCards=window.customCards??[],window.customCards.some(t=>"heating-schedule-card"===t.type)||window.customCards.push({type:"heating-schedule-card",name:"Heating Schedule",description:"Weekly thermostat schedule as a temperature chart, editable by dragging.",preview:!0});const Wt=["binary_sensor","person","device_tracker","input_boolean","switch","light"];async function Bt(){if(!customElements.get("ha-form")){try{const t=await(window.loadCardHelpers?.()),e=await(t?.createCardElement({type:"entities",entities:[]}));await(e?.constructor?.getConfigElement?.())}catch{}await Promise.race([customElements.whenDefined("ha-form"),new Promise(t=>setTimeout(t,3e3))])}}class qt extends lt{constructor(){super(...arguments),this.narrow=!1,this._busy=!1,this._cards=new Map,this._loading=!1,this._onSettings=async t=>{const e=t.detail.info;await Bt(),this._dialogError=void 0,this._dialog={kind:"settings",info:e,data:{title:e.title,presence_entities:e.presence.entities}}},this._label=t=>this._t[`field_${t.name}`]??t.name}get _t(){return mt(this.hass?.locale?.language??this.hass?.language)}get _admin(){return!1!==this.hass?.user?.is_admin}connectedCallback(){super.connectedCallback(),this._entries&&this._load(),this.addEventListener("heating-schedule-settings",this._onSettings)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("heating-schedule-settings",this._onSettings)}willUpdate(t){t.has("hass")&&this.hass&&!this._entries&&this._load()}updated(){for(const t of this._cards.values())t.hass=this.hass}async _load(){if(this.hass&&!this._loading){this._loading=!0;try{const t=await this.hass.callWS({type:"heating_schedule/list"});this._entries=t.sort((t,e)=>t.title.localeCompare(e.title));const e=new Set(t.map(t=>t.climate_entity));for(const t of[...this._cards.keys()])e.has(t)||this._cards.delete(t);this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._loading=!1}}}_groups(t){const e=this.hass,s=t=>{const s=e?.entities?.[t.climate_entity],i=s?.area_id??(s?.device_id?e?.devices?.[s.device_id]?.area_id:void 0);return i?e?.areas?.[i]:void 0},i=new Map;for(const r of t){const t=s(r),n=t?.floor_id?e?.floors?.[t.floor_id]:void 0,o=n?.floor_id??"";let a=i.get(o);a||(a={key:o,name:n?.name,entries:[],level:n?n.level??0:Number.POSITIVE_INFINITY,sort:new Map},i.set(o,a)),a.entries.push(r),a.sort.set(r,t?.name??"")}const r=[...i.values()].sort((t,e)=>t.level-e.level||(t.name??"").localeCompare(e.name??"")),n=t=>(e,s)=>{const i=t.get(e),r=t.get(s);return Number(!i)-Number(!r)||i.localeCompare(r)||e.title.localeCompare(s.title)};for(const t of r)t.entries.sort(n(t.sort));return r}_renderCards(t){const e=this._groups(t);return 1!==e.length||e[0].name?e.map(t=>q`<section>
        <h2 class="floor">${t.name??this._t.panel_no_floor}</h2>
        <div class="cards">${t.entries.map(t=>this._card(t))}</div>
      </section>`):q`<div class="cards">${t.map(t=>this._card(t))}</div>`}_card(t){let e=this._cards.get(t.climate_entity);return e||(e=document.createElement("heating-schedule-card"),this._cards.set(t.climate_entity,e)),e.setConfig(this._cardConfig(t.climate_entity)),e.hass=this.hass,e}_cardConfig(t){return{type:"custom:heating-schedule-card",entity:t,settings:!0}}async _openAdd(){await Bt(),this._dialogError=void 0,this._dialog={kind:"add",data:{}}}_close(){this._busy||(this._dialog=void 0)}_schema(t){return"add"===t.kind?[{name:"entity",required:!0,selector:{entity:{filter:[{domain:"climate"}],exclude_entities:(this._entries??[]).map(t=>t.climate_entity)}}}]:[{name:"title",required:!0,selector:{text:{}}},{name:"presence_entities",selector:{entity:{multiple:!0,filter:[{domain:Wt}]}}}]}async _run(t){this._busy=!0,this._dialogError=void 0;try{await t(),this._busy=!1,this._dialog=void 0,await this._load()}catch(t){this._busy=!1,this._dialogError=t?.message??String(t)}}_submit(){const t=this._dialog;if(!t||!this.hass)return;const e=this.hass;if("add"===t.kind){const s=t.data.entity;if(!s)return;return void this._run(()=>e.callWS({type:"heating_schedule/add",entity_id:s}))}const s=t.data,i=String(s.title??"").trim();i&&this._run(()=>e.callWS({type:"heating_schedule/configure",entity_id:t.info.climate_entity,title:i,presence_entities:s.presence_entities??[]}))}_removeSchedule(){const t=this._dialog;if("settings"!==t?.kind||!this.hass)return;const e=this.hass;confirm(this._t.remove_confirm.replace("{name}",t.info.title))&&this._run(()=>e.callWS({type:"heating_schedule/remove",entity_id:t.info.climate_entity}))}render(){const t=this._t,e=this._entries;return q`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="title">${t.panel_title}</div>
        ${this._admin?q`<button class="tool" title=${t.panel_add} aria-label=${t.panel_add} @click=${this._openAdd}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>`:K}
      </div>
      <div class="content">
        ${this._error?q`<div class="error">${this._error}</div>`:K}
        ${e&&!e.length?q`<p class="empty">${t.panel_empty}</p>`:K}
        ${this._renderCards(e??[])}
      </div>
      ${this._renderDialog()}
    `}_renderDialog(){const t=this._dialog;if(!t)return K;const e=this._t,s="add"===t.kind?e.panel_add:t.info.title;return q`
      <div class="backdrop" @click=${this._close}></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label=${s}
        @keydown=${t=>"Escape"===t.key&&this._close()}
      >
        <h2>${s}</h2>
        ${"settings"===t.kind?this._renderClimate(t.info.climate_entity):K}
        ${"settings"===t.kind?q`<p class="help">${e.presence_help}</p>`:K}
        <ha-form
          .hass=${this.hass}
          .data=${t.data}
          .schema=${this._schema(t)}
          .computeLabel=${this._label}
          .disabled=${this._busy}
          @value-changed=${e=>{this._dialog={...t,data:e.detail.value}}}
        ></ha-form>
        ${this._dialogError?q`<div class="error">${this._dialogError}</div>`:K}
        <div class="buttons">
          ${"settings"===t.kind?q`<button class="danger" .disabled=${this._busy} @click=${this._removeSchedule}>
                ${e.remove_schedule}
              </button>`:K}
          <span class="spacer"></span>
          <button .disabled=${this._busy} @click=${this._close}>${e.cancel}</button>
          <button class="primary" .disabled=${this._busy} @click=${this._submit}>
            ${"add"===t.kind?e.add_apply:e.save}
          </button>
        </div>
      </div>
    `}_renderClimate(t){const e=this.hass?.states[t]?.attributes.friendly_name;return q`<div class="climate">
      <span class="label">${this._t.field_entity}</span>
      <span>${e?q`${e} <code>${t}</code>`:q`<code>${t}</code>`}</span>
    </div>`}}qt.styles=o`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      height: var(--header-height, 56px);
      padding: 0 12px;
      box-sizing: border-box;
      background: var(--app-header-background-color, var(--primary-color));
      color: var(--app-header-text-color, #fff);
      border-bottom: var(--app-header-border-bottom, none);
      font-size: 20px;
    }
    .title {
      flex: 1;
      margin-left: 12px;
    }
    button {
      font: inherit;
      font-size: 0.9em;
      color: var(--primary-text-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.45;
      cursor: default;
    }
    button.primary {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }
    button.danger {
      background: none;
      color: var(--error-color, #db4437);
      border-color: var(--error-color, #db4437);
    }
    button.tool {
      display: inline-flex;
      padding: 12px;
      background: none;
      color: inherit;
      font-size: inherit;
    }
    .content {
      padding: 16px;
      max-width: 1600px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .floor {
      margin: 8px 4px 12px;
      font-size: 1.3em;
      font-weight: 400;
      color: var(--primary-text-color);
    }
    section + section .floor {
      margin-top: 24px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 1fr));
      gap: 16px;
      align-items: start;
    }
    .empty,
    .help {
      color: var(--secondary-text-color);
    }
    .help {
      font-size: 0.9em;
      margin: 0 0 12px;
    }
    .error {
      color: var(--error-color, #db4437);
      margin: 8px 0;
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 10;
    }
    .dialog {
      position: fixed;
      z-index: 11;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(520px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      overflow: auto;
      box-sizing: border-box;
      padding: 20px 24px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    }
    .climate {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 8px;
      margin: 0 0 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
    }
    .climate .label {
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    code {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    h2 {
      margin: 0 0 8px;
      font-size: 1.3em;
      font-weight: 500;
    }
    .buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    .spacer {
      flex: 1;
    }
    @media (max-width: 600px) {
      .content {
        padding: 8px;
      }
      .cards {
        gap: 8px;
      }
    }
  `,t([ut({attribute:!1})],qt.prototype,"hass",void 0),t([ut({type:Boolean})],qt.prototype,"narrow",void 0),t([_t()],qt.prototype,"_entries",void 0),t([_t()],qt.prototype,"_error",void 0),t([_t()],qt.prototype,"_dialog",void 0),t([_t()],qt.prototype,"_dialogError",void 0),t([_t()],qt.prototype,"_busy",void 0),customElements.get("heating-schedule-panel")||customElements.define("heating-schedule-panel",qt);
