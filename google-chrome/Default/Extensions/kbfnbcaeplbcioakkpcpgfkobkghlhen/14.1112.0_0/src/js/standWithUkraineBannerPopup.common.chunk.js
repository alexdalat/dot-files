(self.webpackChunk=self.webpackChunk||[]).push([[9910],{64757:(e,t,n)=>{n.d(t,{L_:()=>d,RZ:()=>y,zx:()=>u});var a=n(59312),o=n(27378),i=n(5739),l=n(12187),r=n(31278),s=n(86732),p=n(1509),c=n(26215),m=n(94632);function u(e){return o.createElement(c.Y,(0,a.__assign)({},d(e,m.LI)))}function d(e,t){var n=(0,l.Sh)(e.className,t).className;return(0,a.__assign)((0,a.__assign)({},e),{className:n})}!function(e){e.Animated=function(e){return o.createElement(c.Y,(0,a.__assign)({},(0,a.__assign)((0,a.__assign)({},e),{animationMode:Boolean(e.animationMode)?e.animationMode:s.m.FromClickPoint})))},e.Primary=function(t){return o.createElement(e.Animated,(0,a.__assign)({styleType:p.Z.Type.Button},d(t,m.T$)))},e.Secondary=function(t){return o.createElement(e.Animated,(0,a.__assign)({styleType:p.Z.Type.Button},d(t,m.BD)))},e.Ghost=function(t){return o.createElement(e.Animated,(0,a.__assign)({styleType:p.Z.Type.Button},d(t,m.fk)))},e.Tertiary=function(t){return o.createElement(e.Animated,(0,a.__assign)({styleType:p.Z.Type.Base},d(t,m.UF)))},e.Flat=function(t){return o.createElement(e.Animated,(0,a.__assign)({},d(t,m.$H)))},e.White=function(t){return o.createElement(e.Animated,(0,a.__assign)({},d(t,m.ix)))},e.SidebarFlat=function(e){return o.createElement(c.Y,(0,a.__assign)({styleType:p.Z.Type.H3Legacy},d(e,m.HN)))},e.Caps=function(e){return o.createElement(c.Y,(0,a.__assign)({styleType:p.Z.Type.H3Legacy},d(e,m.Mp)))},e.Group=function(e){var t=e.children,n=e.className,r=e.align,s=void 0===r?"horizontal":r,p=e.sticky,c=e.name;return o.createElement(i.F.div,(0,a.__assign)({role:"group"},(0,l.Sh)(n,"horizontal"===s?!0===p?m.vD:m.ru:m.oc),{"data-name":c}),t)}}(u||(u={}));var y=function(e){var t=e.title,n=e.titleAlign,s=e.buttonClass,p=e.iconClass,d=e.iconWidth,y=e.tooltipClass;return o.createElement(u,{name:"info-button","aria-label":t,tag:c.X.div,title:o.createElement(i.F.div,(0,a.__assign)({},(0,l.Sh)(m.bC,y)),o.createElement("p",null,t)),titleAlign:n,className:s},o.createElement(r.JO.Info,{width:d,className:p}))}},48954:(e,t,n)=>{n.r(t),n.d(t,{StandWithUkraineBannerPopup:()=>p});var a=n(31699),o=n(27378),i=n(24606),l=n(64757),r=n(36412),s=n(51310);const p=e=>{const t=e.popupHelpButtonLabelHTML?(0,a.sanitize)(e.popupHelpButtonLabelHTML):"How to help",n=e.popupIconResetButtonLabelHTML?(0,a.sanitize)(e.popupIconResetButtonLabelHTML):"Use default colors",p=e.popupTitleHTML?(0,a.sanitize)(e.popupTitleHTML):"Why did my Grammarly icon change to blue and yellow?",c=e.popupBodyHTML?e.popupBodyHTML.map(a.sanitize):["As a company with a deep connection to Ukraine, we've updated our icon to reflect the colors in the Ukrainian flag to show our support for the people of Ukraine. We invite you to do the same."];return o.createElement(r.Zz,{onClose:e.onClose,sanitizedPopupTitle:p,sanitizedPopupBody:c,popupFooter:o.createElement(o.Fragment,null,o.createElement(i.z,{kind:"primary",className:s.helpButton,onClick:e.onHelpUkraine},o.createElement("span",{dangerouslySetInnerHTML:{__html:t}})),o.createElement(l.zx.Tertiary,{name:"reset-grammarly-icon",className:s.iconResetButton,onClick:e.onIconReset},o.createElement("span",{dangerouslySetInnerHTML:{__html:n}})))})}},36412:(e,t,n)=>{n.d(t,{Zz:()=>s,h4:()=>l,uT:()=>r});var a=n(27378),o=n(67166),i=n(53834);const l=({sanitizedTitle:e})=>a.createElement("div",{className:i.header},a.createElement("div",{className:i.flag},a.createElement("div",{className:i.flagTop}),a.createElement("div",{className:i.flagBottom})),a.createElement("div",{className:i.title,dangerouslySetInnerHTML:{__html:e}})),r=({sanitizedBody:e})=>a.createElement(a.Fragment,null,e.map((e=>a.createElement("p",{key:e,className:i.paragraph,dangerouslySetInnerHTML:{__html:e}})))),s=e=>a.createElement(o.X,{style:{width:280},onClose:e.onClose,includeMainContentPadding:!1,mainContent:a.createElement("div",{className:i.content,"data-has-footer":e.popupFooter?"true":"false"},a.createElement(l,{sanitizedTitle:e.sanitizedPopupTitle}),a.createElement(r,{sanitizedBody:e.sanitizedPopupBody}),e.popupFooter?e.popupFooter:null)})},51310:e=>{e.exports={helpButton:"D75kt",iconResetButton:"r4S4i"}},53834:e=>{e.exports={content:"L0IlD",paragraph:"Orx96",header:"XpiGS",flag:"hYeJR",flagTop:"Te_me",flagBottom:"pHlXZ",title:"ruQOD"}}}]);