import{j as e,H as l,L as c}from"./app-B2bvPJix.js";import{c as t,g as d}from"./theme-DVlLlqo0.js";import{A as h}from"./arrow-left-ClfGAwrf.js";/* empty css            *//**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],o=t("circle-alert",m);/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M12 17h.01",key:"p32p05"}],["path",{d:"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3",key:"mhlwft"}]],u=t("file-question-mark",x);/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],g=t("house",f);/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["path",{d:"M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2",key:"4b9dqc"}],["path",{d:"M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2",key:"22nnkd"}],["path",{d:"M6 6h.01",key:"1utrut"}],["path",{d:"M6 18h.01",key:"uhywen"}],["path",{d:"m13 6-4 6h6l-4 6",key:"14hqih"}]],b=t("server-crash",k);/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]],y=t("shield-alert",p);function _({status:n,message:s,app_settings:r}){const a=(()=>{switch(n){case 404:return{title:"Halaman Tidak Ditemukan",description:"Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.",icon:u,color:"text-blue-500",bg:"bg-blue-100/50"};case 403:return{title:"Akses Ditolak",description:s||"Maaf, Anda tidak memiliki izin untuk mengakses halaman atau fitur ini.",icon:y,color:"text-amber-500",bg:"bg-amber-100/50"};case 500:return{title:"Kesalahan Sistem",description:"Ups, terjadi kesalahan pada server kami. Silakan coba lagi nanti.",icon:b,color:"text-red-500",bg:"bg-red-100/50"};case 503:return{title:"Layanan Tidak Tersedia",description:"Sistem sedang dalam perbaikan. Silakan periksa kembali beberapa saat lagi.",icon:o,color:"text-orange-500",bg:"bg-orange-100/50"};default:return{title:"Terjadi Kesalahan",description:s||"Maaf, terjadi kesalahan yang tidak terduga.",icon:o,color:"text-stone-500",bg:"bg-stone-100/50"}}})(),i=a.icon;return e.jsxs(e.Fragment,{children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:`:root {
${d((r==null?void 0:r.theme_color)||"green")}
}`}}),e.jsx(l,{title:`${n} - ${a.title}`}),e.jsx("div",{className:"min-h-screen bg-stone-50 flex items-center justify-center p-4 selection:bg-green-200",children:e.jsxs("div",{className:"max-w-md w-full text-center space-y-8",children:[e.jsxs("div",{className:"relative",children:[e.jsx("h1",{className:`text-9xl font-black tracking-tighter opacity-10 ${a.color}`,children:n}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsx("div",{className:`p-6 rounded-3xl ${a.bg} border-4 border-white shadow-xl rotate-12 transition-transform hover:rotate-0 duration-500`,children:e.jsx(i,{className:`w-16 h-16 ${a.color}`,strokeWidth:2.5})})})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h2",{className:"text-3xl font-bold text-stone-800 tracking-tight",children:a.title}),e.jsx("p",{className:"text-stone-500 leading-relaxed max-w-sm mx-auto",children:a.description})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-3 pt-6",children:[e.jsxs("button",{onClick:()=>window.history.back(),className:"flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-200 focus:ring-offset-2",children:[e.jsx(h,{className:"w-4 h-4"}),"Kembali"]}),e.jsxs(c,{href:"/",className:"flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",children:[e.jsx(g,{className:"w-4 h-4"}),"Ke Beranda"]})]})]})})]})}export{_ as default};
