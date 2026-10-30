function t(t,e,i,s){var a,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var r=t.length-1;r>=0;r--)(a=t[r])&&(o=(n<3?a(o):n>3?a(e,i,o):a(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),a=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=a.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&a.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)},r=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:c,defineProperty:h,getOwnPropertyDescriptor:l,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,m=g?g.emptyScript:"",f=_.reactiveElementPolyfillSupport,y=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!c(t,e),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&h(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:a}=l(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);a?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),a=e.litNonce;void 0!==a&&s.setAttribute("nonce",a),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const a=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==a?this.removeAttribute(s):this.setAttribute(s,a),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),a="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const n=a.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,a){if(void 0!==t){const n=this.constructor;if(!1===s&&(a=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??$)(a,e)||i.useDefault&&i.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:a},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==a||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,f?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=t=>t,A=w.trustedTypes,z=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,M="?"+E,T=`<${M}>`,C=document,P=()=>C.createComment(""),j=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,O="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,I=/-->/g,N=/>/g,U=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,V=/"/g,B=/^(?:script|style|textarea|title)$/i,W=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),L=W(1),F=W(2),Z=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),Y=new WeakMap,K=C.createTreeWalker(C,129);function X(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==z?z.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let a,n=2===e?"<svg>":3===e?"<math>":"",o=H;for(let e=0;e<i;e++){const i=t[e];let r,c,h=-1,l=0;for(;l<i.length&&(o.lastIndex=l,c=o.exec(i),null!==c);)l=o.lastIndex,o===H?"!--"===c[1]?o=I:void 0!==c[1]?o=N:void 0!==c[2]?(B.test(c[2])&&(a=RegExp("</"+c[2],"g")),o=U):void 0!==c[3]&&(o=U):o===U?">"===c[0]?(o=a??H,h=-1):void 0===c[1]?h=-2:(h=o.lastIndex-c[2].length,r=c[1],o=void 0===c[3]?U:'"'===c[3]?V:R):o===V||o===R?o=U:o===I||o===N?o=H:(o=U,a=void 0);const d=o===U&&t[e+1].startsWith("/>")?" ":"";n+=o===H?i+T:h>=0?(s.push(r),i.slice(0,h)+S+i.slice(h)+E+d):i+E+(-2===h?e:d)}return[X(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class G{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let a=0,n=0;const o=t.length-1,r=this.parts,[c,h]=J(t,e);if(this.el=G.createElement(c,i),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=K.nextNode())&&r.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=h[n++],i=s.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);r.push({type:1,index:a,name:o[2],strings:i,ctor:"."===o[1]?st:"?"===o[1]?at:"@"===o[1]?nt:it}),s.removeAttribute(t)}else t.startsWith(E)&&(r.push({type:6,index:a}),s.removeAttribute(t));if(B.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],P()),K.nextNode(),r.push({type:2,index:++a});s.append(t[e],P())}}}else if(8===s.nodeType)if(s.data===M)r.push({type:2,index:a});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)r.push({type:7,index:a}),t+=E.length-1}a++}}static createElement(t,e){const i=C.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===Z)return e;let a=void 0!==s?i._$Co?.[s]:i._$Cl;const n=j(e)?void 0:e._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),void 0===n?a=void 0:(a=new n(t),a._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=a:i._$Cl=a),void 0!==a&&(e=Q(t,a._$AS(t,e.values),a,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??C).importNode(e,!0);K.currentNode=s;let a=K.nextNode(),n=0,o=0,r=i[0];for(;void 0!==r;){if(n===r.index){let e;2===r.type?e=new et(a,a.nextSibling,this,t):1===r.type?e=new r.ctor(a,r.name,r.strings,this,t):6===r.type&&(e=new ot(a,this,t)),this._$AV.push(e),r=i[++o]}n!==r?.index&&(a=K.nextNode(),n++)}return K.currentNode=C,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),j(t)?t===q||null==t||""===t?(this._$AH!==q&&this._$AR(),this._$AH=q):t!==this._$AH&&t!==Z&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==q&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(C.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=G.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new G(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const a of t)s===e.length?e.push(i=new et(this.O(P()),this.O(P()),this,this.options)):i=e[s],i._$AI(a),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,a){this.type=1,this._$AH=q,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(t,e=this,i,s){const a=this.strings;let n=!1;if(void 0===a)t=Q(this,t,e,0),n=!j(t)||t!==this._$AH&&t!==Z,n&&(this._$AH=t);else{const s=t;let o,r;for(t=a[0],o=0;o<a.length-1;o++)r=Q(this,s[i+o],e,o),r===Z&&(r=this._$AH[o]),n||=!j(r)||r!==this._$AH[o],r===q?t=q:t!==q&&(t+=(r??"")+a[o+1]),this._$AH[o]=r}n&&!s&&this.j(t)}j(t){t===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===q?void 0:t}}class at extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==q)}}class nt extends it{constructor(t,e,i,s,a){super(t,e,i,s,a),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??q)===Z)return;const i=this._$AH,s=t===q&&i!==q||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,a=t!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const rt=w.litHtmlPolyfillSupport;rt?.(G,et),(w.litHtmlVersions??=[]).push("3.3.3");const ct=globalThis;class ht extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let a=s._$litPart$;if(void 0===a){const t=i?.renderBefore??null;s._$litPart$=a=new et(e.insertBefore(P(),t),t,void 0,i??{})}return a._$AI(t),a})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}}ht._$litElement$=!0,ht.finalized=!0,ct.litElementHydrateSupport?.({LitElement:ht});const lt=ct.litElementPolyfillSupport;lt?.({LitElement:ht}),(ct.litElementVersions??=[]).push("4.2.2");const dt={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:$},pt=(t=dt,e,i)=>{const{kind:s,metadata:a}=i;let n=globalThis.litPropertyMetadata.get(a);if(void 0===n&&globalThis.litPropertyMetadata.set(a,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const a=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,a,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const a=this[s];e.call(this,i),this.requestUpdate(s,a,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function ut(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function _t(t){return ut({...t,state:!0,attribute:!1})}const gt={en:{days:["Mo","Tu","We","Th","Fr","Sa","Su"],schedule:"Schedule",now:"Now",target:"target",next:"next",at:"at",mode_off:"off",mode_heat:"heating",mode_turn_on:"turn the thermostat on",mode_turn_off:"turn the thermostat off",off_hint:"The thermostat is off. The schedule only sets the target temperature.",legend_schedule:"schedule",legend_current:"temperature",legend_target:"actual target",legend_band:"sensitivity",legend_vacation:"holiday",legend_schedule_paused:"schedule (paused)",vacation_short:"holiday",vacation_collapse:"Collapse",vacation_title:"Holiday",vacation_on:"On",vacation_temp:"Temperature",vacation_until:"Return",vacation_until_none:"Until switched off",vacation_until_clear:"Clear the return date",vacation_lower:"Lower",vacation_higher:"Higher",vacation_active:"Every enabled schedule holds {temp}.",vacation_left:"{left} left.",vacation_hint:"Holds one temperature everywhere for a while. Schedules stay as they are; these days do not count for suggestions.",history_from:"history from",edit:"Edit",save:"Save",cancel:"Cancel",split:"Split",remove:"Remove",copy:"Copy day to…",copy_apply:"Copy",workdays:"Mon–Fri",weekend:"Weekend",all:"All",edit_hint:"Drag a level up or down, drag a boundary sideways. Double-click a level to split it. Tap a level for more options.",legend_typical:"typical presence",legend_presence:"presence that day",legend_heating:"heating",suggest_apply:"Apply",zoom_reset:"Show the whole day",ai_ask:"Ask the AI for suggestions",ai_busy:"Asking…",ai_none:"The AI has no changes to suggest.",ai_full:"Schedule proposed by the AI",field_init:"Schedule",init_empty:"Empty",init_ai:"Proposed by the AI",suggest_dismiss:"Dismiss",suggest_lower_at:"Lower to {temp} at {to} instead of {from}",suggest_raise_at:"{temp} from {to} instead of {from}",suggest_setback:"Lower to {temp} {start}–{end}",suggest_temp:"{temp} instead of {from_temp}, {start}–{end}",weeks:"wk",panel_title:"Heating",panel_settings:"Settings",panel_empty:"No thermostats yet. Add one with the + button.",panel_no_floor:"Other",panel_add:"Add thermostat",add_apply:"Add",field_entity:"Thermostat",field_title:"Name",field_presence_entities:"Room presence entities (any of them)",field_band_below:"Sensitivity below the target",field_band_above:"Sensitivity above the target",band_help:"The band drawn along the schedule. Empty: from the thermostat's deadzone (below the target only) or temperature delta (± the target) entity.",presence_help:"The room is occupied when any presence entity is on (OR) (person / device tracker: home). These entities also build the typical-presence profile. They are shown on the chart and do not change the temperature.",remove_schedule:"Remove schedule",remove_confirm:"Remove the schedule of {name}? Its schedule, switch and sensors will be deleted.",not_found:"This thermostat has no schedule. Add it under Settings → Devices & services → Heating Schedule."},pl:{days:["Pn","Wt","Śr","Cz","Pt","So","Nd"],schedule:"Harmonogram",now:"Teraz",target:"zadana",next:"następnie",at:"o",mode_off:"wyłączony",mode_heat:"grzanie",mode_turn_on:"włącz termostat",mode_turn_off:"wyłącz termostat",off_hint:"Termostat jest wyłączony. Harmonogram ustawia tylko temperaturę zadaną.",legend_schedule:"harmonogram",legend_current:"temperatura",legend_target:"zadana (faktyczna)",legend_band:"czułość",legend_vacation:"wakacje",legend_schedule_paused:"harmonogram (wstrzymany)",vacation_short:"wakacje",vacation_collapse:"Zwiń",vacation_title:"Wakacje",vacation_on:"Włączone",vacation_temp:"Temperatura",vacation_until:"Powrót",vacation_until_none:"Do wyłączenia ręcznie",vacation_until_clear:"Usuń datę powrotu",vacation_lower:"Mniej",vacation_higher:"Więcej",vacation_active:"Wszystkie włączone harmonogramy trzymają {temp}.",vacation_left:"Zostało {left}.",vacation_hint:"Na jakiś czas jedna temperatura wszędzie. Harmonogramy zostają bez zmian, a te dni nie liczą się do sugestii.",history_from:"historia z",edit:"Edytuj",save:"Zapisz",cancel:"Anuluj",split:"Podziel",remove:"Usuń",copy:"Kopiuj dzień na…",copy_apply:"Kopiuj",workdays:"Pn–Pt",weekend:"Weekend",all:"Wszystkie",edit_hint:"Przeciągnij poziom w górę lub w dół, a granicę w bok. Dwuklik na poziomie dzieli go na dwa. Dotknij poziomu, żeby zobaczyć więcej opcji.",legend_typical:"typowa obecność",legend_presence:"obecność tego dnia",legend_heating:"grzanie",suggest_apply:"Zastosuj",zoom_reset:"Pokaż cały dzień",ai_ask:"Zapytaj AI o sugestie",ai_busy:"Pytam…",ai_none:"AI nie proponuje zmian.",ai_full:"Harmonogram zaproponowany przez AI",field_init:"Harmonogram",init_empty:"Pusty",init_ai:"Zaproponowany przez AI",suggest_dismiss:"Odrzuć",suggest_lower_at:"Obniżka do {temp} o {to} zamiast {from}",suggest_raise_at:"{temp} od {to} zamiast {from}",suggest_setback:"Obniżka do {temp} w godz. {start}–{end}",suggest_temp:"{temp} zamiast {from_temp} w godz. {start}–{end}",weeks:"tyg.",panel_title:"Ogrzewanie",panel_settings:"Ustawienia",panel_empty:"Brak termostatów. Dodaj pierwszy przyciskiem +.",panel_no_floor:"Inne",panel_add:"Dodaj termostat",add_apply:"Dodaj",field_entity:"Termostat",field_title:"Nazwa",field_presence_entities:"Encje obecności w pokoju (wystarczy dowolna)",field_band_below:"Czułość poniżej zadanej",field_band_above:"Czułość powyżej zadanej",band_help:"Pas rysowany wzdłuż harmonogramu. Puste: z encji termostatu deadzone (tylko poniżej zadanej) albo temperature delta (± zadana).",presence_help:"Pokój jest zajęty, gdy którakolwiek encja obecności jest włączona (LUB) (osoba / urządzenie: w domu). Z tych encji powstaje też profil typowej obecności. Są pokazywane na wykresie i nie zmieniają temperatury.",remove_schedule:"Usuń harmonogram",remove_confirm:"Usunąć harmonogram termostatu {name}? Harmonogram, przełącznik i sensory zostaną usunięte.",not_found:"Ten termostat nie ma harmonogramu. Dodaj go w Ustawienia → Urządzenia i usługi → Harmonogram ogrzewania."}};function mt(t){return t?.startsWith("pl")?gt.pl:gt.en}const ft=["mon","tue","wed","thu","fri","sat","sun"],yt=1440;function vt(t){const[e,i]=t.split(":").map(Number);return 60*e+i}function $t(t){const e=Math.floor(t/60),i=Math.round(t%60);return`${String(e).padStart(2,"0")}:${String(i).padStart(2,"0")}`}function bt(t){return t.map(t=>({m:vt(t.time),t:t.temp}))}function xt(t){return t.map(t=>({time:$t(t.m),temp:t.t}))}function wt(t,e){return Math.round(Math.round(t/e)*e*100)/100}function kt(t,e,i){return Math.min(i,Math.max(e,t))}function At(t,e){return e+1<t.length?t[e+1].m:yt}function zt(t){const e=Math.round(t),i=Math.floor(e/60);return i?`${i} h ${e%60} min`:`${e} min`}function St(t,e){let i=t[0].t;for(const s of t){if(s.m>e)break;i=s.t}return i}function Et(t,e,i){return t.map((t,s)=>s===e?{...t,t:i}:t)}function Mt(t,e,i){if(e<=0||e>=t.length)return t;const s=kt(i,t[e-1].m,At(t,e));return t.map((t,i)=>i===e?{...t,m:s}:t)}function Tt(t){const e=[];return t.forEach((i,s)=>{At(t,s)<=i.m||(e.length&&e[e.length-1].m===i.m&&e.pop(),e.push(i))}),e.length?(e[0]={...e[0],m:0},e):[{m:0,t:t[t.length-1].t}]}function Ct(t,e,i){const s=t[e].m,a=At(t,e),n=wt(i??(s+a)/2,15);return n<=s||n>=a?null:[...t.slice(0,e+1),{m:n,t:t[e].t},...t.slice(e+1)]}function Pt(t){return ft[(t.getDay()+6)%7]}const jt=["_deadzone_temperature","_temperature_delta"];function Dt(t,e,i=0){const s=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1);if(t<=e.getTime())return Math.max(0,i);if(t>=s.getTime())return yt;const a=new Date(t);return Math.max(60*a.getHours()+a.getMinutes()+a.getSeconds()/60,i)}const Ot=["mon","tue","wed","thu","fri","sat","sun"];function Ht(t){const e=Math.floor(t/60),i=Math.round(t%60);return`${e}:${String(i).padStart(2,"0")}`}function It(t,e,i,s){const a=t.params;let n;if("shift"===t.kind){const o=function(t,e,i){const s=t?.[e];if(!s?.length)return;let a=s[0].temp;for(const t of s){const[e,s]=t.time.split(":").map(Number);if(60*e+s>=i)break;a=t.temp}return a}(e,t.days[0],a.from??t.start);n=(void 0!==o&&(a.temp??t.temp)<o?i.suggest_lower_at:i.suggest_raise_at).replace("{temp}",s(a.temp??t.temp)).replace("{to}",Ht(a.to??t.start)).replace("{from}",Ht(a.from??t.end))}else n="setback"===t.kind?i.suggest_setback.replace("{temp}",s(t.temp)).replace("{start}",Ht(t.start)).replace("{end}",Ht(t.end)):i.suggest_temp.replace("{temp}",s(t.temp)).replace("{from_temp}",s(a.from_temp??t.temp)).replace("{start}",Ht(t.start)).replace("{end}",Ht(t.end));const o=function(t,e){const i=[...new Set(t)].map(t=>Ot.indexOf(t)).sort((t,e)=>t-e);if(7===i.length)return"";const s=i.join(",");if("0,1,2,3,4"===s)return e.workdays;if("5,6"===s)return e.weekend;const a=t=>e.days[t],n=i.every((t,e)=>0===e||t===i[e-1]+1);return n&&i.length>2?`${a(i[0])}–${a(i[i.length-1])}`:i.map(a).join(", ")}(t.days,i);return o?`${n} (${o})`:n}let Nt,Ut=0;const Rt=[15,30,60,120,180,360],Vt=30,Bt=8,Wt=16,Lt=20;function Ft(t){return 60*t.getHours()+t.getMinutes()+t.getSeconds()/60}function Zt(t){const e=(i=new Date,new Date(i.getFullYear(),i.getMonth(),i.getDate()));var i;const s=(ft.indexOf(Pt(e))-ft.indexOf(t)+7)%7;return new Date(e.getFullYear(),e.getMonth(),e.getDate()-s)}function qt(t){const e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}`}class Yt extends ht{constructor(){super(...arguments),this._modeBusy=!1,this._expanded=!1,this._day=Pt(new Date),this._width=0,this._copyOpen=!1,this._copyTargets=[],this._saving=!1,this._aiBusy=!1,this._view=[0,yt],this._touches=new Map,this._subscribeFailed=!1}setConfig(t){if(!t?.entity)throw new Error("entity is required");this._config?.entity!==t.entity&&(this._unsubscribe(),this._info=void 0,this._history=void 0,this._historyKey=void 0,this._draft=void 0,this._error=void 0,this._subscribeFailed=!1),this._config=t}connectedCallback(){super.connectedCallback(),this._historyTimer=window.setInterval(()=>{this._config?.readonly&&(this._day=Pt(new Date)),this._loadHistory(!0)},3e5),this._resize=new ResizeObserver(t=>{const e=Math.floor(t[0].contentRect.width);e&&e!==this._width&&(this._width=e)}),this._observed=void 0}disconnectedCallback(){super.disconnectedCallback(),this._unsubscribe(),window.clearInterval(this._historyTimer),window.clearTimeout(this._hoverTimer),this._resize?.disconnect()}updated(t){this.hass&&this._config&&!this._unsub&&!this._subscribeFailed&&this._subscribe(),(t.has("_day")||t.has("hass")||t.has("_info"))&&this._loadHistory();const e=this.renderRoot.querySelector(".chart");e&&e!==this._observed&&(this._observed=e,this._resize?.disconnect(),this._resize?.observe(e))}get _t(){return mt(this.hass?.locale?.language??this.hass?.language)}_subscribe(){const t=this._config.entity;this._unsub=this.hass.connection.subscribeMessage(t=>{this._info=t,this._error=void 0},{type:"heating_schedule/subscribe",entity_id:t}),this._unsub.catch(t=>{this._subscribeFailed=!0,this._unsub=void 0,this._error="not_found"===t?.code?this._t.not_found:t?.message??String(t)})}_unsubscribe(){this._unsub?.then(t=>t()).catch(()=>{}),this._unsub=void 0}get _presence(){return!!this._info?.presence?.entities.length}async _loadHistory(t=!1){if(!this.hass||!this._config)return;const e=this._config.entity,i=this._presence?this._info?.occupancy_entity??null:null,s=Zt(this._day),a=`${e}|${i}|${qt(s)}`;if(!t&&a===this._historyKey)return;this._historyKey=a;const n=new Date,o=new Date(s.getFullYear(),s.getMonth(),s.getDate()+1),r=o<n?o:n;try{const t=await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:r.toISOString(),entity_ids:i?[e,i]:[e],minimal_response:!1,no_attributes:!1,significant_changes_only:!1});if(a!==this._historyKey)return;const o=r===n?Ft(n):yt,c=[],h=[],l=[];let d,p=0;for(const i of t[e]??[]){const t=p=Dt(1e3*(i.lu??i.lc??0),s,p),e=i.a??{};"number"==typeof e.current_temperature&&c.push([t,e.current_temperature]),"number"==typeof e.temperature&&h.push([t,e.temperature]);const a="heating"===e.hvac_action;a&&void 0===d&&(d=t),a||void 0===d||(t>d&&l.push([d,t]),d=void 0)}void 0!==d&&o>d&&l.push([d,o]);const u=t=>Dt(1e3*(t.lu??t.lc??0),s),_=[],g=i?t[i]??[]:[];g.forEach((t,e)=>{if("on"!==t.s)return;const i=u(t),s=e+1<g.length?u(g[e+1]):o;s>i&&_.push([i,s])}),this._history={date:s,current:c,target:h,occupied:_,heating:l,end:o}}catch(t){this._history=void 0}}_week(){return this._draft??this._info?.days}_pts(t=this._day){const e=this._week();return e?bt(e[t]):[{m:0,t:20}]}_setPts(t,e=this._day){this._draft&&(this._draft={...this._draft,[e]:xt(t)})}get _limits(){const t=this._info?.limits;return{min:t?.min??5,max:t?.max??35,step:t?.step||.5}}_fmtTemp(t){if(null==t||Number.isNaN(t))return"–";const e=this.hass?.locale?.language??this.hass?.language??"en";return`${t.toLocaleString(e,{maximumFractionDigits:1})}°`}get _band(){if(this.hass&&this._config)return function(t,e){const i=t?.below??e?.below??0,s=t?.above??e?.above??0;return i>0||s>0?{below:i,above:s}:void 0}(this._info?.band,function(t,e,i={}){const s=t.split(".")[1],a=["number","sensor"].flatMap(t=>jt.map(e=>`${t}.${s}${e}`)),n=i[t]?.device_id,o=n?Object.keys(i).filter(t=>i[t].device_id===n&&/^(number|sensor)\./.test(t)&&jt.some(e=>t.endsWith(e))):[];for(const t of[...a,...o]){const i=Number(e[t]?.state);if(e[t]?.state&&Number.isFinite(i)&&i>0)return t.endsWith("_deadzone_temperature")?{below:i,above:0}:{below:i,above:i}}}(this._config.entity,this.hass.states,this.hass.entities))}get _holidayTemp(){const t=this._info?.vacation;return this._info?.enabled&&t?.active?t.temp:void 0}_fmtBand({below:t,above:e}){return t===e?`±${this._fmtTemp(t)}`:e?t?`−${this._fmtTemp(t)} / +${this._fmtTemp(e)}`:`+${this._fmtTemp(e)}`:`−${this._fmtTemp(t)}`}_yRange(t){const e=this._band??{below:0,above:0},i=t.flatMap(t=>[t.t-e.below,t.t+e.above]);void 0!==this._holidayTemp&&i.push(this._holidayTemp);const s=this._history;s&&qt(s.date)===qt(Zt(this._day))&&i.push(...s.current.map(t=>t[1]));const a=this.hass?.states[this._config.entity]?.attributes.current_temperature;"number"==typeof a&&this._day===Pt(new Date)&&i.push(a);let n=Math.floor(Math.min(...i))-1,o=Math.ceil(Math.max(...i))+1;if(o-n<6){const t=(6-(o-n))/2;n=Math.floor(n-t),o=Math.ceil(o+t)}return[n,o]}render(){if(!this._config)return q;const t=this._t,e=this.hass?.states[this._config.entity],i=this._config.name??this._info?.title??e?.attributes.friendly_name??this._config.entity,s=!!this._info&&!this._info.enabled&&!this._draft;if(this._config.readonly)return L`
        <ha-card class="readonly ${s?"disabled":""}">
          ${this._config.name?L`<div class="header"><div class="name">${i}</div></div>`:q}
          ${this._error?L`<div class="error">${this._error}</div>`:q}
          ${this._info?this._renderView():q}
        </ha-card>
      `;const a=this._holidayTemp;return void 0===a||this._expanded||this._draft?L`
      <ha-card class=${s?"disabled":""}>
        <div class="header">
          <div class="name">${i}</div>
          <div class="header-end">
            ${void 0!==a?L`<button
                  class="settings"
                  title=${t.vacation_collapse}
                  aria-label=${t.vacation_collapse}
                  aria-expanded="true"
                  @click=${()=>this._expanded=!1}
                >
                  <ha-icon icon="mdi:chevron-up"></ha-icon>
                </button>`:q}
            ${this._info?L`<label class="toggle" title=${t.schedule}>
                  <ha-switch
                    aria-label=${t.schedule}
                    .checked=${this._info.enabled}
                    .disabled=${!!this._draft}
                    @change=${this._toggleEnabled}
                  ></ha-switch>
                </label>`:q}
            ${this._config.settings&&this._info&&!1!==this.hass?.user?.is_admin?L`<button
                  class="settings"
                  title=${t.panel_settings}
                  aria-label=${t.panel_settings}
                  @click=${this._openSettings}
                >
                  <ha-icon icon="mdi:cog"></ha-icon>
                </button>`:q}
          </div>
        </div>
        ${this._renderStatus(e)}
        ${this._error?L`<div class="error">${this._error}</div>`:q}
        ${this._info?this._renderBody():q}
      </ha-card>
    `:L`<ha-card class="compact">
        <button class="compact-row" aria-expanded="false" @click=${()=>this._expanded=!0}>
          <span class="compact-text">
            <span class="name">${i}</span>
            <span class="compact-status">
              ${this._fmtTemp(e?.attributes.current_temperature)} · ${t.target}
              ${this._fmtTemp(e?.attributes.temperature)} (${t.vacation_short})
            </span>
          </span>
          ${this._renderMini(a)}
          <ha-icon icon="mdi:chevron-down"></ha-icon>
        </button>
      </ha-card>`}_openSettings(){this.dispatchEvent(new CustomEvent("heating-schedule-settings",{detail:{info:this._info},bubbles:!0,composed:!0}))}_renderMode(t,e,i){const s=this._t,a="off"===t.state?"heat":"heat"===t.state?"off":void 0,n=t.attributes.hvac_modes??[];if(!a||!n.includes(a))return L`<ha-icon class="mode ${t.state}" icon=${i} title=${e} aria-label=${e}></ha-icon>`;const o=`${e}: ${"off"===a?s.mode_turn_off:s.mode_turn_on}`;return L`<button
      class="mode ${t.state}"
      title=${o}
      aria-label=${o}
      aria-pressed=${"heat"===t.state?"true":"false"}
      .disabled=${this._modeBusy}
      @click=${()=>this._setMode(a)}
    >
      <ha-icon icon=${i}></ha-icon>
    </button>`}async _setMode(t){if(this.hass&&this._config){this._modeBusy=!0,this._error=void 0;try{await this.hass.callService("climate","set_hvac_mode",{entity_id:this._config.entity,hvac_mode:t})}catch(t){this._error=t?.message??String(t)}finally{this._modeBusy=!1}}}_renderMini(t){const e=bt(this._info.days[Pt(new Date)]),i=[...e.map(t=>t.t),t],s=Math.min(...i)-.5,a=Math.max(...i)+.5,n=t=>32-(t-s)/(a-s)*28;let o=`M0,${n(e[0].t)}`;return e.forEach((t,i)=>{o+=`H${(t=>t/yt*120)(At(e,i))}`,i+1<e.length&&(o+=`V${n(e[i+1].t)}`)}),F`<svg class="mini" width="120" height="36" viewBox="0 0 120 36" aria-hidden="true">
      <path class="schedule paused" d=${o}></path>
      <path class="vacation" d=${`M0,${n(t)}H120`}></path>
    </svg>`}_renderStatus(t){if(!t)return q;const e=this._t,i=t.attributes,s="off"===t.state?e.mode_off:"heat"===t.state?e.mode_heat:t.state,a="off"===t.state?"mdi:fire-off":"heat"===t.state?"mdi:fire":"mdi:thermostat",n=this._info;let o=q;if(n?.enabled&&n.current.next_change&&null!==n.current.next_temp){const t=new Date(n.current.next_change),i=`${qt(t)===qt(new Date)?"":`${e.days[ft.indexOf(Pt(t))]} `}${$t(Ft(t))}`;o=L`<span class="next">${e.next} ${this._fmtTemp(n.current.next_temp)} ${e.at} ${i}</span>`}return L`
      <div class="status">
        <span class="current">${this._fmtTemp(i.current_temperature)}</span>
        <span class="target">${e.target} ${this._fmtTemp(i.temperature)}</span>
        ${this._renderMode(t,s,a)}
        ${o}
      </div>
      ${n?.enabled&&"off"===t.state?L`<div class="hint">${e.off_hint}</div>`:q}
    `}_renderView(){return L`
      <div class="chart ${this._draft?"editing":""} ${this._zoomed?"zoomed":""}">
        ${this._width?this._renderChart():q}${this._renderTooltip()}${this._renderZoomReset()}
      </div>
      ${this._renderLegend()}
    `}_renderBody(){const t=this._t,e=Pt(new Date);return L`
      <div class="days">
        ${ft.map((i,s)=>L`<button
            class="day ${i===this._day?"selected":""} ${i===e?"today":""}"
            @click=${()=>this._selectDay(i)}
          >
            ${t.days[s]}
          </button>`)}
      </div>
      ${this._renderView()}
      ${this._renderSuggestions()}
      ${this._draft?this._renderEditor():this._renderSummary()}
    `}_renderLegend(){const t=this._t,e=this._history,i=!!e&&qt(e.date)===qt(Zt(this._day)),s=i&&this._day!==Pt(new Date),a=i?e.heating.reduce((t,[e,i])=>t+i-e,0):0;return L`
      <div class="legend">
        ${void 0!==this._holidayTemp&&this._day===Pt(new Date)?L`<span><i class="line vacation"></i>${t.legend_vacation}
                <b>${this._fmtTemp(this._holidayTemp)}</b></span>
              <span><i class="line paused"></i>${t.legend_schedule_paused}</span>`:L`<span><i class="line schedule"></i>${t.legend_schedule}</span>`}
        <span><i class="line current"></i>${t.legend_current}</span>
        <span><i class="line target"></i>${t.legend_target}</span>
        ${!this._band||void 0!==this._holidayTemp&&this._day===Pt(new Date)?q:L`<span><i class="swatch band"></i>${t.legend_band}
              <b>${this._fmtBand(this._band)}</b></span>`}
        ${a?L`<span><i class="swatch heating"></i>${t.legend_heating} <b>${zt(a)}</b></span>`:q}
        ${this._presence&&this._info?.occupancy_entity?L`<span><i class="swatch actual"></i>${t.legend_presence}</span>`:q}
        ${this._presence&&this._info?.profile?.weeks?L`<span
              ><i class="swatch typical"></i>${t.legend_typical} (${this._info.profile.weeks}
              ${t.weeks})</span
            >`:q}
        ${s?L`<span class="muted">${t.history_from} ${qt(e.date)}</span>`:q}
      </div>
    `}_renderChart(){const t=this._pts(),e=this._width,i=this._config.height??220,[s,a]=this._range??this._yRange(t),n=Lt+(this._presence?12:0),o=e-Vt-Bt,r=i-Wt-n,[c,h]=this._view,l=h-c,d=t=>Vt+(t-c)/l*o,p=t=>Wt+(a-t)/(a-s)*r;this._scale={x:d,y:p,minute:t=>c+(t-Vt)/o*l,temp:t=>a-(t-Wt)/r*(a-s),lo:s,hi:a,width:o};const u=!!this._draft,_=a-s>12?2:1,g=[];for(let t=Math.ceil(s);t<=a;t+=_)g.push(t);const m=e<420?4:8,f=Rt.find(t=>l/t<=m)??360,y=[];for(let t=Math.ceil(c/f)*f;t<=h;t+=f)y.push(t);let v=`M${d(0)},${p(t[0].t)}`;t.forEach((e,i)=>{v+=`H${d(At(t,i))}`,i+1<t.length&&(v+=`V${p(t[i+1].t)}`)});const $=`${v}V${p(s)}H${d(0)}Z`,b=this._history,x=b&&qt(b.date)===qt(Zt(this._day));let w="",k="";if(x){const t=b.current,e=t=>p(kt(t,s,a));t.length&&(w=t.map(([t,i],s)=>`${s?"L":"M"}${d(t)},${e(i)}`).join(""),w+=`L${d(b.end)},${e(t[t.length-1][1])}`);const i=b.target;if(i.length){k=`M${d(i[0][0])},${p(kt(i[0][1],s,a))}`;for(let t=1;t<i.length;t++)k+=`H${d(i[t][0])}V${p(kt(i[t][1],s,a))}`;k+=`H${d(b.end)}`}}const A=this._day===Pt(new Date),z=Ft(new Date),S=this.hass?.states[this._config.entity]?.attributes.current_temperature,E=this._drag,M=this._band,T=A?this._holidayTemp:void 0;return L`<svg
      width=${e}
      height=${i}
      @pointerdown=${this._onPointerDown}
      @pointermove=${this._onPointerMove}
      @pointerup=${this._onPointerUp}
      @pointercancel=${this._onPointerUp}
      @pointerleave=${this._onPointerLeave}
      @dblclick=${this._onDoubleClick}
      @wheel=${this._onWheel}
    >
      <defs>
        <clipPath id="plot"><rect x=${Vt} y="0" width=${o} height=${i}></rect></clipPath>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" class="fill-top"></stop>
          <stop offset="1" class="fill-bottom"></stop>
        </linearGradient>
      </defs>
      ${g.map(t=>F`<line class="grid" x1=${Vt} x2=${e-Bt} y1=${p(t)} y2=${p(t)}></line>
          <text class="axis" x=${Vt-4} y=${p(t)+3.5} text-anchor="end">${t}°</text>`)}
      <g clip-path="url(#plot)">
      ${x?b.heating.map(([t,e])=>F`<rect class="heating" x=${d(t)} y=${Wt}
              width=${Math.max(1,d(e)-d(t))} height=${r}></rect>`):q}
      ${y.map(t=>F`<line class="grid" x1=${d(t)} x2=${d(t)} y1=${Wt} y2=${Wt+r}></line>
          <text class="axis" x=${d(t)} y=${i-5}
            text-anchor=${t===c?"start":t===h?"end":"middle"}>${t%60?$t(t):t/60}</text>`)}
      ${void 0===T?F`<path class="area" d=${$}></path>`:q}
      ${M&&void 0===T?t.map((e,i)=>{const n=p(Math.min(e.t+M.above,a)),o=p(Math.max(e.t-M.below,s))-n;return F`<rect class="band" x=${d(e.m)} y=${n}
              width=${Math.max(0,d(At(t,i))-d(e.m))} height=${Math.max(0,o)}></rect>`}):q}
      ${this._presence&&x?b.occupied.map(([t,e])=>F`<rect class="presence-strip" x=${d(t)} y=${Wt+r+1}
              width=${Math.max(1,d(e)-d(t))} height="5"></rect>`):q}
      ${this._renderProfile(d,o,Wt+r+7)}
      ${w?F`<path class="current" d=${w}></path>`:q}
      <path class="schedule ${void 0!==T?"paused":""}" d=${v}></path>
      ${void 0!==T?F`<path class="vacation" d=${`M${d(0)},${p(T)}H${d(yt)}`}></path>`:q}
      ${void 0!==this._selected&&u&&t[this._selected]?F`<line class="selected" x1=${d(t[this._selected].m)} x2=${d(At(t,this._selected))}
            y1=${p(t[this._selected].t)} y2=${p(t[this._selected].t)}></line>`:q}
      ${k?F`<path class="target" d=${k}></path>`:q}
      ${t.map((e,i)=>{const s=d(e.m),a=d(At(t,i));return a-s>26?F`<text class="label" x=${(s+a)/2} y=${p(e.t)-5} text-anchor="middle">${this._fmtTemp(e.t)}</text>`:q})}
      ${A?F`<line class="now" x1=${d(z)} x2=${d(z)} y1=${Wt-6} y2=${Wt+r}></line>
          ${"number"==typeof S?F`<circle class="now-dot" cx=${d(z)} cy=${p(kt(S,s,a))} r="4"></circle>`:q}`:q}
      ${u?F`${t.map((e,i)=>F`<rect class="hit seg" data-kind="seg" data-i=${i}
              x=${d(e.m)} y=${p(e.t)-14} width=${Math.max(0,d(At(t,i))-d(e.m))} height="28"></rect>`)}
          ${t.slice(1).map((t,e)=>F`<rect class="hit edge" data-kind="edge" data-i=${e+1}
              x=${d(t.m)-9} y=${Wt} width="18" height=${r}></rect>`)}
          ${this._edgeLabels(t,d).map(t=>F`<text class="edge-label" x=${d(t.m)} y=${Wt-4} text-anchor="middle">${$t(t.m)}</text>`)}`:q}
      ${E?.moved?this._renderDragLabel(t,E):q}
      ${this._renderSuggestionMarkers(t,d,p,r)}
      ${this._renderCrosshair(d,p,r)}
      </g>
    </svg>`}get _zoomed(){return this._view[1]-this._view[0]<yt}_setView(t,e){const i=kt(e,60,yt),s=kt(t,0,yt-i);this._view=[s,s+i]}_resetZoom(){this._view=[0,yt]}_renderZoomReset(){return this._zoomed?L`<button
      class="zoom-reset"
      title=${this._t.zoom_reset}
      aria-label=${this._t.zoom_reset}
      @click=${this._resetZoom}
    >
      <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
    </button>`:q}_onWheel(t){const e=this._scale;if(!e)return;const[i,s]=this._view,a=s-i,n=1===t.deltaMode?33:2===t.deltaMode?400:1,o=Math.abs(t.deltaX)>Math.abs(t.deltaY)?t.deltaX:t.shiftKey?t.deltaY:0;if(o){if(!this._zoomed)return;return t.preventDefault(),void this._setView(i+o*n/e.width*a,a)}const r=kt(a*Math.exp(t.deltaY*n*.0015),60,yt);if(r===a&&!this._zoomed)return;t.preventDefault();const c=kt(e.minute(this._local(t)[0]),0,yt);this._setView(c-(c-i)/a*r,r)}_onPinch(){const t=this._pinch,e=this._scale;if(!t||!e)return;const i=this._touches.get(t.ids[0]),s=this._touches.get(t.ids[1]);if(void 0===i||void 0===s||Math.abs(s-i)<20)return;const a=(t.b-t.a)*e.width/(s-i);if(!(a>0))return;const n=kt(a,60,yt),o=(t.a+t.b)/2,r=(i+s)/2-Vt;this._setView(o-r/e.width*n,n)}_trackTouch(t){if("touch"!==t.pointerType)return!1;if(this._touches.set(t.pointerId,this._local(t)[0]),2===this._touches.size&&!this._pinch&&this._scale){const t=[...this._touches.keys()],[e,i]=t.map(t=>this._scale.minute(this._touches.get(t)));this._pinch={ids:t,a:e,b:i},this._drag=void 0,this._range=void 0,this._hover=void 0}return!!this._pinch}_untrackTouch(t){this._touches.delete(t.pointerId),this._pinch?.ids.includes(t.pointerId)&&(this._pinch=void 0),this._pan?.pointerId===t.pointerId&&(this._pan=void 0)}_edgeLabels(t,e){const i=t.slice(1),s=this._selected,a=new Set(void 0===s?[]:[s,s+1]),n=i.map((t,e)=>({p:t,k:e+1})).sort((t,e)=>Number(a.has(e.k))-Number(a.has(t.k))),o=[];for(const{p:t}of n)o.every(i=>Math.abs(e(i.m)-e(t.m))>=34)&&o.push(t);return o}_renderProfile(t,e,i){const s=this._presence?this._info?.profile:void 0;if(!s?.weeks)return q;const a=s.days[this._day]??[],n=(t(yt)-t(0))/a.length;return a.map((e,s)=>e>.02?F`<rect class="profile" x=${t(15*s)} y=${i} width=${n+.5}
            height="5" fill-opacity=${.45+.55*Math.min(1,e)}></rect>`:q)}_hoverValues(t){const e=this._history,i=!!e&&qt(e.date)===qt(Zt(this._day))&&t<=e.end,s=e=>{let i;for(const[s,a]of e){if(s>t)break;i=a}return i};return{schedule:St(this._pts(),t),current:i?s(e.current):void 0,target:i?s(e.target):void 0}}_renderCrosshair(t,e,i){const s=this._hover;if(void 0===s||this._draft||!this._scale)return q;const{lo:a,hi:n}=this._scale,o=this._hoverValues(s),r=t=>e(kt(t,a,n));return F`<g class="crosshair">
      <line x1=${t(s)} x2=${t(s)} y1=${Wt} y2=${Wt+i}></line>
      <circle class="dot schedule" cx=${t(s)} cy=${r(o.schedule)} r="3.5"></circle>
      ${void 0!==o.target?F`<circle class="dot target" cx=${t(s)} cy=${r(o.target)} r="3.5"></circle>`:q}
      ${void 0!==o.current?F`<circle class="dot current" cx=${t(s)} cy=${r(o.current)} r="3.5"></circle>`:q}
    </g>`}_renderTooltip(){const t=this._hover;if(void 0===t||this._draft||!this._scale)return q;const e=this._t,i=this._hoverValues(t),s=this._scale.x(t),a=s>this._width-160?`right:${this._width-s+12}px`:`left:${s+12}px`;return L`<div class="tooltip" style=${a}>
      <b>${$t(t)}</b>
      <div><span><i class="line schedule"></i>${e.legend_schedule}</span><span>${this._fmtTemp(i.schedule)}</span></div>
      ${void 0!==i.current?L`<div><span><i class="line current"></i>${e.legend_current}</span><span>${this._fmtTemp(i.current)}</span></div>`:q}
      ${void 0!==i.target?L`<div><span><i class="line target"></i>${e.legend_target}</span><span>${this._fmtTemp(i.target)}</span></div>`:q}
    </div>`}_renderDragLabel(t,e){const i=this._scale,s=t[e.index];if(!s)return q;const a="seg"===e.kind?this._fmtTemp(s.t):`${$t(s.m)}`,n="seg"===e.kind?(i.x(s.m)+i.x(At(t,e.index)))/2:i.x(s.m),o=i.y(s.t)-22;return F`<g class="drag-label">
      <rect x=${n-24} y=${o-12} width="48" height="18" rx="4"></rect>
      <text x=${n} y=${o+1} text-anchor="middle">${a}</text>
    </g>`}get _suggestions(){return!this._config?.settings||this._draft?[]:this._info?.suggestions??[]}get _aiFull(){if(this._config?.settings&&!this._draft)return this._info?.ai_full??void 0}_renderAiIcon(t="ai-icon"){return void 0===this._aiIcon&&this.hass&&(this._aiIcon=null,function(t){(!Nt||Date.now()-Ut>12e5)&&(Ut=Date.now(),Nt=t.callWS({type:"brands/access_token"}).then(t=>t.token).catch(()=>null));const e=t.themes?.darkMode;return Nt.then(t=>t?`/api/brands/integration/ai_task/${e?"dark_":""}icon.png?token=${t}`:null)}(this.hass).then(t=>this._aiIcon=t)),this._aiIcon?L`<img class=${t} src=${this._aiIcon} alt="AI" @error=${()=>this._aiIcon=null} />`:L`<ha-icon class=${t} icon="mdi:creation"></ha-icon>`}async _askAi(){if(this.hass&&this._config){this._aiBusy=!0,this._aiNote=void 0;try{const t=await this.hass.callWS({type:"heating_schedule/suggestion/ask_ai",entity_id:this._config.entity});this._info=t.info,t.count||(this._aiNote=this._t.ai_none),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._aiBusy=!1}}}_renderSuggestionMarkers(t,e,i,s){const a=this._scale;if(!a)return q;const n=t=>i(kt(t,a.lo,a.hi)),o=this._aiFull?.week[this._day],r=o?bt(o):void 0,c=r?.map((t,i)=>i?`H${e(t.m)}V${n(t.t)}`:`M${e(t.m)},${n(t.t)}`).join("").concat(`H${e(yt)}`);return[c?F`<path class="suggestion-full" d=${c}></path>`:q,...this._suggestions.map((i,a)=>{if(!i.days.includes(this._day))return q;const o=function(t){return"shift"===t.kind?{m:t.params.to??t.start,t:t.temp}:{m:t.start,t:t.temp}}(i),r=St(t,i.start),c=Math.min(n(i.temp),n(r));return F`<g class="suggestion">
        <rect class="suggestion-diff" x=${e(i.start)} y=${c}
          width=${Math.max(1,e(i.end)-e(i.start))} height=${Math.abs(n(i.temp)-n(r))}></rect>
        <line x1=${e(o.m)} x2=${e(o.m)} y1=${n(o.t)-4} y2=${Wt+s}></line>
        <circle cx=${e(o.m)} cy=${n(o.t)-13} r="9"></circle>
        <text x=${e(o.m)} y=${n(o.t)-9} text-anchor="middle">${a+1}</text>
      </g>`})]}_renderSuggestions(){const t=this._suggestions,e=this._aiFull,i=this._t;if(!t.length&&!e)return this._aiNote?L`<div class="suggestions"><div class="muted">${this._aiNote}</div></div>`:q;const s=t=>this._fmtTemp(t),a=t=>L`<span class="buttons">
      <button ?disabled=${!!this._suggestBusy} @click=${()=>this._suggestion("dismiss",t)}>
        ${i.suggest_dismiss}
      </button>
      <button class="primary" ?disabled=${!!this._suggestBusy} @click=${()=>this._suggestion("apply",t)}>
        ${i.suggest_apply}
      </button>
    </span>`;return L`<div class="suggestions">
      ${e?L`<div class="suggestion-row">
            ${this._renderAiIcon()}
            <span class="text">${i.ai_full}</span>
            ${a(e.id)}
          </div>`:q}
      ${t.map((t,e)=>L`<div class="suggestion-row">
          <span class="num">${e+1}</span>
          ${"ai"===t.source?this._renderAiIcon("ai-icon small"):q}
          <span class="text">${It(t,this._info?.days,i,s)}</span>
          ${a(t.id)}
        </div>`)}
    </div>`}async _suggestion(t,e){if(this.hass&&this._config){this._suggestBusy=e;try{const i=await this.hass.callWS({type:`heating_schedule/suggestion/${t}`,entity_id:this._config.entity,suggestion_id:e});i&&(this._info=i),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._suggestBusy=void 0}}}_renderSummary(){const t=this._pts();return L`
      <div class="points">
        ${t.map((e,i)=>L`<span class="chip">${$t(e.m)}–${$t(At(t,i))}
            <b>${this._fmtTemp(e.t)}</b></span>`)}
      </div>
      <div class="actions">
        <span class="spacer"></span>
        ${this._config?.settings&&this._info?.ai_available?L`<button
              class="ai"
              title=${this._t.ai_ask}
              aria-label=${this._t.ai_ask}
              ?disabled=${this._aiBusy}
              @click=${this._askAi}
            >
              ${this._renderAiIcon()} ${this._aiBusy?this._t.ai_busy:q}
            </button>`:q}
        <button class="primary" @click=${this._startEdit}>${this._t.edit}</button>
      </div>
    `}_renderEditor(){const t=this._t,e=this._pts(),i=void 0!==this._selected?e[this._selected]:void 0,{step:s}=this._limits,a=!this._info||!function(t,e){return JSON.stringify(ft.map(e=>t[e]))===JSON.stringify(ft.map(t=>e[t]))}(this._draft,this._info.days);return L`
      ${i?L`<div class="segment">
            ${this._selected>0?L`<button class="icon" @click=${()=>this._shiftStart(-15)}>‹</button>`:q}
            <span class="range">${$t(i.m)}–${$t(At(e,this._selected))}</span>
            ${this._selected>0?L`<button class="icon" @click=${()=>this._shiftStart(15)}>›</button>`:q}
            <span class="spacer"></span>
            <button class="icon" @click=${()=>this._bump(-s)}>−</button>
            <span class="temp">${this._fmtTemp(i.t)}</span>
            <button class="icon" @click=${()=>this._bump(s)}>+</button>
            <span class="spacer"></span>
            <button @click=${this._split}>${t.split}</button>
            <button @click=${this._remove} .disabled=${e.length<=1}>${t.remove}</button>
          </div>`:L`<div class="hint">${t.edit_hint}</div>`}
      ${this._copyOpen?this._renderCopy():q}
      <div class="actions">
        <button @click=${()=>this._copyOpen=!this._copyOpen}>${t.copy}</button>
        <span class="spacer"></span>
        <button @click=${this._cancel}>${t.cancel}</button>
        <button class="primary" @click=${this._save} .disabled=${!a||this._saving}>${t.save}</button>
      </div>
    `}_renderCopy(){const t=this._t,e=t=>{this._copyTargets=this._copyTargets.includes(t)?this._copyTargets.filter(e=>e!==t):[...this._copyTargets,t]},i=t=>{this._copyTargets=t.filter(t=>t!==this._day)};return L`<div class="copy">
      ${ft.map((i,s)=>L`<button
          class="day ${this._copyTargets.includes(i)?"selected":""}"
          .disabled=${i===this._day}
          @click=${()=>e(i)}
        >
          ${t.days[s]}
        </button>`)}
      <span class="presets">
        <button @click=${()=>i(ft.slice(0,5))}>${t.workdays}</button>
        <button @click=${()=>i(ft.slice(5))}>${t.weekend}</button>
        <button @click=${()=>i(ft)}>${t.all}</button>
        <button class="primary" .disabled=${!this._copyTargets.length} @click=${this._applyCopy}>
          ${t.copy_apply}
        </button>
      </span>
    </div>`}_selectDay(t){this._day=t,this._selected=void 0,this._copyTargets=[]}_startEdit(){var t;this._info&&(this._draft=(t=this._info.days,Object.fromEntries(ft.map(e=>[e,t[e].map(t=>({...t}))]))),this._selected=void 0)}_cancel(){this._draft=void 0,this._selected=void 0,this._copyOpen=!1,this._copyTargets=[]}async _save(){if(this._draft&&this.hass){this._saving=!0;try{this._info=await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,days:this._draft}),this._cancel(),this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._saving=!1}}}async _toggleEnabled(t){const e=t.target.checked;try{await this.hass.callWS({type:"heating_schedule/save",entity_id:this._config.entity,enabled:e})}catch(t){this._error=t?.message??String(t)}}_bump(t){if(void 0===this._selected)return;const{min:e,max:i,step:s}=this._limits,a=this._pts(),n=kt(wt(a[this._selected].t+t,s),e,i);this._setPts(Et(a,this._selected,n))}_shiftStart(t){const e=this._selected;if(void 0===e||0===e)return;const i=this._pts(),s=Mt(i,e,i[e].m+t),a=Tt(s);a.length!==s.length&&(this._selected=void 0),this._setPts(a)}_split(){if(void 0===this._selected)return;const t=Ct(this._pts(),this._selected);t&&(this._setPts(t),this._selected+=1)}_remove(){void 0!==this._selected&&(this._setPts(function(t,e){if(t.length<=1)return t;const i=t.filter((t,i)=>i!==e);return i[0]={...i[0],m:0},i}(this._pts(),this._selected)),this._selected=void 0)}_applyCopy(){if(!this._draft)return;const t=this._draft[this._day],e={...this._draft};for(const i of this._copyTargets)e[i]=t.map(t=>({...t}));this._draft=e,this._copyOpen=!1,this._copyTargets=[]}_local(t){const e=t.currentTarget.getBoundingClientRect();return[t.clientX-e.left,t.clientY-e.top]}_onPointerDown(t){if(this._trackTouch(t))return;if(!this._draft)return"mouse"===t.pointerType&&0===t.button&&this._zoomed&&(t.currentTarget.setPointerCapture(t.pointerId),this._pan={pointerId:t.pointerId,x0:t.clientX,start:this._view[0]}),void this._onHover(t);const e=t.target,i=e.getAttribute("data-kind");if(!i)return void(this._selected=void 0);t.preventDefault(),t.currentTarget.setPointerCapture(t.pointerId);const s=Number(e.getAttribute("data-i"));this._range=this._yRange(this._pts()),this._drag={kind:i,index:s,pointerId:t.pointerId,x0:t.clientX,y0:t.clientY,moved:!1},"seg"===i&&(this._selected=s)}_onPointerLeave(t){window.clearTimeout(this._hoverTimer),"mouse"===t.pointerType?this._hover=void 0:this._hoverTimer=window.setTimeout(()=>this._hover=void 0,3e3)}_onHover(t){if(this._draft||!this._scale)return;window.clearTimeout(this._hoverTimer);const e=5*Math.round(this._scale.minute(this._local(t)[0])/5),[i,s]=this._view;this._hover=e<i||e>s?void 0:Math.min(e,1439)}_onPointerMove(t){if(this._touches.has(t.pointerId)&&this._touches.set(t.pointerId,this._local(t)[0]),this._pinch)return t.preventDefault(),void this._onPinch();const e=this._pan;if(e&&t.pointerId===e.pointerId&&this._scale){const i=this._view[1]-this._view[0];return this._setView(e.start-(t.clientX-e.x0)/this._scale.width*i,i),void(this._hover=void 0)}if(!this._draft)return void this._onHover(t);const i=this._drag;if(!i||t.pointerId!==i.pointerId||!this._scale)return;if(!i.moved&&Math.hypot(t.clientX-i.x0,t.clientY-i.y0)<4)return;i.moved=!0;const[s,a]=this._local(t),n=this._pts();if("seg"===i.kind){const{min:t,max:e,step:s}=this._limits,o=kt(wt(this._scale.temp(a),s),Math.max(t,this._scale.lo),Math.min(e,this._scale.hi));o!==n[i.index].t&&this._setPts(Et(n,i.index,o))}else{const t=wt(this._scale.minute(s),15);t!==n[i.index].m&&this._setPts(Mt(n,i.index,t))}this.requestUpdate()}_onPointerUp(t){this._untrackTouch(t);const e=this._drag;if(e&&t.pointerId===e.pointerId){if("edge"===e.kind&&e.moved){const t=this._pts(),e=Tt(t);e.length!==t.length&&(this._selected=void 0),this._setPts(e)}this._drag=void 0,this._range=void 0}}_onDoubleClick(t){if(!this._draft)return void this._resetZoom();if(!this._scale)return;const e=t.target;if("seg"!==e.getAttribute("data-kind"))return;const i=Number(e.getAttribute("data-i")),[s]=this._local(t),a=Ct(this._pts(),i,this._scale.minute(s));a&&(this._setPts(a),this._selected=i+1)}}Yt.styles=o`
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
    ha-card.compact {
      padding: 0;
    }
    button.compact-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: 0;
      border-radius: inherit;
      text-align: start;
      font-size: 1em;
      color: inherit;
    }
    .compact-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .compact-status {
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    svg.mini {
      flex-shrink: 0;
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
    .schedule.paused {
      stroke: var(--secondary-text-color);
      stroke-width: 1.5;
      stroke-dasharray: 4 4;
    }
    .vacation {
      fill: none;
      stroke: var(--hs-schedule);
      stroke-width: 2.5;
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
    .line.paused {
      border-top: 1.5px dashed var(--secondary-text-color);
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
  `,t([ut({attribute:!1})],Yt.prototype,"hass",void 0),t([_t()],Yt.prototype,"_config",void 0),t([_t()],Yt.prototype,"_info",void 0),t([_t()],Yt.prototype,"_error",void 0),t([_t()],Yt.prototype,"_modeBusy",void 0),t([_t()],Yt.prototype,"_expanded",void 0),t([_t()],Yt.prototype,"_day",void 0),t([_t()],Yt.prototype,"_draft",void 0),t([_t()],Yt.prototype,"_selected",void 0),t([_t()],Yt.prototype,"_drag",void 0),t([_t()],Yt.prototype,"_history",void 0),t([_t()],Yt.prototype,"_width",void 0),t([_t()],Yt.prototype,"_copyOpen",void 0),t([_t()],Yt.prototype,"_copyTargets",void 0),t([_t()],Yt.prototype,"_saving",void 0),t([_t()],Yt.prototype,"_hover",void 0),t([_t()],Yt.prototype,"_suggestBusy",void 0),t([_t()],Yt.prototype,"_aiBusy",void 0),t([_t()],Yt.prototype,"_aiNote",void 0),t([_t()],Yt.prototype,"_aiIcon",void 0),t([_t()],Yt.prototype,"_view",void 0),customElements.get("heating-schedule-card")||customElements.define("heating-schedule-card",Yt);class Kt extends Yt{static getConfigForm(){return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"climate"}}},{name:"name",selector:{text:{}}},{name:"height",selector:{number:{min:120,max:600,mode:"box",unit_of_measurement:"px"}}}],computeLabel:t=>"height"===t.name?"Height":void 0}}static getStubConfig(t){return{entity:Object.keys(t.states).find(t=>t.startsWith("climate."))??""}}setConfig(t){super.setConfig({...t,settings:!1,readonly:!0})}getCardSize(){return 4}getGridOptions(){return{columns:12,min_columns:4,rows:"auto"}}}customElements.get("heating-schedule-chart-card")||customElements.define("heating-schedule-chart-card",Kt),window.customCards=window.customCards??[],window.customCards.some(t=>"heating-schedule-chart-card"===t.type)||window.customCards.push({type:"heating-schedule-chart-card",name:"Heating Schedule chart",description:"Today's heating schedule of a thermostat as a temperature chart (read-only).",preview:!0});const Xt=["binary_sensor","person","device_tracker","input_boolean","switch","light"];function Jt(t){return"number"==typeof t&&Number.isFinite(t)?t:null}async function Gt(){if(!customElements.get("ha-form")){try{const t=await(window.loadCardHelpers?.()),e=await(t?.createCardElement({type:"entities",entities:[]}));await(e?.constructor?.getConfigElement?.())}catch{}await Promise.race([customElements.whenDefined("ha-form"),new Promise(t=>setTimeout(t,3e3))])}}class Qt extends ht{constructor(){super(...arguments),this.narrow=!1,this._busy=!1,this._cards=new Map,this._loading=!1,this._onSettings=async t=>{const e=t.detail.info;await Gt(),this._dialogError=void 0,this._dialog={kind:"settings",info:e,data:{title:e.title,presence_entities:e.presence.entities,band_below:e.band?.below??void 0,band_above:e.band?.above??void 0}}},this._label=t=>this._t[`field_${t.name}`]??t.name,this._helper=t=>t.name.startsWith("band_")?this._t.band_help:void 0}get _t(){return mt(this.hass?.locale?.language??this.hass?.language)}get _admin(){return!1!==this.hass?.user?.is_admin}connectedCallback(){super.connectedCallback(),this._entries&&this._load(),this.addEventListener("heating-schedule-settings",this._onSettings),this._subscribeVacation()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("heating-schedule-settings",this._onSettings),this._unsubVacation?.then(t=>t()).catch(()=>{}),this._unsubVacation=void 0}willUpdate(t){t.has("hass")&&this.hass&&!this._entries&&this._load(),t.has("hass")&&this._subscribeVacation()}_subscribeVacation(){if(!this.hass||!this.isConnected||this._unsubVacation)return;const t=this.hass.connection.subscribeMessage(t=>this._vacation=t,{type:"heating_schedule/vacation/subscribe"});this._unsubVacation=t,t.catch(()=>{this._unsubVacation===t&&(this._unsubVacation=void 0)})}async _setVacation(t){if(this.hass){this._vacationError=void 0;try{this._vacation=await this.hass.callWS({type:"heating_schedule/vacation/set",...t})}catch(t){this._vacationError=t?.message??String(t)}}}_stepVacation(t){const e=(this._vacation?.temp??18)+t;e>=5&&e<=30&&this._setVacation({temp:e})}_renderVacation(){const t=this._vacation;if(!t)return q;const e=this._t,i=this.hass?.locale?.language??this.hass?.language??"en",s=`${t.temp.toLocaleString(i,{maximumFractionDigits:1})}°`,a=t.until?new Date(t.until):void 0,n=a?function(t){const e=Math.max(0,Math.round(t)),i=Math.floor(e/yt);return i?`${i} d ${Math.floor(e%yt/60)} h`:zt(e)}((a.getTime()-Date.now())/6e4):void 0;return L`<section class="vacation ${t.active?"on":""}">
      <div class="vacation-head">
        <ha-icon icon="mdi:bag-suitcase"></ha-icon>
        <h2>${e.vacation_title}</h2>
        <label class="vacation-switch">
          <span>${e.vacation_on}</span>
          <ha-switch
            .checked=${t.active}
            @change=${t=>this._setVacation({active:t.target.checked})}
          ></ha-switch>
        </label>
      </div>
      <div class="vacation-fields">
        <div class="vacation-field">
          <span class="label">${e.vacation_temp}</span>
          <div class="stepper">
            <button aria-label=${e.vacation_lower} @click=${()=>this._stepVacation(-.5)}>−</button>
            <span class="value">${s}</span>
            <button aria-label=${e.vacation_higher} @click=${()=>this._stepVacation(.5)}>+</button>
          </div>
        </div>
        <div class="vacation-field">
          <label class="label" for="vacation-until">${e.vacation_until}</label>
          <div class="until">
            <input
              id="vacation-until"
              type="datetime-local"
              .value=${a?function(t){const e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}T${e(t.getHours())}:${e(t.getMinutes())}`}(a):""}
              @change=${t=>{const e=t.target.value;this._setVacation({until:e?new Date(e).toISOString():null})}}
            />
            ${a?L`<button
                  class="clear"
                  title=${e.vacation_until_clear}
                  aria-label=${e.vacation_until_clear}
                  @click=${()=>this._setVacation({until:null})}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`:q}
          </div>
        </div>
      </div>
      <p class="help">
        ${t.active?L`${e.vacation_active.replace("{temp}",s)}
            ${n?e.vacation_left.replace("{left}",n):e.vacation_until_none}`:e.vacation_hint}
      </p>
      ${this._vacationError?L`<div class="error">${this._vacationError}</div>`:q}
    </section>`}updated(){for(const t of this._cards.values())t.hass=this.hass}async _load(){if(this.hass&&!this._loading){this._loading=!0;try{const t=await this.hass.callWS({type:"heating_schedule/list"});this._entries=t.sort((t,e)=>t.title.localeCompare(e.title));const e=new Set(t.map(t=>t.climate_entity));for(const t of[...this._cards.keys()])e.has(t)||this._cards.delete(t);this._error=void 0}catch(t){this._error=t?.message??String(t)}finally{this._loading=!1}}}_groups(t){const e=this.hass,i=t=>{const i=e?.entities?.[t.climate_entity],s=i?.area_id??(i?.device_id?e?.devices?.[i.device_id]?.area_id:void 0);return s?e?.areas?.[s]:void 0},s=new Map;for(const a of t){const t=i(a),n=t?.floor_id?e?.floors?.[t.floor_id]:void 0,o=n?.floor_id??"";let r=s.get(o);r||(r={key:o,name:n?.name,entries:[],level:n?n.level??0:Number.POSITIVE_INFINITY,sort:new Map},s.set(o,r)),r.entries.push(a),r.sort.set(a,t?.name??"")}const a=[...s.values()].sort((t,e)=>t.level-e.level||(t.name??"").localeCompare(e.name??"")),n=t=>(e,i)=>{const s=t.get(e),a=t.get(i);return Number(!s)-Number(!a)||s.localeCompare(a)||e.title.localeCompare(i.title)};for(const t of a)t.entries.sort(n(t.sort));return a}_renderCards(t){const e=this._groups(t);return 1!==e.length||e[0].name?e.map(t=>L`<section>
        <h2 class="floor">${t.name??this._t.panel_no_floor}</h2>
        <div class="cards">${t.entries.map(t=>this._card(t))}</div>
      </section>`):L`<div class="cards">${t.map(t=>this._card(t))}</div>`}_card(t){let e=this._cards.get(t.climate_entity);return e||(e=document.createElement("heating-schedule-card"),this._cards.set(t.climate_entity,e)),e.setConfig(this._cardConfig(t.climate_entity)),e.hass=this.hass,e}_cardConfig(t){return{type:"custom:heating-schedule-card",entity:t,settings:!0}}async _openAdd(){await Gt(),this._dialogError=void 0,this._dialog={kind:"add",data:{init:"empty"}}}_close(){this._busy||(this._dialog=void 0)}get _aiAvailable(){return Object.keys(this.hass?.states??{}).some(t=>t.startsWith("ai_task."))}_schema(t){if("add"===t.kind){const t=this._t;return[{name:"entity",required:!0,selector:{entity:{filter:[{domain:"climate"}],exclude_entities:(this._entries??[]).map(t=>t.climate_entity)}}},...this._aiAvailable?[{name:"init",selector:{select:{mode:"list",options:[{value:"empty",label:t.init_empty},{value:"ai",label:t.init_ai}]}}}]:[]]}return[{name:"title",required:!0,selector:{text:{}}},{name:"presence_entities",selector:{entity:{multiple:!0,filter:[{domain:Xt}]}}},...["band_below","band_above"].map(t=>({name:t,selector:{number:{min:0,max:10,step:.1,mode:"box",unit_of_measurement:"°"}}}))]}async _run(t){this._busy=!0,this._dialogError=void 0;try{await t(),this._busy=!1,this._dialog=void 0,await this._load()}catch(t){this._busy=!1,this._dialogError=t?.message??String(t)}}_submit(){const t=this._dialog;if(!t||!this.hass)return;const e=this.hass;if("add"===t.kind){const i=t.data.entity;if(!i)return;const s=this._aiAvailable&&"ai"===t.data.init?"ai":"empty";return void this._run(()=>e.callWS({type:"heating_schedule/add",entity_id:i,init:s}))}const i=t.data,s=String(i.title??"").trim();s&&this._run(()=>e.callWS({type:"heating_schedule/configure",entity_id:t.info.climate_entity,title:s,presence_entities:i.presence_entities??[],band_below:Jt(i.band_below),band_above:Jt(i.band_above)}))}_removeSchedule(){const t=this._dialog;if("settings"!==t?.kind||!this.hass)return;const e=this.hass;confirm(this._t.remove_confirm.replace("{name}",t.info.title))&&this._run(()=>e.callWS({type:"heating_schedule/remove",entity_id:t.info.climate_entity}))}render(){const t=this._t,e=this._entries;return L`
      <div class="toolbar">
        <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
        <div class="title">${t.panel_title}</div>
        ${this._admin?L`<button class="tool" title=${t.panel_add} aria-label=${t.panel_add} @click=${this._openAdd}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>`:q}
      </div>
      <div class="content">
        ${this._error?L`<div class="error">${this._error}</div>`:q}
        ${e&&!e.length?L`<p class="empty">${t.panel_empty}</p>`:q}
        ${e?.length?this._renderVacation():q}
        ${this._renderCards(e??[])}
      </div>
      ${this._renderDialog()}
    `}_renderDialog(){const t=this._dialog;if(!t)return q;const e=this._t,i="add"===t.kind?e.panel_add:t.info.title;return L`
      <div class="backdrop" @click=${this._close}></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label=${i}
        @keydown=${t=>"Escape"===t.key&&this._close()}
      >
        <h2>${i}</h2>
        ${"settings"===t.kind?this._renderClimate(t.info.climate_entity):q}
        ${"settings"===t.kind?L`<p class="help">${e.presence_help}</p>`:q}
        <ha-form
          .hass=${this.hass}
          .data=${t.data}
          .schema=${this._schema(t)}
          .computeLabel=${this._label}
          .computeHelper=${this._helper}
          .disabled=${this._busy}
          @value-changed=${e=>{this._dialog={...t,data:e.detail.value}}}
        ></ha-form>
        ${this._dialogError?L`<div class="error">${this._dialogError}</div>`:q}
        <div class="buttons">
          ${"settings"===t.kind?L`<button class="danger" .disabled=${this._busy} @click=${this._removeSchedule}>
                ${e.remove_schedule}
              </button>`:q}
          <span class="spacer"></span>
          <button .disabled=${this._busy} @click=${this._close}>${e.cancel}</button>
          <button class="primary" .disabled=${this._busy} @click=${this._submit}>
            ${"add"===t.kind?e.add_apply:e.save}
          </button>
        </div>
      </div>
    `}_renderClimate(t){const e=this.hass?.states[t]?.attributes.friendly_name;return L`<div class="climate">
      <span class="label">${this._t.field_entity}</span>
      <span>${e?L`${e} <code>${t}</code>`:L`<code>${t}</code>`}</span>
    </div>`}}Qt.styles=o`
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
    .vacation {
      max-width: 560px;
      margin: 0 0 16px;
      padding: 16px;
      border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      box-sizing: border-box;
    }
    .vacation.on {
      border-color: var(--primary-color, #03a9f4);
    }
    .vacation-head {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--primary-text-color);
    }
    .vacation-head ha-icon {
      color: var(--primary-color, #03a9f4);
    }
    .vacation-head h2 {
      flex: 1;
      margin: 0;
      font-size: 1.15em;
    }
    .vacation-switch {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .vacation-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin: 14px 0 10px;
    }
    .vacation-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
      min-width: 0;
    }
    .vacation-field .label {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .stepper button {
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 50%;
      font-size: 1.2em;
    }
    .stepper .value {
      font-size: 1.4em;
    }
    .until {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .until input {
      flex: 1;
      min-width: 0;
      height: 36px;
      font: inherit;
      color: var(--primary-text-color);
      background: none;
      border: 0;
      color-scheme: light dark;
    }
    button.clear {
      display: inline-flex;
      padding: 6px;
      background: none;
      --mdc-icon-size: 18px;
    }
    .vacation .help {
      margin: 0;
    }
    @media (max-width: 420px) {
      .vacation-fields {
        grid-template-columns: minmax(0, 1fr);
      }
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
  `,t([ut({attribute:!1})],Qt.prototype,"hass",void 0),t([ut({type:Boolean})],Qt.prototype,"narrow",void 0),t([_t()],Qt.prototype,"_entries",void 0),t([_t()],Qt.prototype,"_error",void 0),t([_t()],Qt.prototype,"_dialog",void 0),t([_t()],Qt.prototype,"_dialogError",void 0),t([_t()],Qt.prototype,"_busy",void 0),t([_t()],Qt.prototype,"_vacation",void 0),t([_t()],Qt.prototype,"_vacationError",void 0),customElements.get("heating-schedule-panel")||customElements.define("heating-schedule-panel",Qt);
