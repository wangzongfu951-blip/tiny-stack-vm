// tiny-stack-vm: a compact interpreter for make.fun's tiny stack ISA v1.
// Written from ISA.md; verified against the reference VM on the practice set.
import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
function R(p,g){
 const S=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256);
 let o='',sp=0,cp=0,pc=0,ip=0,n=0;
 const D=c=>[Buffer.from(o,'latin1'),c];
 for(;;){
  if(n>=1e6)return D(10);
  if(pc<0||pc>=p.length)return D(9);
  const k=p[pc];
  let a=0,b=0,v=0;
  switch(k){
   case 0:return D(0);
   case 1:
    if(pc+1>=p.length)return D(9);
    if(sp>=256)return D(3);
    S[sp++]=(p[pc+1]<<24)>>24;pc+=2;break;
   case 2:
    if(pc+4>=p.length)return D(9);
    if(sp>=256)return D(3);
    S[sp++]=p[pc+1]|p[pc+2]<<8|p[pc+3]<<16|p[pc+4]<<24;pc+=5;break;
   case 3:if(sp<1)return D(2);sp--;pc++;break;
   case 4:
    if(sp<1)return D(2);
    if(sp>=256)return D(3);
    S[sp]=S[sp-1];sp++;pc++;break;
   case 5:
    if(sp<2)return D(2);
    v=S[sp-1];S[sp-1]=S[sp-2];S[sp-2]=v;pc++;break;
   case 6:
    if(sp<2)return D(2);
    if(sp>=256)return D(3);
    S[sp]=S[sp-2];sp++;pc++;break;
   case 7:
    if(sp<3)return D(2);
    a=S[sp-3];S[sp-3]=S[sp-2];S[sp-2]=S[sp-1];S[sp-1]=a;pc++;break;
   case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:
    if(sp<2)return D(2);
    b=S[--sp];a=S[sp-1];
    switch(k){
     case 16:v=(a+b)|0;break;
     case 17:v=(a-b)|0;break;
     case 18:v=Math.imul(a,b);break;
     case 19:if(b===0)return D(4);v=(a/b)|0;break;
     case 20:if(b===0)return D(4);v=b===-1?0:(a%b)|0;break;
     case 21:if(b===0)return D(4);v=((a>>>0)/(b>>>0))|0;break;
     case 22:if(b===0)return D(4);v=((a>>>0)%(b>>>0))|0;break;
     case 24:v=a&b;break;
     case 25:v=a|b;break;
     case 26:v=a^b;break;
     case 28:v=a<<b;break;
     case 29:v=a>>b;break;
     case 30:v=(a>>>b)|0;break;
     case 32:v=a===b?1:0;break;
     case 33:v=a<b?1:0;break;
     default:v=(a>>>0)<(b>>>0)?1:0;
    }
    S[sp-1]=v;pc++;break;
   case 23:
    if(sp<1)return D(2);
    S[sp-1]=(-S[sp-1])|0;pc++;break;
   case 27:
    if(sp<1)return D(2);
    S[sp-1]=~S[sp-1];pc++;break;
   case 48:case 49:case 50:{
    if(pc+2>=p.length)return D(9);
    const f=((p[pc+1]|p[pc+2]<<8)<<16)>>16;
    if(k===48){pc=pc+3+f;break}
    if(sp<1)return D(2);
    v=S[--sp];
    pc=(k===49&&v===0)||(k===50&&v!==0)?pc+3+f:pc+3;
    break}
   case 51:
    if(pc+2>=p.length)return D(9);
    if(cp>=64)return D(7);
    C[cp++]=pc+3;pc=p[pc+1]|p[pc+2]<<8;break;
   case 52:
    if(cp===0)return D(8);
    pc=C[--cp];break;
   case 64:
    if(sp<1)return D(2);
    a=S[sp-1];
    if(a<0||a>255)return D(6);
    S[sp-1]=M[a];pc++;break;
   case 65:
    if(sp<2)return D(2);
    a=S[--sp];v=S[--sp];
    if(a<0||a>255)return D(6);
    M[a]=v;pc++;break;
   case 80:{
    if(sp<1)return D(2);
    const s=String(S[--sp]);
    if(o.length+s.length>65536)return D(11);
    o+=s;pc++;break}
   case 81:
    if(sp<1)return D(2);
    if(o.length+1>65536)return D(11);
    o+=String.fromCharCode(S[--sp]&255);pc++;break;
   case 82:
    if(sp>=256)return D(3);
    S[sp++]=ip<g.length?g[ip++]:-1;pc++;break;
   case 83:
    if(sp<1)return D(2);
    return D(S[--sp]&255);
   default:return D(5);
  }
  n++;
 }
}
for(const d of readdirSync(I).sort()){
 let p;
 try{p=readFileSync(join(I,d,'program.bin'))}catch{continue}
 let g;
 try{g=readFileSync(join(I,d,'input.bin'))}catch{g=Buffer.alloc(0)}
 const[o,c]=R(new Uint8Array(p),new Uint8Array(g));
 mkdirSync(join(O,d),{recursive:true});
 writeFileSync(join(O,d,'stdout.bin'),o);
 writeFileSync(join(O,d,'exit.txt'),''+c);
}
