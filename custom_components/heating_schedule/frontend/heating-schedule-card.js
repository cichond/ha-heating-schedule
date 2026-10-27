function t(t,e,s,i){var n,r=arguments.length,o=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(o=(r<3?n(o):r>3?n(e,s,o):n(e,s))||o);return r>3&&o&&Object.defineProperty(e,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let r=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&n.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new r(s,t,i)},a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:h,defineProperty:c,getOwnPropertyDescriptor:l,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,m=g?g.emptyScript:"",f=_.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},b=(t,e)=>!h(t,e),v={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=v){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&c(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:n}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const r=i?.call(this);n?.call(this,e),this.requestUpdate(t,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??v}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),n=e.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const n=(void 0!==s.converter?.toAttribute?s.converter:$).toAttribute(e,s.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=i;const r=n.fromAttribute(e,t.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(void 0!==t){const r=this.constructor;if(!1===i&&(n=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??b)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,f?.({ReactiveElement:w}),(_.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=t=>t,A=x.trustedTypes,S=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,z="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+E,T=`<${M}>`,C=document,P=()=>C.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,j=Array.isArray,D="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,N=/>/g,U=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,B=/"/g,L=/^(?:script|style|textarea|title)$/i,W=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),V=W(1),F=W(2),q=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),Y=new WeakMap,K=C.createTreeWalker(C,129);function X(t,e){if(!j(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const J=(t,e)=>{const s=t.length-1,i=[];let n,r=2===e?"<svg>":3===e?"<math>":"",o=I;for(let e=0;e<s;e++){const s=t[e];let a,h,c=-1,l=0;for(;l<s.length&&(o.lastIndex=l,h=o.exec(s),null!==h);)l=o.lastIndex,o===I?"!--"===h[1]?o=H:void 0!==h[1]?o=N:void 0!==h[2]?(L.test(h[2])&&(n=RegExp("</"+h[2],"g")),o=U):void 0!==h[3]&&(o=U):o===U?">"===h[0]?(o=n??I,c=-1):void 0===h[1]?c=-2:(c=o.lastIndex-h[2].length,a=h[1],o=void 0===h[3]?U:'"'===h[3]?B:R):o===B||o===R?o=U:o===H||o===N?o=I:(o=U,n=void 0);const d=o===U&&t[e+1].startsWith("/>")?" ":"";r+=o===I?s+T:c>=0?(i.push(a),s.slice(0,c)+z+s.slice(c)+E+d):s+E+(-2===c?e:d)}return[X(t,r+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class G{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,r=0;const o=t.length-1,a=this.parts,[h,c]=J(t,e);if(this.el=G.createElement(h,s),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=K.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(z)){const e=c[r++],s=i.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:s,ctor:"."===o[1]?it:"?"===o[1]?nt:"@"===o[1]?rt:st}),i.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:n}),i.removeAttribute(t));if(L.test(i.tagName)){const t=i.textContent.split(E),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],P()),K.nextNode(),a.push({type:2,index:++n});i.append(t[e],P())}}}else if(8===i.nodeType)if(i.data===M)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(E,t+1));)a.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const s=C.createElement("template");return s.innerHTML=t,s}}function Q(t,e,s=t,i){if(e===q)return e;let n=void 0!==i?s._$Co?.[i]:s._$Cl;const r=O(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=n:s._$Cl=n),void 0!==n&&(e=Q(t,n._$AS(t,e.values),n,i)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??C).importNode(e,!0);K.currentNode=i;let n=K.nextNode(),r=0,o=0,a=s[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new et(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new ot(n,this,t)),this._$AV.push(e),a=s[++o]}r!==a?.index&&(n=K.nextNode(),r++)}return K.currentNode=C,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),O(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>j(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(C.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=G.createElement(X(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new tt(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new G(t)),e}k(t){j(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const n of t)i===e.length?e.push(s=new et(this.O(P()),this.O(P()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=Z}_$AI(t,e=this,s,i){const n=this.strings;let r=!1;if(void 0===n)t=Q(this,t,e,0),r=!O(t)||t!==this._$AH&&t!==q,r&&(this._$AH=t);else{const i=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=Q(this,i[s+o],e,o),a===q&&(a=this._$AH[o]),r||=!O(a)||a!==this._$AH[o],a===Z?t=Z:t!==Z&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!i&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class nt extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class rt extends st{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??Z)===q)return;const s=this._$AH,i=t===Z&&s!==Z||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==Z&&(s===Z||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=x.litHtmlPolyfillSupport;at?.(G,et),(x.litHtmlVersions??=[]).push("3.3.3");const ht=globalThis;class ct extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=s?.renderBefore??null;i._$litPart$=n=new et(e.insertBefore(P(),t),t,void 0,s??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}ct._$litElement$=!0,ct.finalized=!0,ht.litElementHydrateSupport?.({LitElement:ct});const lt=ht.litElementPolyfillSupport;lt?.({LitElement:ct}),(ht.litElementVersions??=[]).push("4.2.2");const dt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:b},pt=(t=dt,e,s)=>{const{kind:i,metadata:n}=s;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),r.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const n=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,n,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const n=this[i];e.call(this,s),this.requestUpdate(i,n,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ut(t){return(e,s)=>"object"==typeof s?pt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function _t(t){return ut({...t,state:!0,attribute:!1})}const gt={en:{days:["Mo","Tu","We","Th","Fr","Sa","Su"],schedule:"Schedule",now:"Now",target:"target",next:"next",at:"at",mode_off:"off",mode_heat:"heating",mode_turn_on:"turn the thermostat on",mode_turn_off:"turn the thermostat off",off_hint:"The thermostat is off. The schedule only sets the target temperature.",legend_schedule:"schedule",legend_current:"temperature",legend_target:"actual target",legend_band:"sensitivity",history_from:"history from",edit:"Edit",save:"Save",cancel:"Cancel",split:"Split",remove:"Remove",copy:"Copy day to…",copy_apply:"Copy",workdays:"Mon–Fri",weekend:"Weekend",all:"All",edit_hint:"Drag a level up or down, drag a boundary sideways. Double-click a level to split it. Tap a level for more options.",legend_typical:"typical presence",legend_presence:"presence that day",legend_heating:"heating",suggest_apply:"Apply",zoom_reset:"Show the whole day",ai_ask:"Ask the AI for suggestions",ai_busy:"Asking…",ai_none:"The AI has no changes to suggest.",ai_full:"Schedule proposed by the AI",field_init:"Schedule",init_empty:"Empty",init_ai:"Proposed by the AI",suggest_dismiss:"Dismiss",suggest_lower_at:"Lower to {temp} at {to} instead of {from}",suggest_raise_at:"{temp} from {to} instead of {from}",suggest_setback:"Lower to {temp} {start}–{end}",suggest_temp:"{temp} instead of {from_temp}, {start}–{end}",weeks:"wk",panel_title:"Heating",panel_settings:"Settings",panel_empty:"No thermostats yet. Add one with the + button.",panel_no_floor:"Other",panel_add:"Add thermostat",add_apply:"Add",field_entity:"Thermostat",field_title:"Name",field_presence_entities:"Room presence entities (any of them)",field_band_below:"Sensitivity below the target",field_band_above:"Sensitivity above the target",band_help:"The band drawn along the schedule. Empty: from the thermostat's deadzone (below the target only) or temperature delta (± the target) entity.",presence_help:"The room is occupied when any presence entity is on (OR) (person / device tracker: home). These entities also build the typical-presence profile. They are shown on the chart and do not change the temperature.",remove_schedule:"Remove schedule",remove_confirm:"Remove the schedule of {name}? Its schedule, switch and sensors will be deleted.",not_found:"This thermostat has no schedule. Add it under Settings → Devices & services → Heating Schedule."},pl:{days:["Pn","Wt","Śr","Cz","Pt","So","Nd"],schedule:"Harmonogram",now:"Teraz",target:"zadana",next:"następnie",at:"o",mode_off:"wyłączony",mode_heat:"grzanie",mode_turn_on:"włącz termostat",mode_turn_off:"wyłącz termostat",off_hint:"Termostat jest wyłączony. Harmonogram ustawia tylko temperaturę zadaną.",legend_schedule:"harmonogram",legend_current:"temperatura",legend_target:"zadana (faktyczna)",legend_band:"czułość",history_from:"historia z",edit:"Edytuj",save:"Zapisz",cancel:"Anuluj",split:"Podziel",remove:"Usuń",copy:"Kopiuj dzień na…",copy_apply:"Kopiuj",workdays:"Pn–Pt",weekend:"Weekend",all:"Wszystkie",edit_hint:"Przeciągnij poziom w górę lub w dół, a granicę w bok. Dwuklik na poziomie dzieli go na dwa. Dotknij poziomu, żeby zobaczyć więcej opcji.",legend_typical:"typowa obecność",legend_presence:"obecność tego dnia",legend_heating:"grzanie",suggest_apply:"Zastosuj",zoom_reset:"Pokaż cały dzień",ai_ask:"Zapytaj AI o sugestie",ai_busy:"Pytam…",ai_none:"AI nie proponuje zmian.",ai_full:"Harmonogram zaproponowany przez AI",field_init:"Harmonogram",init_empty:"Pusty",init_ai:"Zaproponowany przez AI",suggest_dismiss:"Odrzuć",suggest_lower_at:"Obniżka do {temp} o {to} zamiast {from}",suggest_raise_at:"{temp} od {to} zamiast {from}",suggest_setback:"Obniżka do {temp} w godz. {start}–{end}",suggest_temp:"{temp} zamiast {from_temp} w godz. {start}–{end}",weeks:"tyg.",panel_title:"Ogrzewanie",panel_settings:"Ustawienia",panel_empty:"Brak termostatów. Dodaj pierwszy przyciskiem +.",panel_no_floor:"Inne",panel_add:"Dodaj termostat",add_apply:"Dodaj",field_entity:"Termostat",field_title:"Nazwa",field_presence_entities:"Encje obecności w pokoju (wystarczy dowolna)",field_band_below:"Czułość poniżej zadanej",field_band_above:"Czułość powyżej zadanej",band_help:"Pas rysowany wzdłuż harmonogramu. Puste: z encji termostatu deadzone (tylko poniżej zadanej) albo temperature delta (± zadana).",presence_help:"Pokój jest zajęty, gdy którakolwiek encja obecności jest włączona (LUB) (osoba / urządzenie: w domu). Z tych encji powstaje też profil typowej obecności. Są pokazywane na wykresie i nie zmieniają temperatury.",remove_schedule:"Usuń harmonogram",remove_confirm:"Usunąć harmonogram termostatu {name}? Harmonogram, przełącznik i sensory zostaną usunięte.",not_found:"Ten termostat nie ma harmonogramu. Dodaj go w Ustawienia → Urządzenia i usługi → Harmonogram ogrzewania."}};function mt(t){return t?.startsWith("pl")?gt.pl:gt.en}const ft=["mon","tue","wed","thu","fri","sat","sun"],yt=1440;function $t(t){const[e,s]=t.split(":").map(Number);return 60*e+s}function bt(t){const e=Math.floor(t/60),s=Math.round(t%60);return`${String(e).padStart(2,"0")}:${String(s).padStart(2,"0")}`}function vt(t){return t.map(t=>({m:$t(t.time),t:t.temp}))}function wt(t){return t.map(t=>({time:bt(t.m),temp:t.t}))}function xt(t,e){return Math.round(Math.round(t/e)*e*100)/100}function kt(t,e,s){return Math.min(s,Math.max(e,t))}function At(t,e){return e+1<t.length?t[e+1].m:yt}function St(t,e){let s=t[0].t;for(const i of t){if(i.m>e)break;s=i.t}return s}function zt(t,e,s){return t.map((t,i)=>i===e?{...t,t:s}:t)}function Et(t,e,s){if(e<=0||e>=t.length)return t;const i=kt(s,t[e-1].m,At(t,e));return t.map((t,s)=>s===e?{...t,m:i}:t)}function Mt(t){const e=[];return t.forEach((s,i)=>{At(t,i)<=s.m||(e.length&&e[e.length-1].m===s.m&&e.pop(),e.push(s))}),e.length?(e[0]={...e[0],m:0},e):[{m:0,t:t[t.length-1].t}]}function Tt(t,e,s){const i=t[e].m,n=At(t,e),r=xt(s??(i+n)/2,15);return r<=i||r>=n?null:[...t.slice(0,e+1),{m:r,t:t[e].t},...t.slice(e+1)]}function Ct(t){return ft[(t.getDay()+6)%7]}const Pt=["_deadzone_temperature","_temperature_delta"];function Ot(t,e,s=0){const i=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1);if(t<=e.getTime())return Math.max(0,s);if(t>=i.getTime())return yt;const n=new Date(t);return Math.max(60*n.getHours()+n.getMinutes()+n.getSeconds()/60,s)}const jt=["mon","tue","wed","thu","fri","sat","sun"];function Dt(t){const e=Math.floor(t/60),s=Math.round(t%60);return`${e}:${String(s).padStart(2,"0")}`}function It(t,e,s,i){const n=t.params;let r;if("shift"===t.kind){const o=function(t,e,s){const i=t?.[e];if(!i?.length)return;let n=i[0].temp;for(const t of i){const[e,i]=t.time.split(":").map(Number);if(60*e+i>=s)break;n=t.temp}return n}(e,t.days[0],n.from??t.start);r=(void 0!==o&&(n.temp??t.temp)<o?s.suggest_lower_at:s.suggest_raise_at).replace("{temp}",i(n.temp??t.temp)).replace("{to}",Dt(n.to??t.start)).replace("{from}",Dt(n.from??t.end))}else r="setback"===t.kind?s.suggest_setback.replace("{temp}",i(t.temp)).replace("{start}",Dt(t.start)).replace("{end}",Dt(t.end)):s.suggest_temp.replace("{temp}",i(t.temp)).replace("{from_temp}",i(n.from_temp??t.temp)).replace("{start}",Dt(t.start)).replace("{end}",Dt(t.end));const o=function(t,e){const s=[...new Set(t)].map(t=>jt.indexOf(t)).sort((t,e)=>t-e);if(7===s.length)return"";const i=s.join(",");if("0,1,2,3,4"===i)return e.workdays;if("5,6"===i)return e.weekend;const n=t=>e.days[t],r=s.every((t,e)=>0===e||t===s[e-1]+1);return r&&s.length>2?`${n(s[0])}–${n(s[s.length-1])}`:s.map(n).join(", ")}(t.days,s);return o?`${r} (${o})`:r}let Ht,Nt=0;const Ut=[15,30,60,120,180,360],Rt=30,Bt=8,Lt=16,Wt=20;function Vt(t){return 60*t.getHours()+t.getMinutes()+t.getSeconds()/60}function Ft(t){const e=(s=new Date,new Date(s.getFullYear(),s.getMonth(),s.getDate()));var s;const i=(ft.indexOf(Ct(e))-ft.indexOf(t)+7)%7;return new Date(e.getFullYear(),e.getMonth(),e.getDate()-i)}function qt(t){const e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}`}class Zt extends ct{constructor(){super(...arguments),this._modeBusy=!1,this._day=Ct(new Date),this._width=0,this._copyOpen=!1,this._copyTargets=[],this._saving=!1,this._aiBusy=!1,this._view=[0,yt],this._touches=new Map,this._subscribeFailed=!1}setConfig(t){if(!t?.entity)throw new Error("entity is required");this._config?.entity!==t.entity&&(this._unsubscribe(),this._info=void 0,this._history=void 0,this._historyKey=void 0,this._draft=void 0,this._error=void 0,this._subscribeFailed=!1),this._config=t}connectedCallback(){super.connectedCallback(),this._historyTimer=window.setInterval(()=>{this._config?.readonly&&(this._day=Ct(new Date)),this._loadHistory(!0)},3e5),this._resize=new ResizeObserver(t=>{const e=Math.floor(t[0].contentRect.width);e&&e!==this._width&&(this._width=e)}),this._observed=void 0}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribe(),window.clearInterval(this._historyTimer),window.clearTimeout(this._hoverTimer),this._resize?.disconnect()}updated(t){this.hass&&this._config&&!this._unsub&&!this._subscribeFailed&&this._subscribe(),(t.has("_day")||t.has("hass")||t.has("_info"))&&this._loadHistory();const e=this.renderRoot.querySelector(".chart");e&&e!==this._observed&&(this._observed=e,this._resize?.disconnect(),this._resize?.observe(e))}get _t(){return mt(this.hass?.locale?.language??this.hass?.language)}_subscribe(){const t=this._config.entity;this._unsub=this.hass.connection.subscribeMessage(t=>{this._info=t,this._error=void 0},{type:"heating_schedule/subscribe",entity_id:t}),this._unsub.catch(t=>{this._subscribeFailed=!0,this._unsub=void 0,this._error="not_found"===t?.code?this._t.not_found:t?.message??String(t)})}_unsubscribe(){this._unsub?.then(t=>t()).catch(()=>{}),this._unsub=void 0}get _presence(){return!!this._info?.presence?.entities.length}async _loadHistory(t=!1){if(!this.hass||!this._config)return;const e=this._config.entity,s=this._presence?this._info?.occupancy_entity??null:null,i=Ft(this._day),n=`${e}|${s}|${qt(i)}`;if(!t&&n===this._historyKey)return;this._historyKey=n;const r=new Date,o=new Date(i.getFullYear(),i.getMonth(),i.getDate()+1),a=o<r?o:r;try{const t=await this.hass.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:a.toISOString(),entity_ids:s?[e,s]:[e],minimal_response:!1,no_attributes:!1,significant_changes_only:!1});if(n!==this._historyKey)return;const o=a===r?Vt(r):yt,h=[],c=[],l=[];let d,p=0;for(const s of t[e]??[]){const t=p=Ot(1e3*(s.lu??s.lc??0),i,p),e=s.a??{};"number"==typeof e.current_temperature&&h.push([t,e.current_temperature]),"number"==typeof e.temperature&&c.push([t,e.temperature]);const n="heating"===e.hvac_action;n&&void 0===d&&(d=t),n||void 0===d||(t>d&&l.push([d,t]),d=void 0)}void 0!==d&&o>d&&l.push([d,o]);const u=t=>Ot(1e3*(t.lu??t.lc??0),i),_=[],g=s?t[s]??[]:[];g.forEach((t,e)=>{if("on"!==t.s)return;const s=u(t),i=e+1<g.length?u(g[e+1]):o;i>s&&_.push([s,i])}),this._history={date:i,current:h,target:c,occupied:_,heating:l,end:o}}catch(t){this._history=void 0}}_week(){return this._draft??this._info?.days}_pts(t=this._day){const e=this._week();return e?vt(e[t]):[{m:0,t:20}]}_setPts(t,e=this._day){this._draft&&(this._draft={...this._draft,[e]:wt(t)})}get _limits(){const t=this._info?.limits;return{min:t?.min??5,max:t?.max??35,step:t?.step||.5}}_fmtTemp(t){if(null==t||Number.isNaN(t))return"–";const e=this.hass?.locale?.language??this.hass?.language??"en";return`${t.toLocaleString(e,{maximumFractionDigits:1})}°`}get _band(){if(this.hass&&this._config)return function(t,e){const s=t?.below??e?.below??0,i=t?.above??e?.above??0;return s>0||i>0?{below:s,above:i}:void 0}(this._info?.band,function(t,e,s={}){const i=t.split(".")[1],n=["number","sensor"].flatMap(t=>Pt.map(e=>`${t}.${i}${e}`)),r=s[t]?.device_id,o=r?Object.keys(s).filter(t=>s[t].device_id===r&&/^(number|sensor)\./.test(t)&&Pt.some(e=>t.endsWith(e))):[];for(const t of[...n,...o]){const s=Number(e[t]?.state);if(e[t]?.state&&Number.isFinite(s)&&s>0)return t.endsWith("_deadzone_temperature")?{below:s,above:0}:{below:s,above:s}}}(this._config.entity,this.hass.states,this.hass.entities))}_fmtBand({below:t,above:e}){return t===e?`±${this._fmtTemp(t)}`:e?t?`−${this._fmtTemp(t)} / +${this._fmtTemp(e)}`:`+${this._fmtTemp(e)}`:`−${this._fmtTemp(t)}`}_yRange(t){const e=this._band??{below:0,above:0},s=t.flatMap(t=>[t.t-e.below,t.t+e.above]),i=this._history;i&&qt(i.date)===qt(Ft(this._day))&&s.push(...i.current.map(t=>t[1]));const n=this.hass?.states[this._config.entity]?.attributes.current_temperature;"number"==typeof n&&this._day===Ct(new Date)&&s.push(n);let r=Math.floor(Math.min(...s))-1,o=Math.ceil(Math.max(...s))+1;if(o-r<6){const t=(6-(o-r))/2;r=Math.floor(r-t),o=Math.ceil(o+t)}return[r,o]}render(){if(!this._config)return Z;const t=this._t,e=this.hass?.states[this._config.entity],s=this._config.name??this._info?.title??e?.attributes.friendly_name??this._config.entity,i=!!this._info&&!this._info.enabled&&!this._draft;return this._config.readonly?V`
        <ha-card class="readonly ${i?"disabled":""}">
          ${this._config.name?V`<div class="header"><div class="name">${s}</div></div>`:Z}
          ${this._error?V`<div class="error">${this._error}</div>`:Z}
          ${this._info?this._renderView():Z}
        </ha-card>
      `:V`
      <ha-card class=${i?"disabled":""}>
        <div class="header">
          <div class="name">${s}</div>
          <div class="header-end">
            ${this._info?V`<label class="toggle" title=${t.schedule}>
                  <ha-switch
                    aria-label=${t.schedule}
                    .checked=${this._info.enabled}
                    .disabled=${!!this._draft}
                    @change=${this._toggleEnabled}
                  ></ha-switch>
                </label>`:Z}
            ${this._config.settings&&this._info&&!1!==this.hass?.user?.is_admin?V`<button
                  class="settings"
                  title=${t.panel_settings}
                  aria-label=${t.panel_settings}
                  @click=${this._openSettings}
                >
                  <ha-icon icon="mdi:cog"></ha-icon>
                </button>`:Z}
          </div>
        </div>
        ${this._renderStatus(e)}
        ${this._error?V`<div class="error">${this._error}</div>`:Z}
        ${this._info?this._renderBody():Z}
      </ha-card>
    `}_openSettings(){this.dispatchEvent(new CustomEvent("heating-schedule-settings",{detail:{info:this._info},bubbles:!0,composed:!0}))}_renderMode(t,e,s){const i=this._t,n="off"===t.state?"heat":"heat"===t.state?"off":void 0,r=t.attributes.hvac_modes??[];if(!n||!r.includes(n))return V`<ha-icon class="mode ${t.state}" icon=${s} title=${e} aria-label=${e}></ha-icon>`;const o=`${e}: ${"off"===n?i.mode_turn_off:i.mode_turn_on}`;return V`<button
      class="mode ${t.state}"
      title=${o}
      aria-label=${o}
      aria-pressed=${"heat"===t.state?"true":"false"}
      .disabled=${this._modeBusy}
      @click=${()=>this._setMode(n)}
    >
      <ha-icon icon=${s}></ha-icon>
    </button>`}async _setMode(t){if(this.hass&&this._config){this._modeBusy=!0,this._error=void 0;try{await this.hass.callService("climate","set_hvac_mode",{entity_id:this._config.entity,hvac_mode:t})}catch(t){this._error=t?.message??String(t)}finally{this._modeBusy=!1}}}_renderStatus(t){if(!t)return Z;const e=this._t,s=t.attributes,i="off"===t.state?e.mode_off:"heat"===t.state?e.mode_heat:t.state,n="off"===t.state?"mdi:fire-off":"heat"===t.state?"mdi:fire":"mdi:thermostat",r=this._info;let o=Z;if(r?.enabled&&r.current.next_change&&null!==r.current.next_temp){const t=new Date(r.current.next_change),s=`${qt(t)===qt(new Date)?"":`${e.days[ft.indexOf(Ct(t))]} `}${bt(Vt(t))}`;o=V`<span class="next">${e.next} ${this._fmtTemp(r.current.next_temp)} ${e.at} ${s}</span>`}return V`
      <div class="status">
        <span class="current">${this._fmtTemp(s.current_temperature)}</span>
        <span class="target">${e.target} ${this._fmtTemp(s.temperature)}</span>
        ${this._renderMode(t,i,n)}
        ${o}
      </div>
      ${r?.enabled&&"off"===t.state?V`<div class="hint">${e.off_hint}</div>`:Z}
    `}_renderView(){return V`
      <div class="chart ${this._draft?"editing":""} ${this._zoomed?"zoomed":""}">
        ${this._width?this._renderChart():Z}${this._renderTooltip()}${this._renderZoomReset()}
      </div>
      ${this._renderLegend()}
    `}_renderBody(){const t=this._t,e=Ct(new Date);return V`
      <div class="days">
        ${ft.map((s,i)=>V`<button
            class="day ${s===this._day?"selected":""} ${s===e?"today":""}"
            @click=${()=>this._selectDay(s)}
          >
            ${t.days[i]}
          </button>`)}
      </div>
      ${this._renderView()}
      ${this._renderSuggestions()}
      ${this._draft?this._renderEditor():this._renderSummary()}
    `}_renderLegend(){const t=this._t,e=this._history,s=!!e&&qt(e.date)===qt(Ft(this._day)),i=s&&this._day!==Ct(new Date),n=s?e.heating.reduce((t,[e,s])=>t+s-e,0):0;return V`
      <div class="legend">
        <span><i class="line schedule"></i>${t.legend_schedule}</span>
        <span><i class="line current"></i>${t.legend_current}</span>
        <span><i class="line target"></i>${t.legend_target}</span>
        ${this._band?V`<span><i class="swatch band"></i>${t.legend_band}
              <b>${this._fmtBand(this._band)}</b></span>`:Z}
        ${n?V`<span><i class="swatch heating"></i>${t.legend_heating} <b>${function(t){const e=Math.round(t),s=Math.floor(e/60);return s?`${s} h ${e%60} min`:`${e} min`}(n)}</b></span>`:Z}
        ${this._presence&&this._info?.occupancy_entity?V`<span><i class="swatch actual"></i>${t.legend_presence}</span>`:Z}
        ${this._presence&&this._info?.profile?.weeks?V`<span
              ><i class="swatch typical"></i>${t.legend_typical} (${this._info.profile.weeks}
              ${t.weeks})</span
            >`:Z}
        ${i?V`<span class="muted">${t.history_from} ${qt(e.date)}</span>`:Z}
      </div>
    `}_renderChart(){const t=this._pts(),e=this._width,s=this._config.height??220,[i,n]=this._range??this._yRange(t),r=Wt+(this._presence?12:0),o=e-Rt-Bt,a=s-Lt-r,[h,c]=this._view,l=c-h,d=t=>Rt+(t-h)/l*o,p=t=>Lt+(n-t)/(n-i)*a;this._scale={x:d,y:p,minute:t=>h+(t-Rt)/o*l,temp:t=>n-(t-Lt)/a*(n-i),lo:i,hi:n,width:o};const u=!!this._draft,_=n-i>12?2:1,g=[];for(let t=Math.ceil(i);t<=n;t+=_)g.push(t);const m=e<420?4:8,f=Ut.find(t=>l/t<=m)??360,y=[];for(let t=Math.ceil(h/f)*f;t<=c;t+=f)y.push(t);let $=`M${d(0)},${p(t[0].t)}`;t.forEach((e,s)=>{$+=`H${d(At(t,s))}`,s+1<t.length&&($+=`V${p(t[s+1].t)}`)});const b=`${$}V${p(i)}H${d(0)}Z`,v=this._history,w=v&&qt(v.date)===qt(Ft(this._day));let x="",k="";if(w){const t=v.current,e=t=>p(kt(t,i,n));t.length&&(x=t.map(([t,s],i)=>`${i?"L":"M"}${d(t)},${e(s)}`).join(""),x+=`L${d(v.end)},${e(t[t.length-1][1])}`);const s=v.target;if(s.length){k=`M${d(s[0][0])},${p(kt(s[0][1],i,n))}`;for(let t=1;t<s.length;t++)k+=`H${d(s[t][0])}V${p(kt(s[t][1],i,n))}`;k+=`H${d(v.end)}`}}const A=this._day===Ct(new Date),S=Vt(new Date),z=this.hass?.states[this._config.entity]?.attributes.current_temperature,E=this._drag,M=this._band;return V`<svg
      width=${e}
      height=${s}
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @pointerleave=${this._onPointerLeave}
      @dblclick=${this._onDoubleClick}
      @wheel=${this._onWheel}
    >
      <defs>
        <clipPath id="plot"><rect x=${Rt} y="0" width=${o} height=${s}></rect></clipPath>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" class="fill-top"></stop>
          <stop offset="1" class="fill-bottom"></stop>
        </linearGradient>
      </defs>
      ${g.map(t=>F`<line class="grid" x1=${Rt} x2=${e-Bt} y1=${p(t)} y2=${p(t)}></line>
          <text class="axis" x=${Rt-4} y=${p(t)+3.5} text-anchor="end">${t}°</text>`)}
      <g clip-path="url(#plot)">
      ${w?v.heating.map(([t,e])=>F`<rect class="heating" x=${d(t)} y=${Lt}
              width=${Math.max(1,d(e)-d(t))} height=${a}></rect>`):Z}
      ${y.map(t=>F`<line class="grid" x1=${d(t)} x2=${d(t)} y1=${Lt} y2=${Lt+a}></line>
          <text class="axis" x=${d(t)} y=${s-5}
            text-anchor=${t===h?"start":t===c?"end":"middle"}>${t%60?bt(t):t/60}</text>`)}
      <path class="area" d=${b}></path>
      ${M?t.map((e,s)=>{const r=p(Math.min(e.t+M.above,n)),o=p(Math.max(e.t-M.below,i))-r;return F`<rect class="band" x=${d(e.m)} y=${r}
              width=${Math.max(0,d(At(t,s))-d(e.m))} height=${Math.max(0,o)}></rect>`}):Z}
      ${this._presence&&w?v.occupied.map(([t,e])=>F`<rect class="presence-strip" x=${d(t)} y=${Lt+a+1}
              width=${Math.max(1,d(e)-d(t))} height="5"></rect>`):Z}
      ${this._renderProfile(d,o,Lt+a+7)}
      ${x?F`<path class="current" d=${x}></path>`:Z}
      <path class="schedule" d=${$}></path>
      ${void 0!==this._selected&&u&&t[this._selected]?F`<line class="selected" x1=${d(t[this._selected].m)} x2=${d(At(t,this._selected))}
            y1=${p(t[this._selected].t)} y2=${p(t[this._selected].t)}></line>`:Z}
      ${k?F`<path class="target" d=${k}></path>`:Z}
      ${t.map((e,s)=>{const i=d(e.m),n=d(At(t,s));return n-i>26?F`<text class="label" x=${(i+n)/2} y=${p(e.t)-5} text-anchor="middle">${this._fmtTemp(e.t)}</text>`:Z})}
      ${A?F`<line class="now" x1=${d(S)} x2=${d(S)} y1=${Lt-6} y2=${Lt+a}></line>
          ${"number"==typeof z?F`<circle class="now-dot" cx=${d(S)} cy=${p(kt(z,i,n))} r="4"></circle>`:Z}`:Z}
      ${u?F`${t.map((e,s)=>F`<rect class="hit seg" data-kind="seg" data-i=${s}
              x=${d(e.m)} y=${p(e.t)-14} width=${Math.max(0,d(At(t,s))-d(e.m))} height="28"></rect>`)}
          ${t.slice(1).map((t,e)=>F`<rect class="hit edge" data-kind="edge" data-i=${e+1}
              x=${d(t.m)-9} y=${Lt} width="18" height=${a}></rect>`)}
          ${this._edgeLabels(t,d).map(t=>F`<text class="edge-label" x=${d(t.m)} y=${Lt-4} text-anchor="middle">${bt(t.m)}</text>`)}`:Z}
      ${E?.moved?this._renderDragLabel(t,E):Z}
      ${this._renderSuggestionMarkers(t,d,p,a)}
      ${this._renderCrosshair(d,p,a)}
      </g>
    </svg>`}get _zoomed(){return this._view[1]-this._view[0]<yt}_setView(t,e){const s=kt(e,60,yt),i=kt(t,0,yt-s);this._view=[i,i+s]}_resetZoom(){this._view=[0,yt]}_renderZoomReset(){return this._zoomed?V`<button
      class="zoom-reset"
      title=${this._t.zoom_reset}
      aria-label=${this._t.zoom_reset}
      @click=${this._resetZoom}
    >
      <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
    </button>`:Z}_onWheel(t){const e=this._scale;if(!e)return;const[s,i]=this._view,n=i-s,r=1===t.deltaMode?33:2===t.deltaMode?400:1,o=Math.abs(t.deltaX)>Math.abs(t.deltaY)?t.deltaX:t.shiftKey?t.deltaY:0;if(o){if(!this._zoomed)return;return t.preventDefault(),void this._setView(s+o*r/e.width*n,n)}const a=kt(n*Math.exp(t.deltaY*r*.0015),60,yt);if(a===n&&!this._zoomed)return;t.preventDefault();const h=kt(e.minute(this._local(t)[0]),0,yt);this._setView(h-(h-s)/n*a,a)}_onPinch(){const t=this._pinch,e=this._scale;if(!t||!e)return;const s=this._touches.get(t.ids[0]),i=this._touches.get(t.ids[1]);if(void 0===s||void 0===i||Math.abs(i-s)<20)return;const n=(t.b-t.a)*e.width/(i-s);if(!(n>0))return;const r=kt(n,60,yt),o=(t.a+t.b)/2,a=(s+i)/2-Rt;this._setView(o-a/e.width*r,r)}_trackTouch(t){if("touch"!==t.pointerType)return!1;if(this._touches.set(t.pointerId,this._local(t)[0]),2===this._touches.size&&!this._pinch&&this._scale){const t=[...this._touches.keys()],[e,s]=t.map(t=>this._scale.minute(this._touches.get(t)));this._pinch={ids:t,a:e,b:s},this._drag=void 0,this._range=void 0,this._hover=void 0}return!!this._pinch}_untrackTouch(t){this._touches.delete(t.pointerId),this._pinch?.ids.includes(t.pointerId)&&(this._pinch=void 0),this._pan?.pointerId===t.pointerId&&(this._pan=void 0)}_edgeLabels(t,e){const s=t.slice(1),i=this._selected,n=new Set(void 0===i?[]:[i,i+1]),r=s.map((t,e)=>({p:t,k:e+1})).sort((t,e)=>Number(n.has(e.k))-Number(n.has(t.k))),o=[];for(const{p:t}of r)o.every(s=>Math.abs(e(s.m)-e(t.m))>=34)&&o.push(t);return o}_renderProfile(t,e,s){const i=this._presence?this._info?.profile:void 0;if(!i?.weeks)return Z;const n=i.days[this._day]??[],r=(t(yt)-t(0))/n.length;return n.map((e,i)=>e>.02?F`<rect class="profile" x=${t(15*i)} y=${s} width=${r+.5}
            height="5" fill-opacity=${.45+.55*Math.min(1,e)}></rect>`:Z)}_hoverValues(t){const e=this._history,s=!!e&&qt(e.date)===qt(Ft(this._day))&&t<=e.end,i=e=>{let s;for(const[i,n]of e){if(i>t)break;s=n}return s};return{schedule:St(this._pts(),t),current:s?i(e.current):void 0,target:s?i(e.target):void 0}}_renderCrosshair(t,e,s){const i=this._hover;if(void 0===i||this._draft||!this._scale)return Z;const{lo:n,hi:r}=this._scale,o=this._hoverValues(i),a=t=>e(kt(t,n,r));return F`<g class="crosshair">
      <line x1=${t(i)} x2=${t(i)} y1=${Lt} y2=${Lt+s}></line>
      <circle class="dot schedule" cx=${t(i)} cy=${a(o.schedule)} r="3.5"></circle>
      ${void 0!==o.target?F`<circle class="dot target" cx=${t(i)} cy=${a(o.target)} r="3.5"></circle>`:Z}
      ${void 0!==o.current?F`<circle class="dot current" cx=${t(i)} cy=${a(o.current)} r="3.5"></circle>`:Z}
    </g>`}_renderTooltip(){const t=this._hover;if(void 0===t||this._draft||!this._scale)return Z;const e=this._t,s=this._hoverValues(t),i=this._scale.x(t),n=i>this._width-160?`right:${this._width-i+12}px`:`left:${i+12}px`;return V`<div class="tooltip" style=${n}>
      <b>${bt(t)}</b>
      <div><span><i class="line schedule"></i>${e.legend_schedule}</span><span>${this._fmtTemp(s.schedule)}</span></div>
      ${void 0!==s.current?V`<div><span><i class="line current"></i>${e.legend_current}</span><span>${this._fmtTemp(s.current)}</span></div>`:Z}
      ${void 0!==s.target?V`<div><span><i class="line target"></i>${e.legend_target}</span><span>${this._fmtTemp(s.target)}</span></div>`:Z}
    </div>`}_renderDragLabel(t,e){const s=this._scale,i=t[e.index];if(!i)return Z;const n="seg"===e.kind?this._fmtTemp(i.t):`${bt(i.m)}`,r="seg"===e.kind?(s.x(i.m)+s.x(At(t,e.index)))/2:s.x(i.m),o=s.y(i.t)-22;return F`<g class="drag-label">
      <rect x=${r-24} y=${o-12} width="48" height="18" rx="4"></rect>
      <text x=${r} y=${o+1} text-anchor="middle">${n}</text>
    </g>`}get _suggestions(){return!this._config?.settings||this._draft?[]:this._info?.suggestions??[]}get _aiFull(){if(this._config?.settings&&!this._draft)return this._info?.ai_full??void 0}_renderAiIcon(t="ai-icon"){return void 0===this._aiIcon&&this.hass&&(this._aiIcon=null,function(t){(!Ht||Date.now()-Nt>12e5)&&(Nt=Date.now(),Ht=t.callWS({type:"brands/access_token"}).then(t=>t.token).catch(()=>null));const e=t.themes?.darkMode;return Ht.then(t=>t?`/api/brands/integration/ai_task/${e?"dark_":""}icon.png?token=${t}`:null)}(this.hass).then(t=>this._aiIcon=t)),this._aiIcon?V`<img class=${t} src=${this._aiIcon} alt="AI" @error=${()=>this._aiIcon=null} />`:V`<ha-icon class=${t} icon="mdi:creation"></ha-icon>`}async _askAi(){if(this.hass&&this._config){this._aiBusy=!0,this._aiNote=void 0;try{const t=await this.hass.callWS({type:"heating_schedule/suggestion/ask_ai",entity_id:this._config.entity});this._info=t.info,t.count||(this._aiNote=this._t.ai_none),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._aiBusy=!1}}}_renderSuggestionMarkers(t,e,s,i){const n=this._scale;if(!n)return Z;const r=t=>s(kt(t,n.lo,n.hi)),o=this._aiFull?.week[this._day],a=o?vt(o):void 0,h=a?.map((t,s)=>s?`H${e(t.m)}V${r(t.t)}`:`M${e(t.m)},${r(t.t)}`).join("").concat(`H${e(yt)}`);return[h?F`<path class="suggestion-full" d=${h}></path>`:Z,...this._suggestions.map((s,n)=>{if(!s.days.includes(this._day))return Z;const o=function(t){return"shift"===t.kind?{m:t.params.to??t.start,t:t.temp}:{m:t.start,t:t.temp}}(s),a=St(t,s.start),h=Math.min(r(s.temp),r(a));return F`<g class="suggestion">
        <rect class="suggestion-diff" x=${e(s.start)} y=${h}
          width=${Math.max(1,e(s.end)-e(s.start))} height=${Math.abs(r(s.temp)-r(a))}></rect>
        <line x1=${e(o.m)} x2=${e(o.m)} y1=${r(o.t)-4} y2=${Lt+i}></line>
        <circle cx=${e(o.m)} cy=${r(o.t)-13} r="9"></circle>
        <text x=${e(o.m)} y=${r(o.t)-9} text-anchor="middle">${n+1}</text>
      </g>`})]}_renderSuggestions(){const t=this._suggestions,e=this._aiFull,s=this._t;if(!t.length&&!e)return this._aiNote?V`<div class="suggestions"><div class="muted">${this._aiNote}</div></div>`:Z;const i=t=>this._fmtTemp(t),n=t=>V`<span class="buttons">
      <button ?disabled=${!!this._suggestBusy} @click=${()=>this._suggestion("dismiss",t)}>
        ${s.suggest_dismiss}
      </button>
      <button class="primary" ?disabled=${!!this._suggestBusy} @click=${()=>this._suggestion("apply",t)}>
        ${s.suggest_apply}
      </button>
    </span>`;return V`<div class="suggestions">
      ${e?V`<div class="suggestion-row">
            ${this._renderAiIcon()}
            <span class="text">${s.ai_full}</span>
            ${n(e.id)}
          </div>`:Z}
      ${t.map((t,e)=>V`<div class="suggestion-row">
          <span class="num">${e+1}</span>
          ${"ai"===t.source?this._renderAiIcon("ai-icon small"):Z}
          <span class="text">${It(t,this._info?.days,s,i)}</span>
          ${n(t.id)}
        </div>`)}
    </div>`}async _suggestion(t,e){if(this.hass&&this._config){this._suggestBusy=e;try{const s=await this.hass.callWS({type:`heating_schedule/suggestion/${t}`,entity_id:this._config.entity,suggestion_id:e});s&&(this._info=s),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._suggestBusy=void 0}}}_renderSummary(){const t=this._pts();return V`
      <div class="points">
        ${t.map((e,s)=>V`<span class="chip">${bt(e.m)}–${bt(At(t,s))}
            <b>${this._fmtTemp(e.t)}</b></span>`)}
      </div>
      <div class="actions">
        <span class="spacer"></span>
        ${this._config?.settings&&this._info?.ai_available?V`<button
              class="ai"
              title=${this._t.ai_ask}
              aria-label=${this._t.ai_ask}
              ?disabled=${this._aiBusy}
              @click=${this._askAi}
            >
              ${this._renderAiIcon()} ${this._aiBusy?this._t.ai_busy:Z}
            </button>`:Z}
        <button class="primary" @click=${this._startEdit}>${this._t.edit}</button>
      </div>
    `}_renderEditor(){const t=this._t,e=this._pts(),s=void 0!==this._selected?e[this._selected]:void 0,{step:i}=this._limits,n=!this._info||!function(t,e){return JSON.stringify(ft.map(e=>t[e]))===JSON.stringify(ft.map(t=>e[t]))}(this._draft,this._info.days);return V`
      ${s?V`<div class="segment">
            ${this._selected>0?V`<button class="icon" @click=${()=>this._shiftStart(-15)}>‹</button>`:Z}
            <span class="range">${bt(s.m)}–${bt(At(e,this._selected))}</span>
            ${this._selected>0?V`<button class="icon" @click=${()=>this._shiftStart(15)}>›</button>`:Z}
            <span class="spacer"></span>
            <button class="icon" @click=${()=>this._bump(-i)}>−</button>
            <span class="temp">${this._fmtTemp(s.t)}</span>
            <button class="icon" @click=${()=>this._bump(i)}>+</button>
            <span class="spacer"></span>
            <button @click=${this._split}>${t.split}</button>
            <button @click=${this._remove} .disabled=${e.length<=1}>${t.remove}</button>
          </div>`:V`<div class="hint">${t.edit_hint}</div>`}
      ${this._copyOpen?this._renderCopy():Z}
      <div class="actions">
        <button @click=${()=>this._copyOpen=!this._copyOpen}>${t.copy}</button>
        <span class="spacer"></span>
        <button @click=${this._cancel}>${t.cancel}</button>
        <button class="primary" @click=${this._save} .disabled=${!n||this._saving}>${t.save}</button>
      </div>
    `}_renderCopy(){const t=this._t,e=t=>{this._copyTargets=this._copyTargets.includes(t)?this._copyTargets.filter(e=>e!==t):[...this._copyTargets,t]},s=t=>{this._copyTargets=t.filter(t=>t!==this._day)};return V`<div class="copy">
      ${ft.map((s,i)=>V`<button
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
    </div>`}_selectDay(t){this._day=t,this._selected=void 0,this._copyTargets=[]}_startEdit(){var t;this._info&&(this._draft=(t=this._info.days,Object.fromEntries(ft.map(e=>[e,t[e].map(t=>({...t}))]))),this._selected=void 0)}_cancel(){this._draft=void 0,this._selected=void 0,this._copyOpen=!1,this._copyTargets=[]}async _save(){if(this._draft&&this.hass){this._saving=!0;try{this._info=await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,days:this._draft}),this._cancel(),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._saving=!1}}}async _toggleEnabled(t){const e=t.target.checked;try{await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,enabled:e})}catch(t){this._error=t?.message??String(t)}}_bump(t){if(void 0===this._selected)return;const{min:e,max:s,step:i}=this._limits,n=this._pts(),r=kt(xt(n[this._selected].t+t,i),e,s);this._setPts(zt(n,this._selected,r))}_shiftStart(t){const e=this._selected;if(void 0===e||0===e)return;const s=this._pts(),i=Et(s,e,s[e].m+t),n=Mt(i);n.length!==i.length&&(this._selected=void 0),this._setPts(n)}_split(){if(void 0===this._selected)return;const t=Tt(this._pts(),this._selected);t&&(this._setPts(t),this._selected+=1)}_remove(){void 0!==this._selected&&(this._setPts(function(t,e){if(t.length<=1)return t;const s=t.filter((t,s)=>s!==e);return s[0]={...s[0],m:0},s}(this._pts(),this._selected)),this._selected=void 0)}_applyCopy(){if(!this._draft)return;const t=this._draft[this._day],e={...this._draft};for(const s of this._copyTargets)e[s]=t.map(t=>({...t}));this._draft=e,this._copyOpen=!1,this._copyTargets=[]}_local(t){const e=t.currentTarget.getBoundingClientRect();return[t.clientX-e.left,t.clientY-e.top]}_onPointerDown(t){if(this._trackTouch(t))return;if(!this._draft)return"mouse"===t.pointerType&&0===t.button&&this._zoomed&&(t.currentTarget.setPointerCapture(t.pointerId),this._pan={pointerId:t.pointerId,x0:t.clientX,start:this._view[0]}),void this._onHover(t);const e=t.target,s=e.getAttribute("data-kind");if(!s)return void(this._selected=void 0);t.preventDefault(),t.currentTarget.setPointerCapture(t.pointerId);const i=Number(e.getAttribute("data-i"));this._range=this._yRange(this._pts()),this._drag={kind:s,index:i,pointerId:t.pointerId,x0:t.clientX,y0:t.clientY,moved:!1},"seg"===s&&(this._selected=i)}_onPointerLeave(t){window.clearTimeout(this._hoverTimer),"mouse"===t.pointerType?this._hover=void 0:this._hoverTimer=window.setTimeout(()=>this._hover=void 0,3e3)}_onHover(t){if(this._draft||!this._scale)return;window.clearTimeout(this._hoverTimer);const e=5*Math.round(this._scale.minute(this._local(t)[0])/5),[s,i]=this._view;this._hover=e<s||e>i?void 0:Math.min(e,1439)}_onPointerMove(t){if(this._touches.has(t.pointerId)&&this._touches.set(t.pointerId,this._local(t)[0]),this._pinch)return t.preventDefault(),void this._onPinch();const e=this._pan;if(e&&t.pointerId===e.pointerId&&this._scale){const s=this._view[1]-this._view[0];return this._setView(e.start-(t.clientX-e.x0)/this._scale.width*s,s),void(this._hover=void 0)}if(!this._draft)return void this._onHover(t);const s=this._drag;if(!s||t.pointerId!==s.pointerId||!this._scale)return;if(!s.moved&&Math.hypot(t.clientX-s.x0,t.clientY-s.y0)<4)return;s.moved=!0;const[i,n]=this._local(t),r=this._pts();if("seg"===s.kind){const{min:t,max:e,step:i}=this._limits,o=kt(xt(this._scale.temp(n),i),Math.max(t,this._scale.lo),Math.min(e,this._scale.hi));o!==r[s.index].t&&this._setPts(zt(r,s.index,o))}else{const t=xt(this._scale.minute(i),15);t!==r[s.index].m&&this._setPts(Et(r,s.index,t))}this.requestUpdate()}_onPointerUp(t){this._untrackTouch(t);const e=this._drag;if(e&&t.pointerId===e.pointerId){if("edge"===e.kind&&e.moved){const t=this._pts(),e=Mt(t);e.length!==t.length&&(this._selected=void 0),this._setPts(e)}this._drag=void 0,this._range=void 0}}_onDoubleClick(t){if(!this._draft)return void this._resetZoom();if(!this._scale)return;const e=t.target;if("seg"!==e.getAttribute("data-kind"))return;const s=Number(e.getAttribute("data-i")),[i]=this._local(t),n=Tt(this._pts(),s,this._scale.minute(i));n&&(this._setPts(n),this._selected=s+1)}}Zt.styles=o`
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
    ha-card.disabled {
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 86%,
        #000
      );
    }
    ha-card.disabled > :not(.header) {
      filter: grayscale(0.75) brightness(0.92);
      opacity: 0.7;
    }
    ha-card.disabled .name {
      opacity: 0.7;
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
    button.mode {
      display: inline-flex;
      padding: 4px;
      background: none;
      border-radius: 50%;
      --mdc-icon-size: 20px;
    }
    button.mode:hover:not(:disabled) {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
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
    .swatch.band {
      background: var(--hs-schedule);
      opacity: 0.3;
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
    .suggestion-full {
      fill: none;
      stroke: var(--hs-suggest);
      stroke-width: 2;
      stroke-dasharray: 5 3;
    }
    .ai-icon {
      width: 20px;
      height: 20px;
      --mdc-icon-size: 20px;
      flex: none;
    }
    .ai-icon.small {
      width: 16px;
      height: 16px;
      --mdc-icon-size: 16px;
    }
    button.ai {
      display: inline-flex;
      align-items: center;
      gap: 6px;
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
      touch-action: pan-y; /* a horizontal swipe moves the tooltip, a vertical one scrolls; pinch zooms */
    }
    .chart.zoomed:not(.editing) svg {
      cursor: grab;
    }
    .zoom-reset {
      position: absolute;
      top: 0;
      right: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      --mdc-icon-size: 18px;
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
    .band {
      fill: var(--hs-schedule);
      fill-opacity: 0.18;
      pointer-events: none;
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
  `,t([ut({attribute:!1})],Zt.prototype,"hass",void 0),t([_t()],Zt.prototype,"_config",void 0),t([_t()],Zt.prototype,"_info",void 0),t([_t()],Zt.prototype,"_error",void 0),t([_t()],Zt.prototype,"_modeBusy",void 0),t([_t()],Zt.prototype,"_day",void 0),t([_t()],Zt.prototype,"_draft",void 0),t([_t()],Zt.prototype,"_selected",void 0),t([_t()],Zt.prototype,"_drag",void 0),t([_t()],Zt.prototype,"_history",void 0),t([_t()],Zt.prototype,"_width",void 0),t([_t()],Zt.prototype,"_copyOpen",void 0),t([_t()],Zt.prototype,"_copyTargets",void 0),t([_t()],Zt.prototype,"_saving",void 0),t([_t()],Zt.prototype,"_hover",void 0),t([_t()],Zt.prototype,"_suggestBusy",void 0),t([_t()],Zt.prototype,"_aiBusy",void 0),t([_t()],Zt.prototype,"_aiNote",void 0),t([_t()],Zt.prototype,"_aiIcon",void 0),t([_t()],Zt.prototype,"_view",void 0),customElements.get("heating-schedule-card")||customElements.define("heating-schedule-card",Zt);class Yt extends Zt{static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"climate"}}},{name:"name",selector:{text:{}}},{name:"height",selector:{number:{min:120,max:600,mode:"box",unit_of_measurement:"px"}}}],computeLabel:t=>"height"===t.name?"Height":void 0}}static getStubConfig(t){return{entity:Object.keys(t.states).find(t=>t.startsWith("climate."))??""}}setConfig(t){super.setConfig({...t,settings:!1,readonly:!0})}getCardSize(){return 4}getGridOptions(){return{columns:12,min_columns:4,rows:"auto"}}}customElements.get("heating-schedule-chart-card")||customElements.define("heating-schedule-chart-card",Yt),window.customCards=window.customCards??[],window.customCards.some(t=>"heating-schedule-chart-card"===t.type)||window.customCards.push({type:"heating-schedule-chart-card",name:"Heating Schedule chart",description:"Today's heating schedule of a thermostat as a temperature chart (read-only).",preview:!0});const Kt=["binary_sensor","person","device_tracker","input_boolean","switch","light"];function Xt(t){return"number"==typeof t&&Number.isFinite(t)?t:null}async function Jt(){if(!customElements.get("ha-form")){try{const t=await(window.loadCardHelpers?.()),e=await(t?.createCardElement({type:"entities",entities:[]}));await(e?.constructor?.getConfigElement?.())}catch{}await Promise.race([customElements.whenDefined("ha-form"),new Promise(t=>setTimeout(t,3e3))])}}class Gt extends ct{constructor(){super(...arguments),this.narrow=!1,this._busy=!1,this._cards=new Map,this._loading=!1,this._onSettings=async t=>{const e=t.detail.info;await Jt(),this._dialogError=void 0,this._dialog={kind:"settings",info:e,data:{title:e.title,presence_entities:e.presence.entities,band_below:e.band?.below??void 0,band_above:e.band?.above??void 0}}},this._label=t=>this._t[`field_${t.name}`]??t.name,this._helper=t=>t.name.startsWith("band_")?this._t.band_help:void 0}get _t(){return mt(this.hass?.locale?.language??this.hass?.language)}get _admin(){return!1!==this.hass?.user?.is_admin}connectedCallback(){super.connectedCallback(),this._entries&&this._load(),this.addEventListener("heating-schedule-settings",this._onSettings)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("heating-schedule-settings",this._onSettings)}willUpdate(t){t.has("hass")&&this.hass&&!this._entries&&this._load()}updated(){for(const t of this._cards.values())t.hass=this.hass}async _load(){if(this.hass&&!this._loading){this._loading=!0;try{const t=await this.hass.callWS({type:"heating_schedule/list"});this._entries=t.sort((t,e)=>t.title.localeCompare(e.title));const e=new Set(t.map(t=>t.climate_entity));for(const t of[...this._cards.keys()])e.has(t)||this._cards.delete(t);this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._loading=!1}}}_groups(t){const e=this.hass,s=t=>{const s=e?.entities?.[t.climate_entity],i=s?.area_id??(s?.device_id?e?.devices?.[s.device_id]?.area_id:void 0);return i?e?.areas?.[i]:void 0},i=new Map;for(const n of t){const t=s(n),r=t?.floor_id?e?.floors?.[t.floor_id]:void 0,o=r?.floor_id??"";let a=i.get(o);a||(a={key:o,name:r?.name,entries:[],level:r?r.level??0:Number.POSITIVE_INFINITY,sort:new Map},i.set(o,a)),a.entries.push(n),a.sort.set(n,t?.name??"")}const n=[...i.values()].sort((t,e)=>t.level-e.level||(t.name??"").localeCompare(e.name??"")),r=t=>(e,s)=>{const i=t.get(e),n=t.get(s);return Number(!i)-Number(!n)||i.localeCompare(n)||e.title.localeCompare(s.title)};for(const t of n)t.entries.sort(r(t.sort));return n}_renderCards(t){const e=this._groups(t);return 1!==e.length||e[0].name?e.map(t=>V`<section>
        <h2 class="floor">${t.name??this._t.panel_no_floor}</h2>
        <div class="cards">${t.entries.map(t=>this._card(t))}</div>
      </section>`):V`<div class="cards">${t.map(t=>this._card(t))}</div>`}_card(t){let e=this._cards.get(t.climate_entity);return e||(e=document.createElement("heating-schedule-card"),this._cards.set(t.climate_entity,e)),e.setConfig(this._cardConfig(t.climate_entity)),e.hass=this.hass,e}_cardConfig(t){return{type:"custom:heating-schedule-card",entity:t,settings:!0}}async _openAdd(){await Jt(),this._dialogError=void 0,this._dialog={kind:"add",data:{init:"empty"}}}_close(){this._busy||(this._dialog=void 0)}get _aiAvailable(){return Object.keys(this.hass?.states??{}).some(t=>t.startsWith("ai_task."))}_schema(t){if("add"===t.kind){const t=this._t;return[{name:"entity",required:!0,selector:{entity:{filter:[{domain:"climate"}],exclude_entities:(this._entries??[]).map(t=>t.climate_entity)}}},...this._aiAvailable?[{name:"init",selector:{select:{mode:"list",options:[{value:"empty",label:t.init_empty},{value:"ai",label:t.init_ai}]}}}]:[]]}return[{name:"title",required:!0,selector:{text:{}}},{name:"presence_entities",selector:{entity:{multiple:!0,filter:[{domain:Kt}]}}},...["band_below","band_above"].map(t=>({name:t,selector:{number:{min:0,max:10,step:.1,mode:"box",unit_of_measurement:"°"}}}))]}async _run(t){this._busy=!0,this._dialogError=void 0;try{await t(),this._busy=!1,this._dialog=void 0,await this._load()}catch(t){this._busy=!1,this._dialogError=t?.message??String(t)}}_submit(){const t=this._dialog;if(!t||!this.hass)return;const e=this.hass;if("add"===t.kind){const s=t.data.entity;if(!s)return;const i=this._aiAvailable&&"ai"===t.data.init?"ai":"empty";return void this._run(()=>e.callWS({type:"heating_schedule/add",entity_id:s,init:i}))}const s=t.data,i=String(s.title??"").trim();i&&this._run(()=>e.callWS({type:"heating_schedule/configure",entity_id:t.info.climate_entity,title:i,presence_entities:s.presence_entities??[],band_below:Xt(s.band_below),band_above:Xt(s.band_above)}))}_removeSchedule(){const t=this._dialog;if("settings"!==t?.kind||!this.hass)return;const e=this.hass;confirm(this._t.remove_confirm.replace("{name}",t.info.title))&&this._run(()=>e.callWS({type:"heating_schedule/remove",entity_id:t.info.climate_entity}))}render(){const t=this._t,e=this._entries;return V`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="title">${t.panel_title}</div>
        ${this._admin?V`<button class="tool" title=${t.panel_add} aria-label=${t.panel_add} @click=${this._openAdd}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>`:Z}
      </div>
      <div class="content">
        ${this._error?V`<div class="error">${this._error}</div>`:Z}
        ${e&&!e.length?V`<p class="empty">${t.panel_empty}</p>`:Z}
        ${this._renderCards(e??[])}
      </div>
      ${this._renderDialog()}
    `}_renderDialog(){const t=this._dialog;if(!t)return Z;const e=this._t,s="add"===t.kind?e.panel_add:t.info.title;return V`
      <div class="backdrop" @click=${this._close}></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label=${s}
        @keydown=${t=>"Escape"===t.key&&this._close()}
      >
        <h2>${s}</h2>
        ${"settings"===t.kind?this._renderClimate(t.info.climate_entity):Z}
        ${"settings"===t.kind?V`<p class="help">${e.presence_help}</p>`:Z}
        <ha-form
          .hass=${this.hass}
          .data=${t.data}
          .schema=${this._schema(t)}
          .computeLabel=${this._label}
          .computeHelper=${this._helper}
          .disabled=${this._busy}
          @value-changed=${e=>{this._dialog={...t,data:e.detail.value}}}
        ></ha-form>
        ${this._dialogError?V`<div class="error">${this._dialogError}</div>`:Z}
        <div class="buttons">
          ${"settings"===t.kind?V`<button class="danger" .disabled=${this._busy} @click=${this._removeSchedule}>
                ${e.remove_schedule}
              </button>`:Z}
          <span class="spacer"></span>
          <button .disabled=${this._busy} @click=${this._close}>${e.cancel}</button>
          <button class="primary" .disabled=${this._busy} @click=${this._submit}>
            ${"add"===t.kind?e.add_apply:e.save}
          </button>
        </div>
      </div>
    `}_renderClimate(t){const e=this.hass?.states[t]?.attributes.friendly_name;return V`<div class="climate">
      <span class="label">${this._t.field_entity}</span>
      <span>${e?V`${e} <code>${t}</code>`:V`<code>${t}</code>`}</span>
    </div>`}}Gt.styles=o`
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
  `,t([ut({attribute:!1})],Gt.prototype,"hass",void 0),t([ut({type:Boolean})],Gt.prototype,"narrow",void 0),t([_t()],Gt.prototype,"_entries",void 0),t([_t()],Gt.prototype,"_error",void 0),t([_t()],Gt.prototype,"_dialog",void 0),t([_t()],Gt.prototype,"_dialogError",void 0),t([_t()],Gt.prototype,"_busy",void 0),customElements.get("heating-schedule-panel")||customElements.define("heating-schedule-panel",Gt);
