import{_ as i,f as o,g as a,j as n,N as u,r as d,o as _,z as p,P as f,t as m}from"./index.a22779ab.js";const g={},h={class:"min-h-screen flex flex-col items-center bg-gray-100"},v={class:"w-full max-w-sm mt-6 px-6 py-4 border border-gray-300 bg-white overflow-hidden"};function x(e,s){return o(),a("div",h,[n("div",v,[u(e.$slots,"default")])])}var V=i(g,[["render",x]]);const b=["value"],B={__name:"TextInput",props:["modelValue"],emits:["update:modelValue"],setup(e,{expose:s}){const t=d(null);return _(()=>{t.value.hasAttribute("autofocus")&&t.value.focus()}),s({focus:()=>t.value.focus()}),(l,r)=>(o(),a("input",{class:"border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm",value:e.modelValue,onInput:r[0]||(r[0]=c=>l.$emit("update:modelValue",c.target.value)),ref_key:"input",ref:t},null,40,b))}},y={class:"text-sm text-red-600"},S={__name:"InputError",props:["message"],setup(e){return(s,t)=>p((o(),a("div",null,[n("p",y,m(e.message),1)],512)),[[f,e.message]])}},w=["type"],k={__name:"PrimaryButton",props:{type:{type:String,default:"submit"}},setup(e){return(s,t)=>(o(),a("button",{type:e.type,class:"bg-[#0095F6] hover:bg-[#2150fa] w-full rounded-lg p-1.5 text-white text-lg font-extrabold"},[u(s.$slots,"default")],8,w))}};export{V as G,B as _,S as a,k as b};