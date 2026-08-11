/*
Notation : EcOCF 
Limit : ~QSS
*/

window.notation = (() => {
   const EcOCF = (() => {

      // get position of last symbol '[' of string st
      function getls(st) {
         let e = st.length;
         let np = 0;
         while ((e > -1) && (np != 0 || st[e] != '[')) {
            e--;
            if (st[e] == '[') np--;
            else if (st[e] == '!') np++;
         }
         return e;
      }

      // get position of first symbol '!' of string st
      function getfs(st) {
         let e = -1;
         let np = 0;
         while ((e < st.length) && (np != 0 || st[e] != '!')) {
            e++;
            if (st[e] == '[') np--;
            else if (st[e] == '!') np++;
         }
         return e;
      }

      // create base]booster[ string
      function bb(base, booster) {
         return base + '[' + booster + '!';
      }

      // get base of string st
      function base(st) {
         return st.slice(0, getls(st));
      }

      // get booster of string st
      function booster(st) {
         return st.slice(getls(st) + 1, -1);
      }

      function antibb(antibooster, antibase) {
         return '[' + antibooster + '!' + antibase;
      }

      function antibase(st) {
         return st.slice(getfs(st) + 1);
      }

      function antibooster(st) {
         return st.slice(1, getfs(st));
      }

      // get predecessor of successor ordinal st = X + 1
      function pred(st) {
         return st.slice(0, -2);
      }

      // compare expressions st1, st2 (if st1<st2 then -1; if st1==st2 then 0; if st1>st2 then 1)
      //function compare(st1,st2,b=false){
      function compare(st1, st2) {
         return st1.localeCompare(st2);
      }

      function cmp(st1, st2) {
         return st1.localeCompare(st2);
      }

      function ocd(st) {
         let n = 0;
         for (let s of st) {
            if (s == '[') { n++ }
            else if (s == '!') { n-- }
         }
         return n;
      }

      function getpos(st) {
         let n = 0;
         let pcar = [];
         let l = st.length;
         let l2 = 2 * l;
         st = st + st;
         let e = 0;
         while (e < l2) {
            if (pcar.length) {
               if (st[e] == '[') {
                  n++;
                  if (n == 2) {
                     pcar.push(e);
                     n = 1;
                  }
               }
               else if (st[e] == '!') {
                  n--;
                  if (n <= 0) {
                     pcar.pop();
                     n++;
                  }
               }
            }
            else {
               if (st[e] == '[') {
                  pcar.push(e);
                  n = 1;
               }
            }
            e++;
         }
         e = 0;
         while (pcar.length > 2 && pcar.at(-2) >= l)
            pcar.pop();
         let m = pcar.at(-1) - l;
         while (pcar[e] < m)
            e++;
         m = pcar.length - 1;
         if (e + 1 == m)
            return pcar[e];

         let psar = [];
         for (let i = e; i < m; i++)
            psar.push(st.slice(pcar[i], pcar[i + 1]));
         let b = true;
         for (let i = e + 1; i < m; i++)
            if (psar[i] != psar[e])
               b = false;
         if (b)
            return pcar[e];
         /*for(let i=e+1;i<m;i++)
            {
            let i1=i;
            let e1=e;
            while(psar[i1]==psar[e1])
               {
               i1--;
               e1--;
               if(i1<e)
                  i1=pcar.length-1;
               if(e1<e)
                  e1=pcar.length-1;
               }
            if(psar[i1]>psar[e1])
               {
               e=i;
               }
            }
         return pcar[e+1]%l;*/

         e = 0;

         let maxp = st.slice(pcar[e], pcar[e] + l);
         for (let i = e + 1; i < m; i++) {
            /*let sm=maxp;
            while(sm&&sm[0]=='[')
               sm=sm.slice(1);
            let ss=st.slice(pcar[i],pcar[i]+l);
            while(ss&&ss[0]=='[')
               ss=ss.slice(1);*/

            //if(ss>sm)
            //if(st.slice(pcar[i],pcar[i]+l)>maxp||ss.slice(0,6)>sm.slice(0,6))
            //if((i-e==1?ss:st.slice(pcar[i],pcar[i]+l))>(i-e==1?sm:maxp))
            //if(ss>sm&&ss!=sm+'['&&ss!=sm+'[[')
            if (st.slice(pcar[i], pcar[i] + l) > maxp)
            //if(st.slice(pcar[i],pcar[i]+l)>maxp&&maxp.slice(0,pcar[i]-pcar[e]).includes(col))
            //if(st.slice(pcar[i],pcar[i]+l).split("").reverse().join("")<maxp.split("").reverse().join(""))
            {
               maxp = st.slice(pcar[i], pcar[i] + l);
               e = i;
            }
         }
         //if(e&&pcar[e]-pcar[e-1]==1&&pcar[0]<2&&pcar.length>3)
         //   e--;
         if (m == 2)
            e++;
         else
            //if(st.includes(col))
            //while(e&&st.slice(pcar[e]%l+l-2,pcar[e]%l+l)=='[[')
            //while(e&&(st.slice(pcar[e]%l+l-2,pcar[e]%l+l)=='[['||(e==pcar.length-2&&st.slice(pcar[e]%l+l-1,pcar[e]%l+l)=='[')))
            if (maxp > '[c') {
               if (e && pcar[e] - pcar[e - 1] == 1)
                  e--;
               //while(e>1&&pcar[e]-pcar[e-1]==1)                              // July 2024 version
               while (e > 1 && pcar[e] - pcar[e - 1] == 1 && pcar[e - 1] - pcar[e - 2] == 1)    // December 2024 version
                  e--;
            }

         return pcar[e] % l;
      }

      function overperiod(st) {
         if (st[0] != col)
            return st;
         let i = 0;
         for (let e = 1; e < st.length; e++)
            if (st.slice(0, e) == st.slice(-e))
               i = e;
         return i ? st.slice(0, -i) : st;
      }

      function overperiod_new(st) {
         let b = true;
         while (b) {
            if (st[0] != col)
               return st;
            let i = 0;
            for (let e = 1; e < st.length; e++)
               if (st.slice(0, e) == st.slice(-e))
                  i = e;
            if (i)
               st = st.slice(0, -i);
            else
               b = false;
         }
         return st;
      }

      function overperiod2(st) {
         let a = [];
         for (let i = 0; i < st.length; i++)
            if (st[i] == col)
               a.push(i);
         let l = a.length;
         if (l < 2)
            return st;
         for (let i = 0; i < l; i++)
            a.push(a[i] + st.length);
         let st2 = st + st;
         let aa = Array(l);
         for (let e = 0; e < l; e++)
            aa[e] = Array(l);
         //aa.fill(Array(l));
         aa.forEach(function (i) { i.fill(false); });
         for (let e = 0; e < l - 1; e++)
            for (let i = e + 1; i < l; i++)
               if (st2.slice(a[e], a[i]) == st2.slice(a[i], a[2 * i - e]))
                  aa[e][i] = true;
         let i = l - 1;
         let e = 0;
         while (i) {
            let u = e + i;
            if (u < l && aa[e][u])
               return st.slice(0, e) + st.slice(u);
            e++;
            if (e >= l) {
               i--;
               e = 0;
            }
         }
         return st;
      }

      function overprimer(st, st0) {
         if (st[0] != col)
            return st0;
         let i = 0;
         for (let e = 1; e < st.length; e++)
            if (st.slice(0, e) == st0.slice(-e))
               i = e;
         return i ? st0.slice(0, -i) : st0;
      }

      function overprimer_new(st, st0) {
         let b = true;
         while (b) {
            if (st[0] != col)
               return st0;
            let i = 0;
            for (let e = 1; e < st.length; e++)
               if (st.slice(0, e) == st0.slice(-e))
                  i = e;
            if (i)
               st0 = st0.slice(0, -i);
            else
               b = false;
         }
         return st0;
      }

      function setfsarrays() {
         fsnumber = 1;
         fsopeningarray = [fsopening];
         fsperiodarray = [fsperiod0];
         fsendingarray = [fsending];
         let i = fsending.length;
         let u = fsperiod1.length;
         let j = fsperiod0.length;
         let y = fsopening.length;
         let q = j - 1;
         while (fsperiod0[q] == '!')
            q--;
         let b = true;
         for (let e = 1; e <= q; e++) {
            let a = fsperiod0[e - 1];
            if (a == '[')
               i++;
            else if (a == '!')
               i--;
            if (fsperiod0[e] != '!') {
               fsopeningarray.push(fsopening + fsperiod0.slice(0, e));
               if (!b)
                  fsopeningarray[fsnumber] = fsopeningarray[fsnumber].slice(0, -j);
               fsperiodarray.push(fsperiod0.slice(e) + fsperiod0.slice(0, e));
               if (b && y + e >= j && fsopeningarray[fsnumber].slice(-j) == fsperiodarray[fsnumber]) {
                  fsopeningarray[fsnumber] = fsopeningarray[fsnumber].slice(0, -j);
                  i -= u;
                  b = false;
               }
               fsendingarray.push('!'.repeat(i));
               if (fsperiod0[e] == col) {
                  fsopeningarray.push(fsopeningarray[fsnumber]);
                  fsperiodarray.push(fsperiodarray[fsnumber]);
                  fsendingarray.push('[!' + fsendingarray[fsnumber]);
                  fsnumber++;
               }
               fsnumber++;
            }
         }
      }

      // left non-empty base
      function leftbase(st) {
         let beta = base(st);
         return beta ? leftbase(beta) : st;
      }

      // if st is not epsilon: -1
      // epsilon: 0
      // Omega: 1
      // L: 2
      // R: 3
      // ...
      function getepslevel(st) {
         if (st == bo)
            return 0;
         if (!st)
            return -1;
         if (st == col)
            return nlevels;
         let x = booster(st);
         if (st > x)
            return -1;
         return getepslevel(leftbase(x)) - 1;
      }

      function flooreps(st, n = 0) {
         if (!st || getepslevel(st) >= n)
            return st;
         return flooreps(base(st), n);
      }

      // n = 0: least epsilon above st
      // n = 1: least Omega above st
      // n = 2: least L above L st
      //...
      function nexteps(st, n = 0) {
         if (st >= col || n > nlevels)
            return 'd';
         if (n == nlevels)
            return col;
         return bb(flooreps(st, n), nexteps(st, n + 1));
      }

      function nextzeta(st, n = 0) {
         if (st >= col || n >= nlevels)
            return 'd';
         let e = nexteps(st, n + 1)
         e = bb(e, e);
         while (st && booster(st) < e)
            st = base(st);
         return bb(st, e);
      }

      function card(st) {
         if (st == col)
            if (nlevels) {
               cardclass = 2;
               return col;
            }
            else {
               cardclass = 1;
               return '[[!!';
            }
         if (st == bo) {
            if (uncountablemode) {
               cardclass = 2;
               return st;
            }
            else {
               cardclass = 1;
               return '[[!!';
            }
         }
         if (st < '[[!!') {
            cardclass = 0;
            return st;
         }
         if (st < leastuncountable) {
            cardclass = 1;
            return '[[!!';
         }

         cardclass = 2;
         while (st.length > 1 && st > booster(st))
            st = base(st);
         return st;
      }

      // card, but if < Ω, returns empty string
      function ecard(st) {
         let c = card(st);
         if (c < leastuncountable)
            return '';
         return st;
      }

      /*function getnin(st){
      if(st.length<2||st==bo)
         return 0;
      let x=booster(st);
      return Math.max(getnin(base(st)),(x>st?1:0)+getnin(x));
      }*/

      /*function infcompare(st1,st2)
      {
      if(st1.length>st2.length)
         while(st1.length>st2.length)
            st2+=st2;
      else if(st1.length<st2.length)
         while(st1.length<st2.length)
            st1+=st1;
      return st1>=st2;
      }*/

      function infcompare(pr1, per1, pr2, per2) {
         if (pr1 == pr2 && per1 == per2)
            return true;
         let st1 = pr1 + per1;
         let st2 = pr2 + per2;
         let m = Math.max(st1.length, st2.length) * 2;
         let l = Math.min(st1.length, st2.length);
         while (st1.slice(0, l) == st2.slice(0, l)) {
            if (l > m)
               return true;
            let c = Math.sign(st1.length - st2.length);
            if (c >= 0)
               st2 += per2;
            if (c <= 0)
               st1 += per1;
            l = Math.min(st1.length, st2.length);
         }
         return st1 >= st2;
      }

      // check are booster non-increasing (partial case of standardness)
      function checkboosters(st) {
         if (st.length < 2)
            return true;
         let a = base(st);
         if (a.length < 2)
            return checkboosters(booster(st));
         let b = booster(st);
         if (b > booster(a))
            return false;
         return checkboosters(a) && checkboosters(b);
      }

      // get primer and period from st
      // primer ends and period starts at the same point
      function getprper(st) {
         let pr = '';
         let per = st;
         let s = st + col;
         let p = '!'.repeat(ocd(st));
         for (let e = st.length; e > 0; e--)
            for (let i = 0; i <= st.length - e; i++) {
               let pr1 = st.slice(0, i);
               let per1 = st.slice(i, i + e);
               let n = ocd(per1);
               if (n > 0 && infcompare(s, p, pr1, per1) && checkboosters(pr1 + per1 + '!'.repeat(ocd(pr1) + n)) && infcompare(pr1, per1, pr, per))
                  [pr, per] = [pr1, per1];
            }
         return [pr, per];
      }

      // get primer and period from st
      function getprper_old2(st) {
         let pr = '';
         let per = st;
         let s = st + col;
         let p = '!'.repeat(ocd(st));
         for (let e = st.length; e > 0; e--)
            for (let i = 0; i <= st.length - e; i++)
               for (let y = 0; y <= st.length; y++) {
                  let pr1 = st.slice(0, y);
                  let per1 = st.slice(i, i + e);
                  let n = ocd(per1);
                  if (n > 0 && infcompare(s, p, pr1, per1) && checkboosters(pr1 + per1 + '!'.repeat(ocd(pr1) + n)) && infcompare(pr1, per1, pr, per))
                     [pr, per] = [pr1, per1];
               }
         return [pr, per];
      }

      function getprper1(st) {
         let pr = '';
         let per = st;
         let s = st + col;
         let p = '!'.repeat(ocd(st));
         let l = st.length;
         st += st;
         for (let e = l; e > 0; e--)
            for (let i = 0; i < l; i++) {
               let pr1 = st.slice(0, i);
               let per1 = st.slice(i, i + e);
               let n = ocd(per1);
               if (per1[0] != col || per1.at(-1) == '[')
                  if (n > 0 && infcompare(s, p, pr1, per1) && checkboosters(pr1 + per1 + '!'.repeat(ocd(pr1) + n)) && infcompare(pr1, per1, pr, per))
                     [pr, per] = [pr1, per1];
            }
         return [pr, per];
      }

      // get n-th element of fs of ordinal st
      function fs_old(st, n, nn = 0) {

         //let nin=getnin(st);
         //if(nin>4)
         //   alert(st+'\n'+convert(st)+'\nnin = '+nin);

         // optimization
         if (st == fscurrent)
            //return fsopening+(fsperiod0.repeat(nn))+(fsperiod1.repeat(nn)+fsending);
            return fsopeningarray[subperiodpositionshift] + (fsperiodarray[subperiodpositionshift].repeat(nn)) + (fsperiod1.repeat(nn) + fsendingarray[subperiodpositionshift]);

         if (fscurrent)
            subperiodpositionshift = 0;

         fscurrent = st;
         cblen = 0;
         cbc = 0;
         cpn = 0;

         // limit rule
         if (st == bo) {
            cofcurrent = st;
            cofclass = 3;

            if (uncountablemode) {
               //uncountable
               fsopening = col;
               fsperiod0 = '[' + col;
               fsperiod1 = '!';
               fsending = '';
               setfsarrays();
               return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
            }
            else {
               //countable
               fsopening = nlevels ? '['.repeat(nlevels - 1) : col;
               fsperiod0 = '[' + col;
               fsperiod1 = '!';
               fsending = nlevels ? '!'.repeat(nlevels - 1) : '';
               setfsarrays();
               return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
            }
         }

         let i = st.length - 1;
         while (st[i] == '!')
            i--;
         let e = st[i] == '[';
         let st0 = st.slice(0, i);
         let st1 = st.slice(i + (e ? 2 : 1));
         let s1;

         // successor and plain rule
         if (e) {
            st0 += '!';
            cofcurrent = st1 ? '[[!!' : '[!';
            cofclass = st1 ? st == cofcurrent ? 3 : 0 : 2;
            let st2 = st1;
            //s1=bb('',booster(st0));
            s1 = st1 ? bb('', booster(st0)) : '';
            st1 = st1.slice(1);
            fsopening = base(st0);
            fsperiod0 = s1;
            fsperiod1 = '';
            fsending = st1;

            setfsarrays();
            return fsopening + fsperiod0.repeat(nn) + fsending;
         }

         // main rule
         let stt = st0;
         let u = i - 1;

         while (st0[u] == '[')
            u--;
         u = i - u - 1;

         st0 += '[';

         st1 = st1.slice(u);
         let s;

         u++;
         let uo = '['.repeat(u);

         let cb = [st];
         //let nc=[1,1];
         while (cb.at(-1).length > 1) {
            cb.push(booster(cb.at(-1)));
         }

         let nod = 0;
         let mb = col;
         for (i = cb.length - 1; i >= 0; i--)
            if (cb[i] < mb) {
               nod++;
               mb = cb[i];
            }

         let noi = 0;
         mb = st;
         for (i = 0; i < cb.length; i++)
            if (cb[i] > mb) {
               noi++;
               mb = cb[i];
            }

         if (nod > 4 || noi > 4)
            alert(st + '\n' + convert(st) + '\nnod = ' + nod + '\nnoi = ' + noi);

         let pn = cb.length - 1;
         //let lrn=pn;
         let nl = nlevels;
         let lr = 'c';
         let lar = [pn];
         //let r;           // more powerful system
         while (nl) {
            if (cb[pn] < lr) {
               //lrn=pn;
               lr = cb[pn];
               lar.push(pn);
               nl--;

               // more powerful system
               /*let q=base(lr);
               if(lar.length>2&&q!=r)
                  {
                  nl=0;
                  r=q;
                  
                  let w=booster(lr);                      // new
                  while(booster(q)==w)
                     q=base(q);
                     
                  while(q.length>1&&booster(q)==col)
                     {
                     q=base(q);
                     nl++;
                     }
                  }*/

            }
            else {
               pn--;

               // cof > ω
               if (pn < 0) {
                  fsopening = st0.slice(0, -1);
                  fsperiod0 = '[' + col;
                  while (fsopening.slice(-2) == fsperiod0)
                     fsopening = fsopening.slice(0, -2);
                  fsperiod1 = '!';
                  fsending = '!'.repeat(ocd(fsopening));
                  cofcurrent = lr;
                  cofclass = st == cofcurrent ? 3 : 0;
                  setfsarrays();
                  return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
               }

            }
         }
         for (i = 0; i < cb.length; i++) {
            cb[i] = cb[i].slice(0, -cb.length + i);
         }


         cblen = 1;
         cbc = 1;
         cpn = pn;
         for (i = pn + 1; i < cb.length; i++) {
            if (cb[i] != cb[i - 1])
               cblen++;
            //if(i==np)
            //   cbc=cblen;
         }



         let np = 0;
         let pr;
         let per;
         [pr, per] = getprper(cb[pn]);

         if (st == '[c[[c[c!!!![[c[c!!!')       // Φ(1, 0)[I]
         {
            pr = '[c[[c[c!!!![[c[';            // (original primer [c[ + original period [c[c!!!![[c[)
            per = '[c[c!!!![[c[';              // Ω_{Φ(1, 0) + 1} (original period)
            per = '[c[c!!!![c[[c[';            // Φ(1, 1)
            per = '[c[c!!![[c[';               // Φ(2, 0)
            per = '[c[c!![[c[';                // Φ(1, 0, 0)
            per = '[c[c![[c[';                 // [c + I_...]
            per = '[c[c[[c[';                  // [c + I(..., 0)]
         }

         st0 = st0.slice(0, cb[0].length - cb[pn].length) + pr + per;
         cb[np] = per;





         let shpos = per.indexOf(col);
         //if(pr=='['&&per=='[c[[')
         if (shpos > 0) {
            let shp = per.slice(0, shpos);
            st0 += shp;
            cb[np] = per.slice(shpos) + shp;
         }



         let rr = cb[np].length - getpos(cb[np]);
         while (rr < 0)
            rr += cb[np].length;
         fsopening = st0.slice(0, -rr);
         rr %= cb[np].length;
         fsperiod0 = cb[np].slice(-rr) + cb[np].slice(0, -rr);

         /*if(st=='[c[[c[c!!!![[c[c!!!')
            //fsperiod0.replace('!!!!', '!!!![c');
            fsperiod0=fsperiod0+'[c';*/

         while (fsopening.slice(-fsperiod0.length) == fsperiod0)
            fsopening = fsopening.slice(0, -fsperiod0.length);

         fsperiod1 = '!'.repeat(ocd(fsperiod0));
         fsending = '!'.repeat(ocd(fsopening));

         cofcurrent = '[[!!';
         cofclass = 0;
         setfsarrays();

         //if(overb[np])
         //   alert(st+'\n'+convert(st)+'\nprimer = '+fsopening+'\nperiod = '+fsperiod0);

         return fsopening + fsperiod0.repeat(nn) + fsperiod1.repeat(nn) + fsending;
      }





      // sum st1 + st2
      function getsum(st1, st2) {
         if (!st1)
            return st2;
         if (!st2)
            return st1;
         let s = '';
         let t = '';
         while (st2 && !isepsilon(st2)) {
            t = booster(st2);
            s = bb('', t) + s;
            st2 = base(st2);
         }
         //if(st2)
         if (st2 >= t)
            s = bb('', st2) + s;
         let x = antibooster(s);
         while (st1.length > 1 && booster(st1) < x)
            st1 = base(st1);
         return st1 + s;
      }





      // get b such as a + b = st, b is greatest ordinal less than d
      function getterms(st, d) {
         if (st < d)
            // return ['',st];      // get [a, b]
            return st;
         if (st == d)
            // return [st,''];      // get [a, b]
            return '';
         let s = '';
         let x = booster(st);
         let w;
         if (isepsilon(x))
            w = x;
         else {
            w = base(x);
            while (w && !isepsilon(w))
               w = base(w);
            w = bb(w, x);
         }
         //let w=isepsilon(x)?x:bb('',x);
         //let w=isepsilon(x)?x:bb(base(x),x);
         let t = '';
         while (st.length > 1 && (w + s < d)) {
            st = base(st);
            t = w + s;
            s = bb('', x) + s;
            //t=w;
            if (st.length > 1) {
               x = booster(st);
               if (isepsilon(x))
                  w = x;
               else {
                  w = base(x);
                  while (w && !isepsilon(w))
                     w = base(w);
                  w = bb(w, x);
               }
               //w=isepsilon(x)?x:bb('',x);
               //w=isepsilon(x)?x:bb(base(x),x);
            }
         }
         //return [st,t];      // get [a, b]
         return t;
      }





      // get largest booster substring s < d such as st = ...s]]]...]
      function getbs(st, d) {
         if (st < d)
            return st;
         if (st == d)
            return '';
         let x = booster(st);
         while (x >= d) {
            if (x == d)
               return '';
            st = x;
            x = booster(st);
         }
         return getterms(st, d);
      }





      // get next string with r
      function getnextb(st, r) {
         if (st < r)
            return r;
         let l = '';
         let x = booster(st);
         let e = 0;
         while (x > r) {
            l += base(st) + '[';
            e++;
            st = x;
            x = booster(st);
         }
         return l + getsum(st, r) + ('!'.repeat(e));
      }

      // modify string st using modified previous regular m and original regular r
      function modstring_old(st, m, r) {
         if (!r)
            return st;
         let s = '';
         let xm = booster(m);
         let xmopening = '[';
         let xmending = '!';
         while (xm != r) {
            xmopening += base(xm) + '[';
            xmending += '!'
            xm = booster(xm);
         }
         xmopening = xmopening.slice(0, -1);
         xmending = xmending.slice(0, -1);
         let x = booster(st);
         while (st && x < xm) {
            s = bb('', xmopening ? xmopening + extractls(x, r) + xmending : x) + s;
            st = base(st);
            x = booster(st);
         }
         return base(m) + s;
      }





      // set st "modulo" r
      function stringmodulo(st, r) {
         if (st < r)
            return '';
         if (st == r)
            return st;
         let s = '';
         let e = 0;
         let x = booster(st);
         while (x > r) {
            s += base(st) + '[';
            e++;
            st = x;
            x = booster(st);
         }
         while (st.length > 1 && x < r) {
            st = base(st);
            x = booster(st);
         }
         return s + st + ('!'.repeat(e));
      }





      // modify string st using cb, lar
      function modstring(cb, lar) {

         function getmstring(st, e) {
            if (!e)
               return st;
            let s = '';
            let x = booster(st);
            let r = cb[lar[e - 1]];
            //let p=cb[lar[e]+1];
            //let p=getnextb(x,r);
            //let p=antibooster(cb[lar[e]]);
            //let p=getbs(antibooster(cb[lar[e]]),r);
            //let p=stringmodulo(antibooster(cb[lar[e]]),r);
            let p = cb[lar[e]];
            while (booster(p) < x)
               p = base(p);
            p = booster(p);
            let px = '';
            let cx;
            while (st.length > 1 && x < p)
            //while(st.length>1)
            {
               st = base(st);
               cx = leftw[e] + getsum(centralw[e], getmstring(getbs(x, r), e - 1)) + rightw[e];
               if (cx >= px) {
                  s = bb('', cx) + s;
                  px = cx;
               }
               x = booster(st);
            }
            return baseofr[e] + s;
         }

         let leftw = Array(lar.length);
         let rightw = Array(lar.length);
         let centralw = Array(lar.length);
         let baseofr = Array(lar.length);
         for (let e = 1; e < lar.length; e++) {
            baseofr[e] = base(cb[lar[e]]);
            let i = lar[e - 1] - lar[e] - 2;
            if (i < 0) {
               leftw[e] = '';
               rightw[e] = '';
               centralw[e] = '';
            }
            else {
               let s = cb[lar[e - 1] - 1];
               leftw[e] = cb[lar[e] + 1].slice(0, -s.length - i);
               rightw[e] = '!'.repeat(i);
               centralw[e] = base(s);
            }
         }
         return getmstring(cb[lar.at(-1)], lar.length - 2);
      }





      function trimboosters(st, r) {
         //if(!r)
         //   return st;
         while (st.length > 1 && booster(st) < r)
            st = base(st);
         return bb(st, r);
      }





      // st - modified string, r - model string (January 2025 version)
      function modstring_new_jan(st, r) {
         if (r == col) {
            if (st == col)
               return '[c!';
            if (st[0] == col) {
               let s = st.slice(1);
               return (antibooster(s) > col ? '' : '[c!') + s;
               //return s;
               //return getsum('[c!',getterms(st,col));
            }
            return st;
         }
         let x = booster(st);
         let xr = booster(r);
         if (st.length < 2 || x >= xr)
            //if(st.length<2||x>=r)
            //if(st.length<2||x>=antibooster(r))
            //if(st.length<2||(r<col)&&(x>=antibooster(r)))
            //if(st.length<2||(x>=xr&&(r<col)&&(x>=antibooster(r))))
            return trimboosters(base(r), modstring_new(st, xr));
         return trimboosters(modstring_new(base(st), r), modstring_new(x, xr));
      }





      function bbm(st, r) {
         while (st.length > 1 && booster(st) < r)
            st = base(st);
         if (!st) {
            if (isepsilon(r))
               return r;
            st = r;
            while (st && !isepsilon(st))
               st = base(st);
         }
         return bb(st, r);
      }





      function trimc(st) {
         while (st.length > 1 && booster(st) < col)
            st = base(st);
         return st;
      }





      // st - modified string, r - model string
      function modstring_new_june(st, r) {
         if (r == col && st < col)
            return st;
         if (st.length < 2)
            return base(r);
         if (isepsilon(st) && !isepsilon(r))
            return bbm(base(r), modstring_new_june(st, booster(r)));
         if (!isepsilon(st) && isepsilon(r))
            return bbm(modstring_new_june(base(st), r), modstring_new_june(booster(st), r));
         //if(r<col&&trimc(booster(st))>=trimc((antibooster(r))))
         //   return base(r);
         return trimboosters(modstring_new_june(base(st), r), modstring_new_june(booster(st), booster(r)));
      }





      // st - modified string, r - model string
      function modstring_new_july(st, r) {
         let x = booster(st);
         let y = booster(r);
         let ax;
         if (x < y)
            ax = y;
         else {
            ax = antibooster(r);
            while (ax.length > 1 && booster(ax) < col)
               ax = base(ax);
         }
         let m = '';
         let mx;
         let mx1 = '';
         while (st && booster(st) < ax) {
            mx = modstring_new_june(x, y)
            st = base(st);
            x = booster(st);
            if (mx >= mx1) {
               m = '[' + mx + '!' + m;
               mx1 = mx;
            }
         }
         return base(r) + m;
      }





      function isone_old(st1, beta1, beta2, x) {
         if (altcompare(st1, beta2))
            return false;
         if (booster(beta2) != x)
            return true;
         return !isone(beta2, base(beta2), beta1, x);
      }





      // alternative comparison (st1<=*st2: true; st1>*st2: false)
      function altcompare_old(st1, st2) {
         if (st1 == st2)
            return true;
         if (st1.length < 2 || st2.length < 2)
            return st1.length <= st2.length;
         let beta2 = base(st2);
         let x2 = booster(st2);
         //if(altcompare(st1,beta2)||altcompare(st1,x2))
         if (altcompare(st1, x2) || altcompare(st1, topstring(st2)))
            return true;
         let beta1 = base(st1);
         let x1 = booster(st1);
         //if(altcompare(st2,beta1)||altcompare(st2,x1))
         if (altcompare(st2, x1) || altcompare(st2, topstring(st1)))
            return false;

         //if((x1<x2&&altcompare(beta1,beta2)==false)||(x1>x2&&beta1!=beta2&&altcompare(beta1,beta2)==true))
         //   alert(st1+'\n'+st2);  

         if (beta1 == beta2)
            return x1 < x2;
         if (x1 == x2)
            return altcompare(beta1, beta2);

         if (x1 > x2 && x1 == booster(beta2))
            return isone(beta2, base(beta2), beta1, x1);

         if (x1 < x2 && x2 == booster(beta1))
            return !isone(beta1, base(beta1), beta2, x2);

         return x1 < x2;

         //return x1==x2?altcompare(beta1,beta2):x1<x2;
      }





      function checkalt(st1, st2) {
         if (isone(st1, st2))
            return altcompare(booster(st1), booster(st2));
         if (isone(base(st2), st1))
            return true;
         return x1 < x2;
      }





      function isone(st1, st2) {
         if (st1 == st2)
            return true;
         let [sb1, sx1, s1] = getsbsb(st1);
         let [sb2, sx2, s2] = getsbsb(st2);
         if (sx1 != sx2 || altcompare(s1, sb2) || altcompare(s2, sb1) || isone(sb2, s1) || isone(sb1, s2))
            return false;
         return true;
      }





      // get superbase and subbooster of st
      function getsbsb(st) {
         let beta = base(st);
         let x = booster(st);
         if (x.length < 2)
            return [beta, x, st];
         let [sb, y, s] = getsbsb(x);
         sb = bb(beta, sb);
         if (altcompare(s, sb) || isone(sb, s))
            return [beta, x, st];
         return [sb, y, s];
      }





      // alternative comparison (st1<=*st2: true; st1>*st2: false)
      function altcompare(st1, st2) {
         if (st1 == st2)
            return true;
         if (st1.length < 2 || st2.length < 2)
            return st1.length <= st2.length;
         let beta2 = base(st2);
         let x2 = booster(st2);
         if (altcompare(st1, beta2) || altcompare(st1, x2))
            return true;
         let beta1 = base(st1);
         let x1 = booster(st1);
         if (altcompare(st2, beta1) || altcompare(st2, x1))
            return false;

         //b=altcompare(beta1,beta2);
         if (x1 == x2)
            return altcompare(beta1, beta2);

         //return b?checkalt(st1,st2):!checkalt(st2,st1);

         if (isone(st1, st2))
            return altcompare(booster(st1), booster(st2));

         let [sb1, sx1, s1] = getsbsb(st1);
         let [sb2, sx2, s2] = getsbsb(st2);

         if (altcompare(s1, sb2))
            return true;

         if (altcompare(s2, sb1))
            return false;

         if (isone(s1, sb2))
            return true;

         if (isone(s2, sb1))
            return false;

         return sx1 < sx2;
      }





      // continue opened string
      // b = true: larger; b = false: lesser
      function contostring(st, b) {
         if (st.at(-1) == col)
            return (b ? st : st.slice(0, -1)) + '[';
         return b ? st + col : st.slice(0, -1) + '![';
      }





      // open string
      function openstring(st) {
         let i = st.length - 1;
         while (st[i] == '!')
            i--;
         return st.slice(0, i + 1);
      }





      // close opened string
      function closestring(st) {
         return st + '!'.repeat(ocd(st));
      }





      // remove booster tower summit
      function topstring(st) {
         st = openstring(st);
         st = st.slice(0, st.at(-1) == col ? -2 : -1);
         return closestring(st);
      }





      // st - modified string, r - model string
      function modstring_new(st, r) {
         let st0 = openstring(st);
         //let rs=st0.length-openstring(r).length;
         let pr = st0.length;
         let l = st0.length * 2;
         let b = false;
         while (!b || st0.length < l) {
            st0 = contostring(st0, b);
            b = altcompare(closestring(st0), st);
         }

         let pl = 1;

         while (st0.slice(pr, pr + pl).repeat(Math.ceil((st0.length - pr) / pl)).slice(0, st0.length - pr) != st0.slice(pr))
            pl++;

         while ((st0.length - pr) / pl < 2) {
            while (!b || st0.length < 2 * pl + pr) {
               st0 = contostring(st0, altcompare(closestring(st0), st));
               b = altcompare(closestring(st0), st);
            }
            while (st0.slice(pr, pr + pl).repeat(Math.ceil((st0.length - pr) / pl)).slice(0, st0.length - pr) != st0.slice(pr))
               pl++;
         }
         return st0.slice(pr, pr + pl);
      }





      function spliceperiod(st) {
         let e = 2;
         while (e <= st.length) {
            if (!(st.length % e)) {
               let s = st.slice(0, st.length / e);
               if (s.repeat(e) == st)
                  return spliceperiod(s);
            }
            e++;
         }
         return st;
      }





      // second comparison of strings st1, st1
      function sc(st1, st2) {
         if (st1 == st2)
            return 0;
         if (!st1)
            return -1;
         if (!st2)
            return 1;
         if (st1 == bo)
            return 1;
         if (st2 == bo)
            return -1;
         if (st1 == col)
            return st2.includes(col) ? -1 : 1;
         if (st2 == col)
            return st1.includes(col) ? 1 : -1;
         let beta1 = base(st1);
         let booster1 = booster(st1);
         let beta2 = base(st2);
         let booster2 = booster(st2);
         let s1 = sc(beta1, booster1) == 1 ? beta1 : booster1;
         let s2 = sc(beta2, booster2) == 1 ? beta2 : booster2;
         if (sc(s1, s2) == 1) {
            if (sc(s1, st2) >= 0)
               return 1;
         }
         else if (sc(s2, st1) >= 0)
            return -1;
         return st1 > st2 ? 1 : -1;
      }





      function istrim(st) {
         if (st.length < 2 || st == bo)
            return true;
         let beta = base(st);
         let x = booster(st);
         return istrim(x) && (beta.length < 2 || booster(beta) >= x);
      }





      function nextsymbol(s, st, openst, b) {
         let ns, cns;
         if (!s || s.at(-1) == '[') {
            ns = s + col;
            cns = closestring(ns);
            if (ns < openst && istrim(cns) && (b || sc(cns, st) < 0))
               return ns;
         }
         ns = s + '[';
         cns = closestring(ns);
         if (ns < openst && istrim(cns) && (b || sc(cns, st) < 0))
            return ns;
         return s + '!';
      }





      function getlesserstring(st, openst, n, b) {
         let s = '';
         while (s.length < n)
            s = nextsymbol(s, st, openst, b);
         return s;
      }





      function checkfselement(st, r) {
         if (st == bo)
            st = 'd';
         r = openstring(r);
         let s = getlesserstring(st, openstring(st), r.length, cofcurrent == bo || cofcurrent > '[[!!');
         if (r != s)
            alert(st + '\n' + convert(st) + '\n\n' + r + '\n' + s);
      }





      function getfselement(st, pr, p0, p1, e, nn, s = '', se = '') {
         //return pr+(p0.repeat(nn))+(p1.repeat(nn))+e);

         let r = s + (pr ? nn ? (pr + (p0.repeat(nn - 1)) + (p1.repeat(nn - 1)) + e) : '' : (p0.repeat(nn)) + (p1.repeat(nn)) + e) + se;
         //checkfselement(st,r);
         return r;

         //return s+(pr?nn?(pr+(p0.repeat(nn-1))+(p1.repeat(nn-1))+e):'':(p0.repeat(nn))+(p1.repeat(nn))+e)+se;

         //pr=s+pr;
         //e=e+se;
         //return pr?nn?(pr+(p0.repeat(nn-1))+(p1.repeat(nn-1))+e):'':(p0.repeat(nn))+(p1.repeat(nn))+e
      }





      // st - modified string, r - model string
      /*function isnewmodstring_old(st,r){
      let r0=openstring(r);
      if(booster(r)==col&&st.slice(0,r0.length-1)==r0.slice(0,-1))
         return true;
      return false;
      }*/





      // st - modified string, r - model string
      /*function isnewmodstring(cb,lar){
      modc++;
      let st=cb[lar[2]];
      let r=cb[lar[1]];
      if(lar[0]-lar[2]==2&&base(st)>=base(r))
         return true;
      modoldc++;
      return false;
      }*/





      // st - modified string, r - model string
      /*function modstring_new_october(st,r){
      return st;
      }*/





      function modstring_new2(cb, lar, gs = false) {
         modc++;
         //let d=lar[2];
         let u = lar[1];
         let c = lar[0];
         let st = cb[lar[2]];
         let r = cb[u];
         if (c - u == 1 && base(st) >= base(r))
            return st + (gs ? '1' : '');

         let g = antibooster(r);
         let d = cb[u + 1];
         let csquared = 'c[c[c!!';
         if (g < csquared && d < csquared) {
            while (g.length > 1 && booster(g) < col)
               g = base(g);
            d = base(d);
            let s = base(r);
            while (antibooster(st) >= g)
               st = antibase(st);
            while (st) {
               s = trimboosters(s, getsum(d, getterms(antibooster(st), col)));
               st = antibase(st);
            }
            return s + (gs ? '2' : '');
         }

         modoldc++;
         return false;
      }





      function a_new3(st) {
         if (st == col)
            return col;
         return trimboosters(a_new3(base(st)), m_new3(booster(st)));
      }





      function m_new3(st) {
         if (st < col)
            return st;
         if (st == col)
            return '';
         let beta = base(st);
         return getterms(a_new3(st), col);
      }





      /*function fill_new3(st,a){
      if(!st)
         return '';
      return bb(fill_new3(base(st),a),getsum(a,booster(st)));
      }*/





      function fill_new3(r, st) {
         if (!st)
            return base(r);
         if (r == col)
            return st;
         if (isepsilon(st))
            return bb(base(r), fill_new3(booster(r), st));
         return trimboosters(fill_new3(r, base(st)), fill_new3(booster(r), booster(st)));
      }





      function modstring_new3(cb, lar, gs = false) {
         let u = lar[1];
         let c = lar[0];
         let st = cb[lar[2]];
         let r = cb[u];
         //let g=antibooster(r);
         /*let g=base(r);
         g=g?booster(g):booster(r);
         while(g.length>1&&booster(g)<col)
            g=base(g);
         while(antibooster(st)>=g)
            st=antibase(st);*/
         let g = r;
         while (antibooster(st) == antibooster(g)) {
            st = antibase(st);
            g = antibase(g);
         }
         st = m_new3(col + st);
         /*st=getsum(col,m_new3(col+st)).slice(1); 
         let i=-2;
         if(c-u>1)
            {
            i=-cb[c-1].length
            st=fill_new3(st,base(cb[c-1]));
            }
         return closestring(openstring(r).slice(0,i)+st);*/
         return fill_new3(r, st);
      }





      function modstring_new4(st, r, b = false) {
         if (r == col) {
            if (st < col)
               return st;
            if (st == col)
               return '';
            let m = '';
            let s = '';
            let x = '';
            while (st > col) {
               x = modstring_new4(booster(st), r, true);
               st = base(st);
               if (x >= m) {
                  m = x;
                  s = antibb(x, s);
               }
            }
            return getterms(col + s, col);
         }
         let y = booster(r);
         let m = '';
         let s = '';
         let x = '';
         while (r.slice(0, st.length) != st) {
            x = modstring_new4(b && isepsilon(st) ? st : booster(st), y, true);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return base(r) + s;
      }





      function modstring_new5(st, r) {
         if (r == col) {
            if (st < col)
               return st;
            if (st == col)
               return '';
            let m = '';
            let s = '';
            let x = '';
            while (st > col) {
               x = modstring_new5(booster(st), r);
               st = base(st);
               if (x >= m) {
                  m = x;
                  s = antibb(x, s);
               }
            }
            return getterms(col + s, col);
         }
         let y = booster(r);
         let m = '';
         let s = '';
         let x = '';
         while (r.slice(0, st.length) != st) {
            //x=modstring_new5(!isepsilon(r)&&isepsilon(st)?st:booster(st),y);
            x = modstring_new5((!isepsilon(r) || st >= r) && isepsilon(st) ? st : booster(st), y);     // 30 January 2026
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return base(r) + s;
      }





      function modstring_new6(st, r) {
         if (r == col) {
            if (st < col)
               return st;
            if (st == col)
               return '';
            let m = '';
            let s = '';
            let x = '';
            while (st > col) {
               x = modstring_new6(booster(st), r);
               st = base(st);
               if (x >= m) {
                  m = x;
                  s = antibb(x, s);
               }
            }
            return getterms(col + s, col);
         }
         let y = booster(r);
         let m = '';
         let s = '';
         let x = '';
         while (r.slice(0, st.length) != st) {
            x = modstring_new6(!isregt(r) && isregt(st) ? st : booster(st), y);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return base(r) + s;
      }





      function modstring_new7(cb, lar) {
         let e = 0;
         let st = col;
         while (e < nlevels) {
            e++;
            st = modstring_new5(cb[lar[e]], st);
         }
         return st;
      }





      function modstring_new8(cb, lar) {
         let e = 0;
         let st = col;
         let i;
         while (e < nlevels) {
            e++;
            i = lar[e - 1] - lar[e];
            st = modstring_new5(cb[lar[e]].slice(0, -i - cb[lar[e - 1]].length) + st + ('!'.repeat(i)), st);
         }
         return st;
      }





      function modstring_new9(st) {
         let pp = [];
         let star = [st];
         let rar = [];
         let e;
         let i = -1;
         while (i < 0) {
            e = pp.length - 1;
            i = e - 1;
            while (i >= 0 && (star[i] != star[e] || rar[i] != rar[e]))
               i--;
            if (i < 0) {
               e++;
               let t = getbtower(star[e]);
               let u = getllr(t);
               let c = countreglevels(t);
               if (c != nlevels)
                  //if(c>nlevels+1)
                  alert(st + '\n' + convert(st) + '\n\noriginal string: ' + star[e - 1] + '\nmodifyed string: ' + star[e] + '\n\ncounter of regular levels: ' + c);
               rar.push(t[u]);
               star.push(modstring_new5(star[e], rar[e]));
               pp.push(star[e].slice(0, -u - t[u].length));
            }
         }
         e--;
         let period = '';
         while (e >= i) {
            period = pp[e] + period;
            e--;
         }
         let primer = '';
         while (e >= 0) {
            primer = pp[e] + primer;
            e--;
         }
         return [primer, spliceperiod(period)];
      }





      function modstring_new10(st) {
         let star = [];
         let rar = [];
         let pp = [0];
         let e;
         let i = -1;
         let s = st;
         while (i < 0) {
            e = pp.length - 2;
            i = e - 1;
            while (i >= 0 && (star[i] != star[e] || rar[i] != rar[e]))
               i--;
            if (i < 0) {
               e++;
               let t = getbtower(s);
               let [f, r] = getfr(t);
               if (f < 0)
                  alert(st + '\n' + convert(st) + '\n\noriginal string: ' + s + '\n\nf: ' + f + '\nr: ' + r);
               star.push(t[f]);
               rar.push(t[r]);
               pp.push(s.length - r - t[r].length);
               s = s.slice(0, -r - t[r].length) + modstring_new5(t[f], t[r]) + ('!'.repeat(r));
               let mst = modstring_new5(t[f], t[r]);
               /*if(mst>=t[r])
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmodifyed string: '+mst);*/
               let c = countreglevels(getbtower(mst));
               if (c != nlevels)
                  alert(st + '\n' + convert(st) + '\n\noriginal string: ' + t[f] + '\nmodel string: ' + t[r] + '\nmodifyed string: ' + mst + '\n\ncounter of regular levels: ' + c);
            }
         }
         return [s.slice(0, pp[i]), spliceperiod(s.slice(pp[i], pp[e]))];
      }





      function modstring_new11(st) {
         let star = [st];
         let pp = [0];
         let e;
         let i = -1;
         let s = '';
         let r;
         while (i < 0) {
            e = pp.length - 2;
            i = e - 1;
            while (i >= 0 && star[i] != star[e])
               i--;
            if (i < 0) {
               e++;
               s += base(star[e]) + '[';
               r = booster(star[e]);
               if (isepsilon(star[e]))
                  while (!isepsilon(r)) {
                     s += base(r) + '[';
                     r = booster(r);
                  }
               pp.push(s.length);
               star.push(modstring_new5(star[e], r));
            }
         }
         return [s.slice(0, pp[i]), spliceperiod(s.slice(pp[i], pp[e]))];
      }





      function getrest(st, r) {
         if (st < r)
            return st;
         let s = '';
         let m = '';
         let x = '';
         //while(!isepsilon(st))
         while (st.length > 1) {
            x = getrest(booster(st), r);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         /*if(!s)
            return s;*/
         if (isepsilon(m))
            return m + antibase(s);
         x = base(m);
         while (x && !isepsilon(x))
            x = base(x);
         return x + s;

         /*if(getterms(col+s,col)!=m+s)
            alert(st+'\n'+convert(st)+'\n\n'+s+'\n'+x+'\n'+getterms(col+s,col)+'\n'+m+s);
         if(booster(m)>=x)
            s=m+s;
         return getterms(col+s,col);
         return s;*/
      }





      function modstring_new12(st, r, ra, ri) {
         if (r == ra[ri]) {
            st = getrest(st, r);
            return ri ? modstring_new12(st, r, ra, ri - 1) : st;
         }
         let y = booster(r);
         let s = '';
         let m = '';
         let x = '';
         while (st.length >= r.length || r.slice(0, st.length) != st) {
            x = modstring_new12(r != ra[ri + 1] && isepsilon(st) ? st : booster(st), y, ra, ri);
            //x=modstring_new12(!isepsilon(r)&&isepsilon(st)?st:booster(st),y,ra,ri);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         /*r=base(r);
         if(!r&&!isepsilon(s))
            if(isepsilon(x))
               s=x+antibase(s);
            else
               {
               m=antibooster(x);
               if(booster(m)>=x)
                  s=m+s;
               }
         else
            s=r+s;
         return s;*/
         return base(r) + s
      }





      function modstring_new13(st, r, ra, ri) {
         if (r == ra[ri]) {
            st = getrest(st, r);
            return ri ? modstring_new13(st, r, ra, ri - 1) : st;
         }
         let y = booster(r);
         let s = '';
         let m = '';
         let x = '';
         while (st.length >= r.length || r.slice(0, st.length) != st) {
            x = modstring_new13(r == ra[ri + 1] || !isepsilon(st) || (isepsilon(r) && !isreg(st)) ? booster(st) : st, y, ra, ri);
            st = base(st);
            if (x >= m) {
               m = x;
               s = antibb(x, s);
            }
         }
         return base(r) + s;
      }





      function getcnf(st) {
         let c = [];
         while (st && !isepsilon(st)) {
            c.push(booster(st));
            st = base(st);
         }
         //if(st&&st>=(c.at(-1)??''))
         if (st)
            c.push(st);
         return c;
      }





      function clearcnf(s) {
         let cl = [];
         let m = '';
         for (let e = 0; e < s.length; e++)
            if (s[e] >= m) {
               m = s[e];
               cl.push(m);
            }
         return cl;
      }





      function getepsilonpart(st) {
         while (st && !isepsilon(st))
            st = base(st);
         return st;
      }





      function getstring(cs) {
         let st = '';
         if (cs.length) {
            let s = cs.at(-1);
            let e = getepsilonpart(s);
            st = e == s ? e : bb(e, s);
         }
         for (let e = cs.length - 2; e >= 0; e--)
            st = bb(st, cs[e]);
         return st;
      }





      function modstring_new14(st, r) {
         if (r == col && st < r)
            return st;
         let [b1, b2] = [isepsilon(st), isepsilon(r)];
         if (b1 && b2) {
            if (st == col)
               return '';
            let [r1, r2] = [isreg(st), isreg(r)];
            st = (!r1 || r2 ? col : '') + st;
            //st=col+st;
            //b2=!r2||r1;
            r = (b2 ? col : '') + r;
         }
         //if(b1&&b2)
         //   return st==col?'':modstring_new14(col+st,col+r).slice(1);
         st = getcnf(st);
         r = getcnf(r);
         let e = r.length - 1;
         while (e && r[e] == st.at(-1)) {
            e--;
            st.pop();
         }
         for (e = 0; e < st.length; e++)
            st[e] = modstring_new14(st[e], r[0]);
         return getstring(clearcnf(st).concat(r.slice(1))).slice(b1 && b2 ? 1 : 0);
      }





      function modstring_new15(st, r, ra, ri) {
         modc++;

         // r is next Omega
         let nextomega = col;
         for (let e = 1; e < nlevels; e++)
            nextomega = trimboosters(st, nextomega);
         if (r == nextomega)
            return st;

         // all boosters of st should not be modified as booster of r, and base of st is not modified
         let d = base(r);
         if (st.length > d.length && st.slice(0, d.length) == d) {
            let s = st.slice(d.length);
            let b = true;
            let y = openstring(booster(r)).slice(0, -1) + '[' + col;
            while (b && s) {
               let x = booster(s);
               s = base(s);
               if (x.length < y.length || x.slice(0, y.length) != y)
                  b = false;
            }
            if (b)
               return st;
         }

         // all boosters of st should not be modified as booster of r, and base of st is modified
         while (d && (st.length <= d.length || st.slice(0, d.length) != d))
            d = base(d);
         let s = st.slice(d.length);
         let b = true;
         let y = openstring(booster(r)).slice(0, -1) + '[' + col;
         while (b && s) {
            let x = booster(s);
            s = base(s);
            if (x.length < y.length || x.slice(0, y.length) != y)
               b = false;
         }
         if (b)
            return base(r) + st.slice(d.length);

         modoldc++;
         return modstring_new13(st, r, ra, ri);
      }





      // get left common part of s and r
      function getlcp(s, r) {
         while (s.length > r.length || r.slice(0, s.length) != s)
            s = base(s);
         return s;
      }





      // triple modification
      function trimod(s, st, r) {
         if (st <= s)
            return st;
         if (st >= col) {
            r = col;
            st = st.slice(1);
         }
         else
            st = st.slice(getlcp(s, st).length);
         let t = r;
         while (st) {
            //t=trimboosters(t,trimod(s,antibooster(st),r));
            t = trimboosters(t, trimod(getlcp(antibooster(st), r), antibooster(st), r));
            st = antibase(st);
         }
         return t;
      }





      function modstring_new16(st, r) {
         return trimod(getlcp(st, r), st, base(r));
      }





      function conpp(st) {
         let star = [];
         let rar = [];
         let pp = [0];
         let e;
         let i = -1;
         let s = st;
         while (i < 0) {
            e = pp.length - 2;
            i = e - 1;
            while (i >= 0 && (star[i] != star[e] || rar[i] != rar[e]))
               i--;
            if (i < 0) {
               e++;
               let [t, ra] = getbratower(s);
               let [f, r] = getfr(t);
               /*if(f<0)
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+s+'\n\nf: '+f+'\nr: '+r);*/
               star.push(t[f]);
               rar.push(t[r]);
               pp.push(s.length - r - t[r].length);
               s = s.slice(0, -r - t[r].length) + modstring_new15(t[f], t[r], ra, nlevels - 2) + ('!'.repeat(r));
               //let mst=modstring_new15(t[f],t[r],ra,nlevels-2);
               //s=s.slice(0,-r-t[r].length)+modstring_new16(t[f],t[r])+('!'.repeat(r));
               //let mst=modstring_new16(t[f],t[r]);
               modoldfraction = modoldc / modc;
               //let mst13=modstring_new13(t[f],t[r],ra,nlevels-2);
               //let mst12=modstring_new12(t[f],t[r],ra,nlevels-2);
               //let mst5=modstring_new5(t[f],t[r]);
               /*if(mst!=mst5)
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmst5: '+mst5+'\nmst: '+mst);*/
               /*if(mst!=mst12)
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmst12: '+mst12+'\nmst: '+mst);*/
               /*if(mst!=mst13)
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmst13: '+mst13+'\nmst16: '+mst);*/
               /*if(mst>=t[r])
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmodifyed string: '+mst);*/
               /*let c=countreglevels(getbtower(mst));
               if(c!=nlevels)
                  alert(st+'\n'+convert(st)+'\n\noriginal string: '+t[f]+'\nmodel string: '+t[r]+'\nmodifyed string: '+mst+'\n\ncounter of regular levels: '+c);*/
            }
         }
         return [s.slice(0, pp[i]), spliceperiod(s.slice(pp[i], pp[e]))];
      }





      function modysttoperiod_old(modyst, l) {
         let e = modyst.length - 1;
         while (modyst[e] == '!')
            e--;
         modyst = modyst.slice(0, e);
         modyst = modyst.slice(0, 1 - l);
         l = l % modyst.length;
         return spliceperiod(modyst.slice(l) + modyst.slice(0, l));
      }





      function modysttoperiod(modyst, l, l1) {
         let e = modyst.length - 1;
         while (modyst[e] == '!')
            e--;
         modyst = modyst.slice(0, e);
         modyst = modyst.slice(0, 1 - l);
         l1 = l1 % modyst.length;
         return spliceperiod(modyst.slice(l1) + modyst.slice(0, l1));
      }





      // get booster tower of st
      function getbtower(st) {
         let t = [];
         while (st) {
            t.push(st);
            st = booster(st);
         }
         return t;
      }





      // get booster tower and regulars of st
      function getbratower(st) {
         let t = [];
         while (st) {
            t.push(st);
            st = booster(st);
         }
         let i = t.length - 1;
         let ra = [col];
         while (i) {
            i--;
            if (t[i] < ra.at(-1))
               ra.push(t[i]);
         }
         return [t, ra];
      }





      // get level of lowest regular of booster tower t
      function getllr(t) {
         let i = t.length - 1;


         for (let e = i; e > 0; e--)
            if (t[e] < t[i])
               i = e;

         /*let u=nlevels;
         let e=i;
         while(u>1)
            {
            e--;
            if(t[e]<t[i])
               {
               i=e;
               u--;
               }
            }*/

         return i;
      }





      // get floor and lowest reqular of booster tower t
      function getfr(t) {
         let i = t.length - 1;
         let u = nlevels;
         let e = i;
         while (u > 1) {
            e--;
            if (t[e] < t[i]) {
               i = e;
               u--;
            }
         }
         while (t[e] >= t[i])
            e--;
         return [e, i];
      }





      function countreglevels(t) {
         let c = 0;
         let i = t.length - 1;
         for (let e = i - 1; e >= 0; e--)
            if (t[e] < t[i]) {
               i = e;
               c++;
            }
         if (i > 0)
            c += 0.5;
         return c;
      }





      function isnlevels(st) {
         let t = getbtower(st);
         let e = t.length;
         let i = 0;
         let s = t[e - 1];
         while (e) {
            e--;
            if (t[e] < s) {
               i++;
               s = t[e];
            }
         }
         return i == nlevels && s == st;
      }





      /*function isregt(st){
      let t=getbtower(st);
      let e=t.length;
      let i=0;
      let s=t[e-1];
      while(e)
         {
         e--;
         if(t[e]<s){
            i++;
            s=t[e];
            }
         }
      return s==st;
      }*/





      // is st regular
      function isreg(st) {
         if (!st) return false;
         if (st == col) return true;
         if (openstring(st).at(-1) == '[') return false;
         for (let s = booster(st); s; s = booster(s))
            if (s < st) return false;
         return true;
      }





      function getrlength(st) {
         let t = getbtower(st);
         let e = t.length;
         let i = 1;
         let s = t[e - 1];
         while (i < nlevels) {
            e--;
            if (t[e] < s) {
               i++;
               s = t[e];
            }
         }
         return s.length - t.length + e + 1;
      }





      function checkrp(st, l, p) {
         st = st.slice(0, -l - 1) + '[' + col;
         while (p.length < st.length)
            p = p + p;
         return st == p.slice(0, st.length);
      }





      // get n-th element of fs of ordinal st
      function fs(st, n, nn = 0) {

         //let nin=getnin(st);
         //if(nin>4)
         //   alert(st+'\n'+convert(st)+'\nnin = '+nin);

         // optimization
         if (st == fscurrent)
            //return fsopening+(fsperiod0.repeat(nn))+(fsperiod1.repeat(nn)+fsending);
            //return fsopeningarray[subperiodpositionshift]+(fsperiodarray[subperiodpositionshift].repeat(nn))+(fsperiod1.repeat(nn)+fsendingarray[subperiodpositionshift]);
            return getfselement(st, fsopeningarray[subperiodpositionshift], fsperiodarray[subperiodpositionshift], fsperiod1, fsendingarray[subperiodpositionshift], nn, fsprimer0, fsending0);

         if (fscurrent)
            subperiodpositionshift = 0;

         fscurrent = st;
         cblen = 0;
         cbc = 0;
         cpn = 0;

         // limit rule
         if (st == bo) {
            cofcurrent = st;
            cofclass = 3;

            if (uncountablemode) {
               //uncountable
               fsopening = col;
               fsperiod0 = '[' + col;
               fsperiod1 = '!';
               fsending = '';
               setfsarrays();
               fsprimer0 = '';
               fsending0 = '';
               //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
               return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn);
            }
            else {
               //countable
               fsopening = nlevels ? '['.repeat(nlevels - 1) : col;
               fsperiod0 = '[' + col;
               fsperiod1 = '!';
               fsending = nlevels ? '!'.repeat(nlevels - 1) : '';
               setfsarrays();
               fsprimer0 = '';
               fsending0 = '';
               //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
               return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn);
            }
         }

         let i = st.length - 1;
         while (st[i] == '!')
            i--;
         let e = st[i] == '[';
         let st0 = st.slice(0, i);
         let st1 = st.slice(i + (e ? 2 : 1));
         let s1;

         // successor and plain rule
         if (e) {
            st0 += '!';
            cofcurrent = st1 ? '[[!!' : '[!';
            cofclass = st1 ? st == cofcurrent ? 3 : 0 : 2;
            let st2 = st1;
            //s1=bb('',booster(st0));
            s1 = st1 ? bb('', booster(st0)) : '';
            st1 = st1.slice(1);
            fsopening = base(st0);
            fsperiod0 = s1;
            fsperiod1 = '';
            fsending = st1;

            setfsarrays();
            fsprimer0 = '';
            fsending0 = '';
            //return fsopening+fsperiod0.repeat(nn)+fsending;
            return getfselement(st, fsopening, fsperiod0, '', fsending, nn);
         }

         // main rule
         let stt = st0;
         let u = i - 1;

         while (st0[u] == '[')
            u--;
         u = i - u - 1;

         st0 += '[';

         st1 = st1.slice(u);
         let s;

         u++;
         let uo = '['.repeat(u);

         let cb = [st];
         //let nc=[1,1];
         while (cb.at(-1).length > 1) {
            cb.push(booster(cb.at(-1)));
         }

         let nod = 0;
         let mb = col;
         for (i = cb.length - 1; i >= 0; i--)
            if (cb[i] < mb) {
               nod++;
               mb = cb[i];
            }

         let noi = 0;
         mb = st;
         for (i = 0; i < cb.length; i++)
            if (cb[i] > mb) {
               noi++;
               mb = cb[i];
            }

         //if(nod>4||noi>4)
         //   alert(st+'\n'+convert(st)+'\nnod = '+nod+'\nnoi = '+noi);

         let pn = cb.length - 1;
         //let lrn=pn;
         let nl = nlevels;

         // pn1 - index of second lowest regular of booster tower
         let pn1;

         let lr = 'c';
         let lar = [pn];
         //let r;           // more powerful system

         while (nl) {
            if (cb[pn] < lr) {
               //lrn=pn;
               lr = cb[pn];
               lar.push(pn);
               nl--;

               if (nl == 1)
                  pn1 = pn;

               // more powerful system
               /*let q=base(lr);
               if(lar.length>2&&q!=r)
                  {
                  nl=0;
                  r=q;
                  
                  let w=booster(lr);                      // new
                  while(booster(q)==w)
                     q=base(q);
                     
                  while(q.length>1&&booster(q)==col)
                     {
                     q=base(q);
                     nl++;
                     }
                  }*/

            }
            else {
               pn--;

               // cof > ω
               if (pn < 0) {
                  fsopening = st0.slice(0, -1);
                  fsperiod0 = '[' + col;
                  while (fsopening.slice(-2) == fsperiod0)
                     fsopening = fsopening.slice(0, -2);
                  fsperiod1 = '!';
                  fsending = '!'.repeat(ocd(fsopening));
                  cofcurrent = lr;
                  cofclass = st == cofcurrent ? 3 : 0;
                  setfsarrays();
                  fsprimer0 = '';
                  fsending0 = '';
                  //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
                  return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn);
               }

            }
         }

         //if(st>'[c!')
         //   alert(st);





         //st0=st.slice(0,-cb.length)+'[';
         st0 = cb[pn].slice(0, -cb.length + pn) + '[';

         /*let modyst=cb[lar[1]];
         e=2;
         while(e<lar.length)
            {
            modyst=modstring(cb[lar[e]],modyst,cb[lar[e-2]]);
            e++;
            }
         e=modyst.length-1;
         while(modyst[e]=='!')
            e--;
         modyst=modyst.slice(0,e);
         e=cb[lar.at(-2)].length-cb.length+pn1;
         modyst=modyst.slice(1,-e)+'[';
         e=e%modyst.length;
         modyst=spliceperiod(modyst.slice(e)+modyst.slice(0,e));*/
         //modyst=spliceperiod(modyst.slice(cb[lar.at(-2)].length-cb.length+pn1+2,e)+'[');

         i = pn1;
         //let modyst=modstring_new(cb[pn],cb[pn1]);
         //let modyst=isnewmodstring(cb[pn],cb[pn1])?modstring_new_october(cb[pn],cb[pn1]):modyst_old;
         //let modyst=isnewmodstring(cb,lar)?modstring_new2(cb,lar):modyst_old;

         //let modyst_old=modstring(cb,lar);            // January 2025
         //let modyst=modstring_new2(cb,lar,true);      // 02 January 2026
         //let modyst_3=modstring_new3(cb,lar);         // 12 January 2026
         //let modyst_4=modstring_new4(cb[pn],cb[pn1]); // 13 January 2026
         //let modyst_5=modstring_new5(cb[pn],cb[pn1]);   // 16 January 2026
         //let modyst_6=modstring_new6(cb[pn],cb[pn1]); // 21 January 2026
         //let modyst_7=modstring_new7(cb,lar);           // 21 January 2026
         //let modyst_8=modstring_new8(cb,lar);           // 23 January 2026
         //let [primer_9,period_9]=modstring_new9(cb[pn]);           // 26 January 2026
         //let [primer_10,period_10]=modstring_new10(cb[pn]);           // 27 January 2026
         //let [primer_11,period_11]=modstring_new11(cb[pn]);           // 27 January 2026
         //let modyst_12=modstring_new12(cb[pn],cb[pn1],[col,cb[pn1]],0);   // 10 February 2026
         let [primer_10, period_10] = conpp(cb[pn]);           // 11 February 2026

         /*let mstep;
         if(!modyst)
            {
            modyst=modyst_old;
            mstep='0';
            }
         else
            {
            mstep=modyst.at(-1);
            modyst=modyst.slice(0, -1)
            }
         
         modoldfraction=modoldc/modc;*/

         //if(modyst!=modyst_old)
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_old: '+modyst_old+'\n'+convert(modyst_old)+'\n\nmodyst_new: '+modyst+'\n'+convert(modyst));

         //if(modyst!=modyst_3&&modyst_old!=modyst_3)
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_old: '+modyst_old+'\n'+convert(modyst_old)+'\n\nmodyst: '+modyst+'\n'+convert(modyst)+'\n\nmodyst_3: '+modyst_3+'\n'+convert(modyst_3));

         //if(modyst!=modyst_3)
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst: '+modyst+'\n'+convert(modyst)+'\n\nmodyst_3: '+modyst_3+'\n'+convert(modyst_3));

         //if(modyst_3!=modyst_4&&cb[pn]!=modyst_4)
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_3: '+modyst_3+'\n'+convert(modyst_3)+'\n\nmodyst_4: '+modyst_4+'\n'+convert(modyst_4));

         //if(modyst_4!=modyst_5&&cb[pn]!=modyst_5)
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_4: '+modyst_4+'\n'+convert(modyst_4)+'\n\nmodyst_5: '+modyst_5+'\n'+convert(modyst_5));

         //if(modyst_5!=modyst_12)
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_5: '+modyst_5+'\n'+convert(modyst_5)+'\n\nmodyst_12: '+modyst_12+'\n'+convert(modyst_12));

         /*if(modyst_7!=modyst_8)
            alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_7: '+modyst_7+'\n'+convert(modyst_7)+'\n\nmodyst_8: '+modyst_8+'\n'+convert(modyst_8));*/



         //if(modyst_5=='[[c[[[c!!!!!')
         /*if(modyst_5=='[[[c![[[c!!!!!')
            alert('!');*/

         /*let ror=0;
         while(ror<nlevels&&lar[ror]-lar[ror+1]==1)
            ror++;*/

         //let modyst=modysttoperiod_old(modyst_5,cb[i].length-lar[0]+i);

         /*let modyst_p=modysttoperiod(modyst_7,getrlength(modyst_7),0);
         let crpcounter=0;
         for(i=1;i<nlevels;i++)
            if(checkrp(cb[lar[i]],lar[0]-lar[i],modyst_p))
               crpcounter++;
         if(modyst_p!='['&&crpcounter<1)
            alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nperiod: '+modyst_p+'\n\ncrpcounter: '+crpcounter);
         i=nlevels-1;
         while(modyst_p!='['&&!checkrp(cb[lar[i]],lar[0]-lar[i],modyst_p))
            i--;
         
         //let modyst=modysttoperiod(modyst_7,getrlength(modyst_7),cb[lar[i]].length-lar[0]+lar[i]);
         
         i=nlevels-1;
         while(modyst_7>cb[lar[i]])
            i--;
         st0=cb[pn].slice(0,pn-lar[i]-cb[lar[i]].length);
         let modyst=modysttoperiod(modyst_7,getrlength(modyst_7),0);*/

         /*if(st0<(primer_9+(period_9.repeat(10))).slice(0,st0.length))
            alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nst0: '+st0+'\n\npp: '+((primer_9+(period_9.repeat(10))).slice(0,st0.length)));
            
         if(st0<primer_9)
            alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nst0: '+st0+'\n\nprimer_9: '+primer_9+'\nperiod_9: '+period_9);*/

         st0 = primer_10;
         let modyst = period_10;

         /*if((modyst!='['&&modyst[0]!=col&&ror==1)||(modyst[0]==col&&ror>1))
            alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nror: '+ror);*/

         //if(cb[i].length-lar[0]+i!=getrlength(modyst_7))
         //   alert(cb[pn]+'\n'+convert(cb[pn])+'\n\n'+(cb[i].length+i-lar[0])+'\n\n'+getrlength(modyst_7));

         /*if(!isnlevels(modyst_8))
            alert(st+'\n'+convert(st)+'\n\nmodyst_8: '+modyst_8);*/

         /*if(nlevels>2&&!pn&&!base(st))
            {
            let modyst_m1=modstring_new5(cb[lar[nlevels-1]],cb[lar[nlevels-2]]);
            let modyst_m=modysttoperiod(modyst_m1,cb[lar[nlevels-2]].length-lar[0]+lar[nlevels-2]);
            if(modyst!=modyst_m)
               alert(cb[pn]+'\n'+convert(cb[pn])+'\n\nmodyst_5: '+modyst_5+'\n\nmodyst: '+modyst+'\n\nmodyst_m1: '+modyst_m1+'\n\nmodyst_m: '+modyst_m);
            }*/

         //if(modyst!=modyst_old)
         //   alert(st+'\n'+convert(st)+'\n\nmodyst_old: '+modyst_old+'\nmodyst: '+modyst);
         //modyst=modyst_old;



         // no overlap
         // cb: [[[Xc]]] → X[
         /*for(i=pn;i<cb.length;i++)
            {while(cb[i][0]=='[')
               cb[i]=cb[i].slice(1);
            cb[i]=cb[i].slice(0,-cb.length+i)+'[';
            }
            
         // largest repeated cb
         let np=cb.length-1;
         for(i=cb.length-2;i>=pn;i--)
            if(cb[i]>cb[np].repeat(Math.ceil(cb[i].length/cb[np].length)))
               np=i;*/





         /*let cbase=Array(cb.length*2-pn);
         for(i=pn;i<cb.length;i++)
            {
            cbase[i]=base(cb[i])+'[';
            cbase[i+cb.length-pn]=cbase[i];
            }
         
         for(e=pn;e<cb.length;e++)
            {
            let bar=Array(cb.length).fill(true);
            cb[e]='';
            for(i=pn;i<cb.length;i++)
               cb[e]+=cbase[e+i-pn];
            let bc=cb.length-pn-1;
            let b=true;
            while(bc&&b)
               {
               b=false;
               let i1;
               for(i=e+pn+1;i<e+cb.length;i++)
               if(bar[i])
                  {
                  let cbc=cbase[e];
                  for(u=e+pn+1;u<e+cb.length;u++)
                     if(bar[u]&&u!=i)
                        cbc+=cbase[u];
                  if(infcompare(cbc,cb[e]))
                     {
                     b=true;
                     cb[e]=cbc;
                     i1=i;
                     }
                  }
               if(b)
                  {
                  bar[i1]=false;
                  bc--;
                  }
               }
            }
            
         for(i=pn;i<cb.length;i++)
         if(cb[i].includes(col))
            while(cb[i][0]=='[')
               cb[i]=cb[i].slice(1)+'[';
         else
            cb[i]='[';
         
         
            
         let prover=Array(cb.length);
         for(i=pn;i<cb.length;i++)
            prover[i]=st0;*/






         /*let bslr=cb[pn1+1];
         let bslr0=bslr;
         let bslr1='';
         while(bslr0.at(-1)=='!')
            {
            bslr0=bslr0.slice(0, -1);
            bslr1=bslr1+'!';
            }
         bslr0=bslr0.slice(0, -1);
         let mper=cb[pn];
         fsperiod0='';
         while(mper&&booster(mper)<bslr)
            {
            i=booster(mper);
            while(i>=col)
               i=booster(i);
            if(bslr0)
               i=bslr0+i+bslr1;
            fsperiod0='['+i+'!'+fsperiod0;
            mper=base(mper);
            }
         fsperiod0=base(cb[pn1])+fsperiod0;*/





         // overlap
         /*let prover=Array(cb.length);
         
         // cb: [[[Xc]]] → X[
         for(i=pn;i<cb.length;i++)
            {while(cb[i][0]=='[')
               {cb[i]=cb[i].slice(1);
               }
            cb[i]=cb[i].slice(0,-cb.length+i)+'[';
            cb[i]=overperiod(cb[i]);
            prover[i]=overprimer(cb[i],st0);
            }*/

         //cb[0]=='c[[c[c!!!![[c[['               // Φ(1, 0)[I]
         //cb[0]=='c[[c[c!!!![['
         //if(st=='[c[[c[c!!!![[c[c!!!')
         //   cb[0]='c[[c[c!!!![c[[';

         /*c
         c[c!
         [c[c!!
         [c[[c[c!!!![[c[c!!!
         
         c[[c[c!!!![[c[[
         
         [
         c[
         [
         c[[c[c!!!![
         */


         //cb[0]='c![[c[c!!![[c[[';               // Ω[I][I]
         //if(st=='[c![[c[c!!![[c[c!!!')
         //   cb[0]='c[c!!![[c[[';

         /*[
         c[
         [
         c[c!!![
         c![[
         */



         /*let cbnew=cb[pn].slice(0,-cb.length+pn);
         
         let pr;
         let per;
         [pr,per]=getprper(cbnew);
         
         let stnew=st0.slice(0,st.length-cbnew.length-cb.length)+pr+per;
         cbnew=per;
         
         let shpos=per.indexOf(col);
         //if(pr=='['&&per=='[c[[')
         if(shpos>0)
            {
            let shp=per.slice(0,shpos);
            stnew+=shp;
            cbnew=per.slice(shpos)+shp;
            }*/





         /*let np=cb.length-1;
         for(i=cb.length-2;i>=pn;i--)
         
            if(prover[i].length+cb[i].length>prover[np].length+cb[np].length)
               {
               if(prover[i]+cb[i]>prover[np]+(cb[np].repeat(Math.ceil((prover[i].length-prover[np].length+cb[i].length)/cb[np].length))))
                  np=i;
               }
            else
               if(prover[i]+(cb[i].repeat(Math.ceil((prover[np].length-prover[i].length+cb[np].length)/cb[i].length)))>prover[np]+cb[np])
                  np=i;
         //np=pn;
         st0=prover[np];*/




         /*cblen=1;
         cbc=1;
         cpn=pn;
         for(i=pn+1;i<cb.length;i++)
            {
            if(cb[i]!=cb[i-1])
               cblen++;
            if(i==np)
               cbc=cblen;
            }*/





         let rr = modyst.length - getpos(modyst);
         while (rr < 0)
            rr += modyst.length;

         //fsopening=st0.slice(0,-rr);
         rr %= modyst.length;
         fsopening = st0 + modyst.slice(0, -rr);
         //fsopening=modyst.slice(0,-rr);
         fsperiod0 = modyst.slice(-rr) + modyst.slice(0, -rr);

         /*if(st=='[c[[c[c!!!![[c[c!!!')
            //fsperiod0.replace('!!!!', '!!!![c');
            fsperiod0=fsperiod0+'[c';*/

         while (fsopening.slice(-fsperiod0.length) == fsperiod0)
            fsopening = fsopening.slice(0, -fsperiod0.length);

         /*st0=st.slice(0,-cb[pn].length-pn);                        // modstring_new5
         while(st0.slice(-modyst.length)==modyst)
            st0=st0.slice(0,-modyst.length);*/

         st0 = st.slice(0, -cb[pn].length - pn);                      // modstring_new10

         /*if((st0+fsopening).slice(-fsperiod0.length)==fsperiod0)
            {
            fsopening=st0.slice(0,-fsperiod0.length+fsopening.length);
            while(fsopening.slice(-fsperiod0.length)==fsperiod0)
               fsopening=fsopening.slice(0,-fsperiod0.length);
            st0='';
            }*/


         fsperiod1 = '!'.repeat(ocd(fsperiod0));
         fsending = '!'.repeat(ocd(fsopening));



         /*rr=cbnew.length-getpos(cbnew);
         while(rr<0)
            rr+=cbnew.length;
            
            
         //let fsopeningold=stnew.slice(0,-rr);
         rr%=cbnew.length;
         //let fsopeningtest=stnew+cbnew.slice(0,-rr);
         let fsopeningold=stnew+cbnew.slice(0,-rr);
         let fsperiodold0=cbnew.slice(-rr)+cbnew.slice(0,-rr);
         
         //if(st=='[c[[c[c!!!![[c[c!!!')
            //fsperiodold0.replace('!!!!', '!!!![c');
         //   fsperiodold0=fsperiodold0+'[c';
         
         while(fsopeningold.slice(-fsperiodold0.length)==fsperiodold0)
            fsopeningold=fsopeningold.slice(0,-fsperiodold0.length);
            
         //while(fsopeningtest.slice(-fsperiodold0.length)==fsperiodold0)
         //   fsopeningtest=fsopeningtest.slice(0,-fsperiodold0.length);
            
         //if(fsopeningold!=fsopeningtest)
         //   alert(st);
         
         let fsperiodold1='!'.repeat(ocd(fsperiodold0));
         let fsendingold='!'.repeat(ocd(fsopeningold));*/







         //if(!checkboosters(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending))
         //   alert(st+'\n'+convert(st)+'\nnew primer = '+fsopening+'\nnew period = '+fsperiod0+'\nfs new = '+fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending+'\n'+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));

         //if(!checkboosters(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold))
         //   alert(st+'\nold\n'+fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold);




         /*if(fsopening!=fsopening||fsperiodold0!=fsperiod0)
         //if(checkboosters(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending)&&checkboosters(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold)&&(fsopening!=fsopening||fsperiodold0!=fsperiod0))
            {
            //alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
            //alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsperiodold0+fsperiodold1+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
            //alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
            alert(st+'\n'+convert(st)+'\nold primer = '+fsopeningold+'\nnew primer = '+fsopening+'\nold period = '+fsperiodold0+'\nnew period = '+fsperiod0+'\nfs old = '+convert(fsopeningold+fsperiodold0+fsperiodold0+fsperiodold0+fsperiodold1+fsperiodold1+fsperiodold1+fsendingold)+'\nfs new = '+convert(fsopening+fsperiod0+fsperiod0+fsperiod0+fsperiod1+fsperiod1+fsperiod1+fsending));
            }*/






         cofcurrent = '[[!!';
         cofclass = 0;
         setfsarrays();

         //return fsopening+fsperiod0.repeat(nn)+fsperiod1.repeat(nn)+fsending;
         fsprimer0 = st0;
         fsending0 = '!'.repeat(ocd(fsprimer0))
         return getfselement(st, fsopening, fsperiod0, fsperiod1, fsending, nn, fsprimer0, fsending0);
      }





      function fsalt(st, n, nn = 0, overtest = false, overl = 0) {

         // optimization
         if (st == fscurrent)
            return st;

         // limit rule
         if (st == bo) {
            return st;
         }

         let i = st.length - 1;
         while (st[i] == '!')
            i--;
         let e = st[i] == '[';
         let st0 = st.slice(0, i);
         let st1 = st.slice(i + (e ? 2 : 1));
         let s1;

         // successor and plain rule
         if (e) {
            return st;
         }

         // main rule
         let stt = st0;
         let u = i - 1;

         while (st0[u] == '[')
            u--;
         u = i - u - 1;

         st0 += '[';

         st1 = st1.slice(u);
         let s;

         u++;
         let uo = '['.repeat(u);

         let cb = [st];
         //let nc=[1,1];
         while (cb.at(-1).length > 1) {
            cb.push(booster(cb.at(-1)));
         }

         let pn = cb.length - 1;
         let nl = nlevels;
         let lr = 'c';
         let lar = [pn];
         while (nl) {
            if (cb[pn] < lr) {
               lr = cb[pn];
               lar.push(pn);
               nl--;
            }
            else {
               pn--;

               // cof > ω
               if (pn < 0) {
                  return st;
               }

            }
         }



         let np;
         if (overtest) {
            // no overlap
            // cb: [[[Xc]]] → X[
            for (i = pn; i < cb.length; i++) {
               while (cb[i][0] == '[')
                  cb[i] = cb[i].slice(1);
               cb[i] = cb[i].slice(0, -cb.length + i) + '[';
            }

            // largest repeated cb
            np = cb.length - 1;
            for (i = cb.length - 2; i >= pn; i--)
               if (cb[i] > cb[np].repeat(Math.ceil(cb[i].length / cb[np].length)))
                  np = i;

            while (st0.length < overl)
               st0 += cb[np];

            return st0.slice(0, overl);
         }
         else {

            // overlap
            let prover = Array(cb.length);

            // cb: [[[Xc]]] → X[
            for (i = pn; i < cb.length; i++) {
               while (cb[i][0] == '[') {
                  cb[i] = cb[i].slice(1);
               }
               cb[i] = cb[i].slice(0, -cb.length + i) + '[';
               cb[i] = overperiod(cb[i]);
               prover[i] = overprimer(cb[i], st0);
            }

            np = cb.length - 1;
            for (i = cb.length - 2; i >= pn; i--)

               if (prover[i].length + cb[i].length > prover[np].length + cb[np].length) {
                  if (prover[i] + cb[i] > prover[np] + (cb[np].repeat(Math.ceil((prover[i].length - prover[np].length + cb[i].length) / cb[np].length))))
                     np = i;
               }
               else
                  if (prover[i] + (cb[i].repeat(Math.ceil((prover[np].length - prover[i].length + cb[np].length) / cb[i].length))) > prover[np] + cb[np])
                     np = i;

            st0 = prover[np];

            let overstring = st0;
            let overor = st0 + cb[np];
            i = -1;
            while (true) {
               i++;
               if (i >= overstring.length)
                  overstring += cb[np];
               if (overstring[i] == '[' && (!i || overstring[i - 1] == '[')) {
                  let overnsform = overstring.slice(0, i);
                  overnsform = overnsform + col + ('!'.repeat(ocd(overnsform)));
                  let efs = fsalt(overnsform, '', 0, true, overor.length);
                  if (efs == overor)
                     return overnsform;
               }
            }
         }
      }



      // is st ε number
      function isepsilon0(st) {
         return st == '' ? false : st == col || st == bo ? true : compare(st, booster(st)) < 1;
      }     // original
      //return st==''?false:st==col||st==bo?true:(base(st)==''||isepsilon(base(st)))&&compare(st,booster(st))<1;}  // for non-standard forms

      // largest ε number ≤ CNF st (if st < ε_0 then '')
      function floorepsilon(st) {
         if (!Array.isArray(st))
            return st;
         let t = st[st.length - 1][0];
         while (Array.isArray(t) && t != 0) {
            st = t;
            t = st[st.length - 1][0];
         }
         return t;
      }

      // is st Ω number
      function isOmega(st) {
         //return st==''?false:st==col||st==bo?true:compare(col,booster(st))<1;
         return st == '' || st == bo ? false : st == col ? true : st < col && compare(col, booster(st)) < 1;
      }


      // remove boosters of st < c
      function floorOmega(st, c = col) {
         //while(st!=''&&st!=col&&st!=c&&compare(c,booster(st))==1)
         while (st != '' && st != col && st != c && compare(c, booster(st)) == 1)
            //while(st!=''&&(compare(c,st)==1||compare(c,booster(st))==1))
            st = base(st);
         return st;
      }

      function sepsilon(st, e) {
         let s = st[st.length - 1];
         if (s[0] == e)
            if (s[1] == 1)
               st.pop();
            else
               s[1]--;
         return st.length ? st : '';
      }

      function braintail(st, e) {
         let bra, i = 0, s = [];
         while (floorepsilon([st[i]]) != e)
            i++;
         let u = i;
         while (i < st.length) {
            s.push([st[i][0] == e ? '' : sepsilon(st[i][0], e), st[i][1]]);
            i++;
         }
         let tail = st.slice(0, u);
         if (!tail.length)
            tail = '';
         else if (tail.length == 1 && tail[0][1] == 1 && tail[0][0] != '' && !Array.isArray(tail[0][0]))
            tail = tail[0][0];
         return [s, tail];
      }

      // ω ^ CNF st
      function omegapower(st) {
         if (st != '' && !Array.isArray(st))
            return st;
         return [[st, 1]];
      }

      // compare CNFs st1, st2 (if st1<st2 then -1; if st1==st2 then 0; if st1>st2 then 1)
      function comparecnf(st1, st2) {
         if (st1.toString() == st2.toString())
            return 0;
         if (st1 == '')
            return -1;
         if (st2 == '')
            return 1;
         let b1 = !Array.isArray(st1);
         let b2 = !Array.isArray(st2);
         if (b1 && b2)
            return compare(st1, st2);
         let c;
         if (b1) {
            c = compare(st1, floorepsilon(st2));
            return c == 0 ? -1 : c;
         }
         if (b2) {
            c = compare(floorepsilon(st1), st2);
            return c == 0 ? 1 : c;
         }
         /*b1=st1[0].length==2;            // to compare CNF and extended CNF
         b2=st2[0].length==2;
         if(b1^b2){
            if(b1)
               st1=cnf(st1,true);
            else
               st2=cnf(st2,true);
            }*/
         let i1 = st1.length - 1;
         let i2 = st2.length - 1;
         do {
            //if(b1&&b2){                  // to compare CNF and extended CNF
            if (st1[0].length == 2 && st2[0].length == 2) {
               c = comparecnf(st1[i1][0], st2[i2][0]);
               if (c != 0)
                  return c;
               c = st1[i1][1] > st2[i2][1] ? 1 : st1[i1][1] < st2[i2][1] ? -1 : 0;
            }
            else {
               c = compare(st1[i1][0], st2[i2][0]);
               if (c != 0)
                  return c;
               c = comparecnf(st1[i1][1], st2[i2][1]);
               if (c != 0)
                  return c;
               c = comparecnf(st1[i1][2], st2[i2][2]);
            }
            if (c != 0)
               return c;
            i1--;
            i2--;
         }
         while (i1 >= 0 && i2 >= 0);
         //if(i1<0&&i2<0)                // to compare CNF and extended CNF
         //   return 0;
         if (i1 < 0)
            return -1;
         return 1;
      }

      // CNF st1 + CNF st2 
      function sumcnf(st1, st2) {
         if (st1 == '')
            return st2;
         if (st2 == '')
            return st1;
         if (!Array.isArray(st1)) {
            let z1 = st1;
            st1 = [[st1, 1]];
         }
         if (!Array.isArray(st2)) {
            let z2 = st2;
            st2 = [[st2, 1]];
         }
         let b1 = st1[0].length == 2;
         let b2 = st2[0].length == 2;
         if (b1 ^ b2) {
            if (b1)
               st1 = [[z1 === undefined ? floorepsilon(st1) : z1, '', st1]];
            else
               st2 = [[z2 === undefined ? floorepsilon(st2) : z2, '', st2]];
         }
         let s = st2.slice(-1);
         let i = 0;
         if (b1 && b2) {
            let c = comparecnf(s[0][0], st1[i][0]);
            while (c > 0) {
               i++;
               if (i < st1.length)
                  c = comparecnf(s[0][0], st1[i][0]);
               else
                  break;
            }
            if (i == st1.length)
               return st2;
            if (c == 0) {
               st1[i][1] += s[0][1];
               st2.pop();
            }
         }
         else {
            let c0 = compare(s[0][0], st1[i][0]);
            let c1 = comparecnf(s[0][1], st1[i][1]);
            while (c0 > 0 || (c0 == 0 && c1 > 0)) {
               i++;
               if (i < st1.length) {
                  c0 = compare(s[0][0], st1[i][0]);
                  c1 = comparecnf(s[0][1], st1[i][1]);
               }
               else
                  break;
            }
            if (i == st1.length)
               return st2;
            if (c0 == 0 && c1 == 0) {
               st1[i][2] = sumcnf(st1[i][2], s[0][2]);
               st2.pop();
            }
         }
         return st2.concat(st1.slice(i));
      }

      // get CNF of st
      function cnf(st, ext = false, b = true) {
         if (!Array.isArray(st) && (st == '' || isepsilon0(st)))
            return st;
         let c = [];
         if (ext) {
            if (!Array.isArray(st))
               st = cnf(st);
            if (floorepsilon(st) == '')
               return st;
            let s, t, i = -1, e, brain, m, y = -1, h;
            for (s of st) {
               h = false;
               e = floorepsilon([s]);
               if (e == '') {
                  brain = '';
                  m = s;
               }
               else if (s[0] == e) {
                  brain = '';
                  m = ['', s[1]];
               }
               else {
                  [brain, t] = braintail(s[0], e);
                  if (brain.length == 1 && !brain[0][0].length && brain[0][1] == 1)
                     brain = '';
                  m = [t, s[1]];
                  h = t != '' && s[1] == 1 && !Array.isArray(t);
               }
               if (i < 0 || c[i][0] != e || c[i][1].toString() != brain.toString()) {
                  c.push([e, brain, h ? t : [m]]);
                  i++;
               }
               else {
                  if (!Array.isArray(c[i][2]))
                     c[i][2] = [[c[i][2], 1]];
                  c[i][2].push(m);
               }
            }

            if (b)
               for (s of c) {
                  s[1] = cnf(s[1], true);
                  s[2] = cnf(s[2], true);
               }
         }
         else {
            let s, t, i = -1;
            while (st) {
               [s, st] = isepsilon0(st) ? [st, ''] : [booster(st), base(st)];
               if (c.length == 0 || compare(t, s) < 1) {
                  if (i < 0 || c[i][0] != s) {
                     c.push([s, 1]);
                     i++;
                  }
                  else
                     c[i][1]++;
                  t = s;
               }
            }
            for (s of c)
               s[0] = cnf(s[0]);
         }
         return c;
      }

      function unone(st) {
         return st == '1' ? '' : st;
      }

      function displayform(st, ext = false) {
         if (st == '')
            return 0;
         if (!Array.isArray(st))
            //return convertepsilon0(st,ext);
            return convertepsilon(st);
         if (ext) {
            if (st[0].length == 2)
               return displayform(st);
            let i = st.length - 1;
            let s = '';
            let e, ex, m;
            while (i >= 0) {
               s += ' + ';
               e = st[i][0];
               if (e == '')
                  s += displayform(st[i][2]);
               else {
                  //s+=convertepsilon0(e,true);
                  s += convertepsilon(e);
                  ex = st[i][1];
                  m = displayform(st[i][2], true);
                  if (Array.isArray(st[i][2]) && st[i][2].length > 1)
                     m = '<span style="color: #666666; font-weight: bold;">(</span>' + m + '<span style="color: #666666; font-weight: bold;">)</span>';
                  else
                     m = unone(m);
                  if (ex != '')
                     s += '<sup>' + displayform(ex, true) + '</sup>';
                  else if (m && (s[s.length - 1] == '!' || m[0] == '['))
                     //else if(m)
                     s += '·';
                  s += m;
               }
               i--;
            }
            return s.slice(3);
         }
         else {
            let i = st.length - 1;
            let s = '';
            let ex;
            while (i >= 0) {
               s += ' + ';
               ex = st[i][0];
               if (Array.isArray(ex)) {
                  s += '<span style="color: #ff0000; font-weight: bold;">ω</span>';
                  if (ex.length != 1 || ex[0][0] != 0 || ex[0][1] != 1)
                     s += '<sup>' + displayform(ex) + '</sup>';
                  s += unone(st[i][1]);
               }
               else if (ex == '')
                  s += st[i][1];
               else {
                  //s+=convertepsilon0(ex);
                  s += convertepsilon(ex);
                  if (st[i][1] != '1') {
                     if (s[s.length - 1] == '!')
                        s += '·';
                     s += st[i][1];
                  }
               }
               i--;
            }
            return s.slice(3);
         }
      }

      function getle(cf, x, ex, b) {
         let le = '';
         if (b) {
            let u = 0;
            while (comparecnf(cf, [ex[u]]) > 0)
               u++;
            if (u > 0)
               le = ex.slice(0, u);
         }
         if (le.length == 1 && le[0][1] == 1 && le[0][0] != '' && !Array.isArray(le[0][0]))
            return le[0][0];
         else
            return omegapower(le);
         return le;
      }

      function cnftoarray(eex, ext, f, le = '-') {

         // Klammersymbolen

         //if(ext)
         //   eex=cnf(JSON.parse(JSON.stringify(ex)),true);

         let s = '';
         let i, j, p, pp, m;

         if (Array.isArray(eex)) {
            /*for(i=0;i<eex.length;i++)
               if(!Array.isArray(eex[i][0]))
                  eex[i][0]=cnf(eex[i][0],true,false);*/
            i = eex.length - 1;

            //while(eex[i][0]!=f)i--;
            //while(i>=0&&(!Array.isArray(eex[i][0])||eex[i][0]!=f))i--;
            while (i >= 0 && (eex[i][0] != f)) i--;
            if (i >= 0) {
               p = eex[i][1];
               if (!p) p = [["", 1]]
               //else if(ext)p=cnf(p,true);
               //p=p?p[0][1]:1;
               m = eex[i][2];
               j = i;
               while (j >= 0 && (eex[j][0] == f)) j--;
            }
            else
               j = eex.length - 1;

         }

         if (le == '-')
            le = displayform(eex.slice(0, j + 1), ext);

         if (i >= 0) {
            while (i >= 0 && eex[i][0] == f) {
               s += ', ';
               if (ext)
                  m = cnf(m, true);
               //m=sepatosepsum(soptosepa(stringtosop(m)));
               s += displayform(m, ext);

               pp = [...p];

               i--;
               if (i >= 0) {
                  p = eex[i][1];
                  m = eex[i][2];
                  if (!p) p = [["", 1]]
                  //else if(ext)p=cnf(p,true);
               }

               if (!pp[0][0]) {
                  let q = pp[0][1];
                  if (i >= 0 && eex[i][0] == f)
                     if (!p[0][0] && JSON.stringify(pp.slice(1)) == JSON.stringify(p.slice(1))) {
                        q -= p[0][1];
                        s += ', 0'.repeat(q - 1);
                     }
                     else if (p[0][0] && JSON.stringify(pp.slice(1)) == JSON.stringify(p))
                        s += ', 0'.repeat(q - 1);
                     else
                        s += ', 0'.repeat(q) + ' @<sup>' + cnftoarray(JSON.parse(JSON.stringify(cnf(pp.slice(1), true, false))), ext, f) + '</sup>';
                  //s+=', 0'.repeat(q)+' @<sup>'+cnftoarray(JSON.parse(JSON.stringify(sepatosepsum(soptosepa(stringtosop(pp.slice(1)))))),ext,f)+'</sup>';
                  else {
                     if (pp.length > 1)
                        s += ', 0'.repeat(q) + ' @<sup>' + cnftoarray(JSON.parse(JSON.stringify(cnf(pp.slice(1), true, false))), ext, f) + '</sup>';
                     //s+=', 0'.repeat(q)+' @<sup>'+cnftoarray(JSON.parse(JSON.stringify(sepatosepsum(soptosepa(stringtosop(pp.slice(1)))))),ext,f)+'</sup>';
                     else
                        s += ', 0'.repeat(q - 1);

                  }
               }
               else {
                  s += ' @<sup>' + cnftoarray(JSON.parse(JSON.stringify(cnf(pp, true, false))), ext, f) + '</sup>';
                  //s+=' @<sup>'+cnftoarray(JSON.parse(JSON.stringify(sepatosepsum(soptosepa(stringtosop(pp))))),ext,f)+'</sup>';
               }
            }
            if (le != '-')
               if ((pp[0][0] || pp.length > 1) && le == '0')
                  le = '';
               else le = ', ' + le;
            s = s.slice(2);
         }

         if (le == '-')
            le = '';

         return s + le;
      }

      function mtoc(st, n = 0) {
         let m = '[c[c[c!!!';
         if (st == col || !st || (n <= 0 && st < m))
            return st;
         if (st == m)
            return col;
         return bb(mtoc(base(st), n), mtoc(booster(st), n - 1));
      }

      function finremc(st) {
         if (st.length < 2)
            return st;
         let x1 = st;
         let x2 = '';
         let y1 = booster(x1);
         while (y1 < col) {
            x2 = bb('', y1) + x2;
            x1 = base(x1);
            y1 = x1 == col ? 'c[c!' : booster(x1);
         }
         if (booster(x1) == col) {
            let x5 = x1;
            while (booster(x5) == col)
               x5 = base(x5);
            x5 = booster(x5);
            x5 = x5 ? booster(x5) : col;
            while (x5 >= '[c[c[c!!!' && x5 < col)
               x5 = x5 ? booster(x5) : col;
            if (x5 >= 'c[c[c!!')
               return base(x1) + x2;
         }
         return st;
      }

      function checkpolynomial(beta, x, f) {
         if (x < f)
            return compare(x, beta);
         let r = stringslice(x, '', f);
         let c, ex;
         if (r) {
            c = compare(r, beta);
            if (c > 0)
               return 1;
            ex = stringtosepsum(stringslice(x, f));
         }
         else {
            ex = stringtosepsum(stringslice(x, f));
            c = compare(ex[0][2], beta);
            if (c > 0)
               return 1;
            if (c == 0) {
               if (checkpolynomial(beta, ex[0][1], f) >= 0)
                  return 1;
            }
            else if (ex[0][2] == '[!') {
               c = checkpolynomial(beta, ex[0][1], f);
               if (c > 0)
                  return 1;
            }
            else if (checkpolynomial(beta, ex[0][1], f) >= 0)
               return 1;
         }
         for (let e = r ? 0 : 1; e < ex.length; e++)
            if (checkpolynomial(beta, ex[e][1], f) >= 0 || checkpolynomial(beta, ex[e][2], f) >= 0)
               return 1;
         return c;
      }

      function convertepsilon0(st, ext = false) {
         if (!nlevels && st == col)
            return 'ε<sub>0</sub>';

         if (nlevels == 1 && st == col)
            return sugar[33] ? convertsubscript(sugar[33] ? 'ℵ' : '<span style="color: #ff0000; font-weight: bold;">ω</span>', convertone()) : '<span style="color: #001aff; font-weight: bold;">Ω</span>';

         if (st == col || st == bo)
            return st;

         //if(st=='[c[c[c[c!!!!')
         //   return 'K';  

         /*if(spn)
            {
            if(st=='[[c![[c![[c![!!!!')
               return 'SVO';
            else if(st=='[[c![[c![[c![[c!!!!!')
               return 'LVO';
            else if(st=='[[c![c!!')
               return 'BHO';
            else if(st=='[[c[!!!')
               return 'BO';
            else if(st=='[[c[!![c!!')
               return 'TFB';
            else if(st=='[[c[c!!!')
               return 'EBO';
            else if(st=='[[c[c!![c!!')
               return 'SRO';
            else if(st=='[[c[c[c!!![c!!')
               return 'RO';
            //else if(st=='[c[c[c[c!!!!')
            //   return 'k';
            }*/

         /*if(st=='[[[[c!c!!c!')   
            return 'I';
         if(st=='[c[c[c!!!')   
            return 'M';*/
         let x = booster(st);
         let beta = base(st);

         let sy = '';
         let f = floorOmega(x);
         //let j,maxx,ff;
         let j, maxx;
         //let exa;

         let f1 = card(x);
         let f2 = ecard(beta);
         //f2=nexteps(ecard(beta),1);
         //let l=nexteps(f2,2);

         //if(f1==f2)
         if (f1 == nexteps(f2, 1)) {
            sy = 'φ';
            f = f1;
            j = f;
            maxx = nexteps(f);
         }
         //else if(f1==l)
         /*else if(floorOmega(x,l)==l)
            {
            sy='Φ';
            f=bb(l,l);
            f=bb(beta,f);
            j=bb(l,f);
            j=bb(beta,j);
            maxx=bb(l,nexteps(f));
            }*/
         else if (f == col) {
            sy = 'Φ';
            //ff=bb(col,col);
            //f=bb(floorOmega(beta,ff),ff);
            f = bb(col, col);
            f = bb(floorOmega(beta, f), f);
            j = bb(col, f);
            j = bb(floorOmega(beta, j), j);
            //maxx=bb(col,bb(f,bb(f,bb(f,''))));
            //maxx=bb(col,bb(f,bb(f,'')));
            //maxx=bb(col,bb(f,bb(f,f)));
            //maxx=bb(col,bb(f,col));
            maxx = bb(col, bb(f, bb(f, col)));
            //ff=fs(ff,f);
         }
         else if (f == bb(col, col)) {
            sy = 'I-Φ';
            f = bb(f, col);
            f = bb(floorOmega(beta, f), f);
            j = bb(bb(col, col), f);
            j = bb(floorOmega(beta, j), j);
            //maxx=bb(bb(col,col),bb(f,bb(f,'')));
            //maxx=bb(bb(col,col),bb(f,bb(f,f)));
            //maxx=bb(bb(col,col),bb(f,col));
            maxx = bb(bb(col, col), bb(f, bb(f, col)));
         }
         /*else if(f==bb(col,col)){
            sy='L';
            j=bb(col,col);
            j=bb(j,col);
            j=bb(floorOmega(beta,j),j);
            j=bb(col,j);
            j=bb(floorOmega(beta,j),j);  
            }
         else if(f==bb(col,bb(col,col))){
            sy='R';
            j=bb(col,col);
            j=bb(j,col);
            j=bb(j,col);
            j=bb(floorOmega(beta,j),j);
            j=bb(col,j);
            j=bb(floorOmega(beta,j),j); 
            }*/
         /*else if(f==bb(floorOmega(beta),col)){
            sy='φ';
            j=f;
            //maxx=bb(f,bb(f,bb(f,'')));
            //maxx=bb(f,bb(f,bb(f,f)));
            maxx=bb(f,bb(f,col));
            //ff=f;
            }*/
         /*else if(x>col){
            sy='I';
            f=col;
            j=f;
            maxx='d';
            }*/
         else if (x >= 'c[c[c!!' && st < '[c[c[c!![[c[c[c!![c!!!!') {
            sy = 'M';
            //f='[c[c[c!!!';
            f = col;
            j = f;
            maxx = 'd';
         }
         else if (x >= 'c[c[c[c!!!' && st < '[c[c[c[c!!![[c[c[c[c!!![c!!!!') {
            sy = 'K';
            //f='[c[c[c!!!';
            f = col;
            j = f;
            maxx = 'd';
         }
         //else if(x>col&&x<'c[c[[c[c[c!!![[c[c[c!!![c!!!!')
         else if (x > col && x < 'c[c[[c[c[c!!![[c[c[c!!![c!!!!' && x < bb(f, bb(floorOmega(beta, bb(f, col)), bb(f, col)))) {

            //if(x>=bb(f,bb(floorOmega(beta,bb(f,col)),bb(f,col))))
            //   alert('['+convert(x)+']');

            let beta1 = beta;
            while (beta1 && booster(beta1) < 'c[c[c!!')
               beta1 = base(beta1);
            beta1 = bb(beta1, 'c[c[c!!');
            if (x < bb(col, bb(col, bb(beta1, bb(beta1, col))))) {
               let x1 = x;
               let x2 = '';
               let y1 = booster(x1);
               //while(y1<'c[[c[c[c!!!!')
               while (y1 < col) {
                  x2 = bb('', y1) + x2;
                  x1 = base(x1);
                  y1 = x1 == col ? 'c[c!' : booster(x1);
               }
               //if(x<'c[c[[c[c[c!!!!!'||x2>='[c!')
               let x4 = booster(x1);
               x4 = x4 ? booster(x4) : col;
               //while(x4&&x4<col)
               while (x4 >= '[c[c[c!!!' && x4 < col)
                  //while(x4>=beta1&&x4<col)                                                                                // *
                  //while(x4>='[c[c[c!!!'&&x4<col&&st!='[c[c[c!!![c[c[[c[c[c!!!!!!')
                  //while(x4>=(st=='[c[c[c!!![c[c[[c[c[c!!!!!!'?'[c[c[c!!![c[c[c!!!':'[c[c[c!!!')&&x4<col)
                  x4 = x4 ? booster(x4) : col;
               //if(x5>='[c[c[c!!!')

               //if(x<'c[c[[c[c[c!!!!!'||x2>='[c!'||(x>='c[c[[c[c[c!!!!!'&&x4<'[c[c[c!!!'))
               //if(x<'c[c[[c[c[c!!!!!'||x2>='[c!'||x4<'[c[c[c!!!')
               //if(x4<'[c[c[c!!!')
               if (x4 < 'c[c[c!!')
               //if(x4<'c[c[c!!'||st=='[c[c[c!!![c[c[[c[c[c!!!!!!')                                                     // *
               {
                  /*let x3=x;
                  while(booster(x3)<col)
                     x3=base(x3);
                  x3=bb(x3,col);*/
                  let x3 = bb(x1, col);
                  x3 = bb(beta, x3);
                  if (x2 < x3) {
                     //if(x1>col&&x2.length>2&&x2.slice(0,3)=='[c!')
                     //   x2=x2.slice(3);
                     /*if(booster(x1)==col)
                        {
                        let x5=x1;
                        while(booster(x5)==col)
                           x5=base(x5);
                        x5=booster(x5);
                        x5=x5?booster(x5):col;
                        if(x5>='[c[c[c!!!')
                           x1=base(x1);
                        //x1=base(x1);
                        }*/

                     if (x >= 'c[c[[c[c[c!!!!!')
                     //if(x>=bb(col,bb(col,beta1)))                                                                // *
                     //if(x>='c[c[[c[c[c!!!!!'&&st!='[c[c[c!!![c[c[[c[c[c!!!!!!')
                     {
                        x1 = finremc(x1);
                        while (x1 > col) {
                           x2 = bb('', mtoc(booster(x1))) + x2;
                           x1 = base(x1);
                        }
                        let x5 = '';
                        while (beta.length > 1) {
                           x5 = bb('', finremc(booster(beta))) + x5;
                           beta = base(beta);
                        }
                        beta += x5;
                        beta = mtoc(beta, 2);
                        x = col + x2;
                     }

                     sy = 'I';
                     f = col;
                     j = f;
                     maxx = 'd';
                  }
               }
            }
         }
         else if (f == bb(bb(col, col), col)) {
            sy = 'I(1, •)-Φ';
            let ff = f;
            f = bb(f, col);
            f = bb(floorOmega(beta, f), f);
            j = bb(ff, f);
            j = bb(floorOmega(beta, j), j);
            maxx = bb(ff, bb(f, bb(f, col)));
         }
         else if (f == bb(bb(bb(col, col), col), col)) {
            sy = 'I(2, •)-Φ';
            let ff = f;
            f = bb(f, col);
            f = bb(floorOmega(beta, f), f);
            j = bb(ff, f);
            j = bb(floorOmega(beta, j), j);
            maxx = bb(ff, bb(f, bb(f, col)));
         }
         else if (booster(f) == col) {
            sy = 'I(x, •)-Φ';
            let ff = f;
            f = bb(f, col);
            f = bb(floorOmega(beta, f), f);
            j = bb(ff, f);
            j = bb(floorOmega(beta, j), j);
            maxx = bb(ff, bb(f, bb(f, col)));
         }
         /*else if(compare(bb(col,col),x)<1){
         //else if(beta==''&&compare(bb(col,col),x)<1){
            sy='I';
            f=col;
            j=f;
            maxx=bb(f,bb(f,bb(f,'')));
            }*/
         //if(sy!=''&&compare(bb(f,bb(f,bb(f,''))),x)>0&&(sy!='Ω'||compare(bb(col,j),x)==1)){
         //if(sy!=''&&compare(bb(f,bb(f,bb(f,''))),x)>0){
         if (sy != '' && compare(maxx, x) > 0) {
            //{
            let cf = cnf(f);
            let fx = floorOmega(x, f);
            let ex = cnf(x);
            let eex = cnf(JSON.parse(JSON.stringify(x)), true, false);
            //let eex=sy=='I'?exa:cnf(JSON.parse(JSON.stringify(x)),true,false);
            //let eex=cnf(JSON.parse(JSON.stringify(ex)),true,false);
            //let eex=cnf(JSON.parse(JSON.stringify(ex)),true);
            //let eex=cnf(ex,true,false);
            let le = getle(cf, x, ex, x != f && eex[0][0] != f);
            while (beta) {
               let x1 = booster(beta);
               let fx1 = floorOmega(x1, j);
               if (fx1 == fx) {
                  let ex1 = cnf(x1);
                  //le=sumcnf(getle(cf,x1,ex1,x1!=j&&cnf(ex1,true,false)[0][0]!=j),le);
                  le = sumcnf(getle(cf, x1, ex1, x1 != j && cnf(JSON.parse(JSON.stringify(x1)), true, false)[0][0] != j), le);
                  //le=sumcnf(getle(cf,x1,ex1,x1!=j&&cnf(JSON.parse(JSON.stringify(ex1)),true,false)[0][0]!=j),le);
                  //le=sumcnf(getle(cf,x1,ex1,x1!=j&&cnf(JSON.parse(JSON.stringify(ex1)),true)[0][0]!=j),le);
                  beta = base(beta);
               }
               else {
                  //if(fx==ff)
                  //if(comparecnf(fx,ff)<1)
                  if (!Array.isArray(eex))
                     le = sumcnf(beta, le);
                  else {
                     let u = eex.length - 1;
                     //while(u>=0&&eex[u][0]==f)
                     //alert(st);
                     //if((u>=0&&compare(f,eex[u][0])<1)!=(u>=0&&comparecnf(f,eex[u][0])<1))
                     //   alert(st);
                     //while(u>=0&&compare(f,eex[u][0])<1)


                     /*
                     while(u>=0&&comparecnf(f,eex[u][0])<1)
                        u--;
                     u++;
                     let ca=comparecnf(eex[u][2],cnf(beta));
                     if(ca<1&&eex.length>1)
                        while(u<eex.length-1&&comparecnf(f,eex[u][0])<1)
                           {
                           u++;
                           if(comparecnf(cnf(beta),eex[u][2])<1)
                              {
                              ca=1;
                              break;
                              }
                           }
                     */

                     //let iex=cnf(fx,true);

                     let ca = checkpolynomial(beta, fx, f);

                     le = sumcnf(ca == 1 ? '' : ca == 0 ? [['', 1]] : beta, le);
                     //if(ca>0)
                     //alert(st+'\n'+beta);
                     //window.prompt(beta, st);
                  }
                  break;
               }
            }
            //if(sy!='φ'&&(sy!='Φ'||(sugar[34]&&fx==col))&&(sy!='I-Φ'||fx==bb(col,col))&&sy!='I'&&le.length==1&&le[0][1]==1&&le[0][0]=='')
            if (sy != 'φ' && (sy != 'Φ' || (sugar[34] && fx == col)) && (sy != 'I-Φ' || fx == bb(col, col)) && (sy != 'I(1, •)-Φ' || fx == bb(bb(col, col), col)) && (sy != 'I(2, •)-Φ' || fx == bb(bb(bb(col, col), col), col)) && (sy != 'I(x, •)-Φ' || booster(fx) == col) && sy != 'I' && le.length == 1 && le[0][1] == 1 && le[0][0] == '')
               //if(sy!='φ'&&(sy!='Φ'||fx==l)&&(sy!='I-Φ'||fx==bb(l,l))&&sy!='I'&&le.length==1&&le[0][1]==1&&le[0][0]=='')
               le = '';
            else {
               if (ext)
                  le = cnf(le, true);
               le = displayform(le, ext);
               //if((sy=='φ'||(sy=='Φ'&&fx!=col)||(sy=='I-Φ'&&fx!=bb(col,col))||sy=='I')&&isFinite(le))
               if ((sy == 'φ' || (sy == 'Φ' && fx != col) || (sy == 'I-Φ' && fx != bb(col, col)) || (sy == 'I(1, •)-Φ' && fx != bb(bb(col, col), col)) || (sy == 'I(2, •)-Φ' && fx != bb(bb(bb(col, col), col), col)) || (sy == 'I(x, •)-Φ' && booster(fx) != col) || sy == 'I') && isFinite(le))
                  le--;
            }
            if (sy == 'φ') {
               if (fx == f)
                  return 'ε<sub>' + le + '</sub>';
               if (fx == bb(f, f))
                  return 'ζ<sub>' + le + '</sub>';
               if (fx == bb(bb(f, f), f))
                  return 'η<sub>' + le + '</sub>';
               if (fx == bb(f, bb(f, f)))
                  return 'Γ<sub>' + le + '</sub>';
            }
            if (sy == 'Φ' && fx == col)
               //return (sugar[33]?'ℵ':'Ω')+(le==''?'':'<sub>'+le+'</sub>');
               return le == '' ? (sugar[34] ? '<span style="color: #001aff; font-weight: bold;">Ω</span>' : '<span style="color: #001aff; font-weight: bold;">ℵ</span>') : convertsubscript(sugar[34] ? '<span style="color: #001aff; font-weight: bold;">Ω</span>' : sugar[33] ? '<span style="color: #001aff; font-weight: bold;">ℵ</span>' : '<span style="color: #ff0000; font-weight: bold;">ω</span>', le);
            if (sy == 'I-Φ' && fx == bb(col, col))
               //return 'I'+(le==''?'':'<sub>'+le+'</sub>');
               return le == '' ? '<span style="color: #8d8d8d; font-weight: bold;">I</span>' : convertsubscript('<span style="color: #8d8d8d; font-weight: bold;">I</span>', le);
            //if(sy!='φ'&&sy!='Φ'&&sy!='I-Φ')
            //   return sy+(le==''?'':'<sub>'+le+'</sub>');
            //if(sy=='M'&&fx=='c[c[c!!')
            if (sy == 'M')
               //return 'M'+(le==''?'':'<sub>'+le+'</sub>');
               return le == '' ? '<span style="color: #8d8d8d; font-weight: bold;">M</span>' : convertsubscript('<span style="color: #8d8d8d; font-weight: bold;">M</span>', le);
            if (sy == 'K')
               return le == '' ? '<span style="color: #8d8d8d; font-weight: bold;">K</span>' : convertsubscript('<span style="color: #8d8d8d; font-weight: bold;">K</span>', le);

            // old version (without @)	
            /*	   
            if(Array.isArray(eex)){
               i=eex.length-1;
               while(eex[i][0]!=f)i--;
               p=eex[i][1];
               p=p?p[0][1]:1;
               m=eex[i][2];
               }
            else{
               i=0;
               p=1;
               m=[["",1]];
               }
            let q=p;
            while(q>0){
               s+=', ';
               if(q==p){
                  i--;
                  if(ext)
                     m=cnf(m,true);
                  s+=displayform(m,ext);
                  if(i>=0){
                     p=eex[i][1];
                     m=eex[i][2];
                     p=eex[i][0]!=f?0:p==''?1:p[0][1];}
                  }
               else
                  s+=0;
               q--;
               }
               */

            if (sy == 'I') {
               let lene = eex.length - 1;
               if (!eex[lene][1]) {
                  let lenee = eex[lene][2].length - 1;
                  if (!eex[lene][2][lenee][0])
                     //eex[lene][2][lenee][1]--;
                     eex[lene][2][lenee][1] -= 2;
               }
            }

            let s = cnftoarray(eex, ext, f, le);

            //return sy+'('+s.slice(2)+', '+le+')';   
            //return sy+'('+s.slice(2)+le+')';
            return sy + '<span style="color: #666666; font-weight: bold;">(</span>' + s + '<span style="color: #666666; font-weight: bold;">)</span>';
         }
         return bb(beta == '' ? '' : (displayform(cnf(beta, ext), ext)), displayform(cnf(x, ext), ext));
      }

      function convert_old(st) {
         return (format > 1 ? st : displayform(cnf(st, format), format)).toString().replaceAll('!', ']');
      }
      //return (format>1?st:JSON.stringify(cnf(st,format))).toString().replaceAll('!',']').replaceAll('"','');}

      //function convert(st,b=true){
      function convert0(st, b = sugar[4]) {
         //if(b||!st||st==col||st==bo)
         if (!b || !st || st == col || st == bo) {
            if (format < 2 && (st == '[[c![[c![[c![!!!!' || st == '[[c![[c![[c![[c!!!!!' || st == '[[c![c!!' || st == '[[c[!!!' || st == '[[c[!![c!!' || st == '[[c[c!!!' || st == '[[c[c!![c!!' || st == '[[c[c[c!!![c!!'))
               spn = false;
            let s = (format > 1 ? st : displayform(cnf(st, format), format)).toString().replaceAll('!', ']');
            //if(format<2)
            if (!sugar[4] && format < 2) {
               if (st == '[[c!!')
                  s += ' <small>(Small Cantor ordinal)</small>';
               else if (st == '[[c![[c!!!')
                  s += ' <small>(Cantor ordinal)</small>';
               else if (st == '[[c![[c!![[c!!!')
                  s += ' <small>(Large Cantor ordinal)</small>';
               else if (st == '[[c![[c![[c!!!!')
                  s += ' <small>(Feferman–Schütte ordinal)</small>';
               else if (st == '[[c![[c![[c!![[c!!!!')
                  s += ' <small>(Ackermann ordinal)</small>';
               else if (st == '[[c![[c![[c![!!!!')
                  s += ' <small>(Small Veblen ordinal, SVO)</small>';
               else if (st == '[[c![[c![[c![[c!!!!!')
                  s += ' <small>(Large Veblen ordinal, LVO)</small>';
               else if (st == '[[c![[c![[c![[c!!!![[c![[c![[c!!!!!')
                  s += ' <small>(Second Large Veblen ordinal, SLVO)</small>';
               else if (st == '[[c![c!!')
                  s += ' <small>(Bachmann-Howard ordinal, BHO)</small>';
               else if (st == '[[c[!!!')
                  s += ' <small>(Buchholz ordinal, BO)</small>';
               else if (st == '[[c[!![c!!')
                  s += ' <small>(Takeuti-Feferman-Buchholz ordinal, TFB)</small>';
               else if (st == '[[c[c!!!')
                  s += ' <small>(Extended Buchholz ordinal, EBO)</small>';
               else if (st == '[[c[c!![c!!')
                  s += ' <small>(Small Rathjen ordinal, SRO)</small>';
               else if (st == '[[c[c[c!!![c!!')
                  s += ' <small>(Rathjen ordinal, RO)</small>';
            }
            spn = true;
            return s;
         }
         else {
            let beta = base(st);
            //return (beta?convert(beta):'')+'['+convert(booster(st),true)+']';
            return (beta ? convert0(beta, b) : '') + '[' + convert0(booster(st), b - 1) + ']';
         }
      }
      //return (format>1?st:JSON.stringify(cnf(st,format))).toString().replaceAll('!',']').replaceAll('"','');}

      // part of string to standard form
      function tostandard(st) {
         if (st >= col || st < leastepsilonbb)
            return st;
         let a = antibooster(st);
         let e = flooreps(a);
         return e + (a > e ? st : antibase(st));
      }

      // slice of string with p ≥ p1 and < p2
      function stringslice(st, p1, p2 = 'd') {
         let sop = stringtosop(st);
         let e = 0;
         while (sop[e] < p1 && e < sop.length)
            e++;
         let i = sop.length - 1;
         if (p2 != 'd')
            while (sop[i] >= p2 && i >= e)
               i--;
         return soptostring(sop.slice(e, i + 1));
      }

      function stringtosepsum(st) {
         return sepatosepsum(soptosepa(stringtosop(st)));
      }

      function convertat(p) {
         return sugar[31] ? convertpower('<span style="color: #8d008d; font-weight: bold;">@</span>', sugar[19] ? p : arraytoposition(p), false) : '<span style="color: #8d008d; font-weight: bold;">@</span> ' + arraytoposition(p);
      }

      function convertarray(p, neo) {
         if (!p)
            return convertzero();
         let r = stringslice(p, '', neo);
         let ar = r ? [['', r]] : [];
         let sepsum = stringtosepsum(stringslice(p, neo));
         for (let e = 0; e < sepsum.length; e++)
            ar.push(sepsum[e].slice(1));
         let s = '';

         if (sugar[29]) {
            let e = ar.length;
            while (e) {
               e--;
               s += convertsubstring(ar[e][1], -1, -1);
               let c = ar[e][0];
               let nc = e ? ar[e - 1][0] : '-';
               while (c.length > 1 && c.slice(-2) == '[!') {
                  c = c.slice(0, -2);
                  if (c == nc) {
                     s += ', ' + convertsubstring(ar[e - 1][1], -1, -1);
                     e--;
                     nc = e ? ar[e - 1][0] : '-';
                  }
                  else {
                     s += ', ' + convertzero();
                  }
               }
               if (c || sugar[41])
                  s += ' ' + convertat(convertarray(c, neo)) + ', ';
               else
                  s += ', ';
            }
         }
         else {
            for (let e = ar.length - 1; e > 0; e--)
               s += convertsubstring(ar[e][1], -1, -1) + ' ' + convertat(convertarray(ar[e][0], neo)) + ', ';
            s += convertsubstring(ar[0][1], -1, -1) + (ar[0][0] || sugar[41] ? ' ' + convertat(convertarray(ar[0][0], neo)) : '') + ', ';
         }

         s = s.slice(0, -2);
         return s;
      }

      function convertveblen(st) {
         if (!sugar[24] && !sugar[25] && !sugar[26] && !sugar[27] && !sugar[28])
            return '';
         let neo = nexteps(st, 1);
         let x = booster(st);
         if (x < neo) {
            if (!sugar[28] || (!sugar[30] && sugar[41]))
               return '';
            return displayphi(convertarray(st, neo));
         }
         if (x >= nexteps(neo))
            return '';
         let p = stringslice(x, neo);
         let neo2 = bb(neo, neo);
         let neo3 = bb(neo2, neo);
         let neos = bb(neo, neo2);
         if (!sugar[28] || (!sugar[30] && sugar[41])) {
            if ((!sugar[24] || p != neo) && (!sugar[25] || p != neo2) && (!sugar[26] || p != neo3) && (!sugar[27] || p != neos))
               return '';
         }
         else {
            if (sugar[30]) {
               if (!sugar[32] && p >= bb(neo, neos))
                  return '';
            }
            else {
               if (sugar[29]) {
                  if (p >= bb(neo, bb(neo, bb(neo, ''))))
                     return '';
               }
               else {
                  if ((!sugar[24] || p != neo) && (!sugar[25] || p != neo2) && (!sugar[26] || p != neo3) && (!sugar[27] || p != neos))
                     return '';
               }
            }
         }
         let sop = [stringslice(x, '', neo)];
         st = base(st);
         if (st)
            x = booster(st);
         while (st && stringslice(x, neo) == p) {
            sop.push(stringslice(x, '', neo));
            st = base(st);
            if (st)
               x = booster(st);
         }
         if (st) {
            let ca = checkpolynomial(st, p, neo);
            if (ca < 1)
               sop = sumsop(ca ? stringtosop(st) : [''], sop);
         }
         if (!sop[sop.length - 1])
            sop.pop();
         if (sugar[24] && p == neo)
            return convertsubscript('ε', convertsubstring(soptostring(sop), -1, -1));
         if (sugar[25] && p == neo2)
            return convertsubscript('ζ', convertsubstring(soptostring(sop), -1, -1));
         if (sugar[26] && p == neo3)
            return convertsubscript('η', convertsubstring(soptostring(sop), -1, -1));
         if (sugar[27] && p == neos)
            return convertsubscript('Γ', convertsubstring(soptostring(sop), -1, -1));
         sop = sumsop(stringtosop(p), sop);
         p = soptostring(sop);
         return displayphi(convertarray(p, neo));
      }

      // if b then st is not substring
      function convertepsilon(st, b = false) {
         if (st == col)
            return convertc();
         let e = propernamestring.indexOf(st);
         let t = '';
         if (e >= 0) {
            let s = sugar[22] && shortpropernames[e];
            if (b) {
               if (s || sugar[21])
                  t += ' <small>(' + (sugar[21] ? propernames[e] : '') + (s && sugar[21] ? ', ' : '') + (s ? shortpropernames[e] : '') + ')</small>';
            }
            else if (s)
               return shortpropernames[e];
         }
         //if(sugar[34]&&st>=leastuncountable&&getepslevel(st)>0)
         if ((sugar[15] || sugar[33] || sugar[34]) && getepslevel(st) > 0)
            return convertepsilon0(st, format) + t;
         let cv = convertveblen(st);
         if (cv)
            return cv + t;
         //if(sugar[40]&&(getepslevel(st)==1||booster(st)<nextzeta(st,1)))
         //let g=getepslevel(st);
         //if(sugar[34]&&g==1)
         //if(sugar[40]&&g<2)
         //if(sugar[40]&&getepslevel(st)<2)
         if (sugar[40] && getepslevel(st) < 2 && booster(st) < nextzeta(st, 1))
            //let neo=nexteps(st,1);
            //neo=nexteps(neo,1);
            //if(sugar[40]&&getepslevel(st)<2&&booster(st)>=bb(neo,neo)&&antibooster(st.slice(flooreps(st,1).length))<nextzeta(st,1))
            //if(sugar[40]&&getepslevel(st)<2&&booster(st)>=neo&&antibooster(st.slice(flooreps(st,1).length))<nextzeta(st,1))
            return convertbuchholz(st) + t;
         //return convertepsilon0(st,format);
         return convertbaseandbooster(st) + t;
      }

      // is β[X] == ω^p
      function isomegap(st) {
         return st == '[!' || st == col || booster(st) > base(st);
      }

      // is β[X] == ε
      function isepsilon(st) {
         return st == col || booster(st) > st;
      }

      function sumsop(sop1, sop2) {
         if (!sop2.length)
            return sop1;
         if (!sop1.length)
            return sop2;
         let op = sop2[sop2.length - 1];
         let e = 0;
         while (sop1[e] < op)
            e++;
         return [...sop2, ...sop1.slice(e)]
      }

      function convertomega() {
         if (sugar[15])
            return '<span style="color: #ff0000; font-weight: bold;">ω</span>';
         if (sugar[34])
            return convertsubscript('<span style="color: #001aff; font-weight: bold;">Ω</span>', convertzero());
         if (sugar[33])
            return convertsubscript('ℵ', convertzero());
         if (sugar[28] && (sugar[30] || !sugar[41]))
            return displayphi(convertarray('[!', leastuncountable));
         if (sugar[40])
            return displaypsi(convertzero(), convertone());
         return '[' + convertone() + '!';
         //return '[[!!';
      }

      /*function convertfinite(st)
      {
      if(sugar[18])
         return st.length/2;
      return convertsubstring(st);
      }*/

      /*function convertproduct0(st,m)
      {
      if(m=='[!')
         return convertsubstring(st);
      st=st=='[[!!'?convertomega():convertsubstring(st);
      m=m<'[[!!'?convertfinite(m):convertsubstring(m);
      if(!sugar[17]||m[0]=='[')
         st+=multiplicationsign[sugar[16]];
      return st+m;
      }*/

      function sumtoterm(st) {
         st = String(st);
         let e = st.length;
         let np = 0;
         while ((e > -1) && (np != 0 || st[e] != '+')) {
            e--;
            if (st[e] == '[' || st[e] == '(' || st[e] == '{' || (e > 0 && st.slice(e - 1, e + 1) == '<s'))
               np--;
            else if (st[e] == '!' || st[e] == ')' || st[e] == '}' || (e > 0 && st.slice(e - 1, e + 1) == '</'))
               np++;
         }
         return e < 0 ? st : '<span style="color: #666666; font-weight: bold;">(</span>' + st + '<span style="color: #666666; font-weight: bold;">)</span>';
      }

      function arraytoposition(st) {
         st = String(st);
         let e = st.length;
         let np = 0;
         while ((e > -1) && (np != 0 || (st[e] != '@' && st[e] != ','))) {
            e--;
            if (st[e] == '[' || st[e] == '(' || st[e] == '{' || (e > 0 && st.slice(e - 1, e + 1) == '<s'))
               np--;
            else if (st[e] == '!' || st[e] == ')' || st[e] == '}' || (e > 0 && st.slice(e - 1, e + 1) == '</'))
               np++;
         }
         return e < 0 ? st : '{' + st + '}';
      }

      function powertofactor(st) {
         st = String(st);
         let e = st.length;
         let np = 0;
         while ((e > -1) && (np != 0 || (st[e] != '^' && st[e] != '_'))) {
            e--;
            if (st[e] == '[' || st[e] == '(' || st[e] == '{' || (e > 0 && st.slice(e - 1, e + 1) == '<s'))
               np--;
            else if (st[e] == '!' || st[e] == ')' || st[e] == '}' || (e > 0 && st.slice(e - 1, e + 1) == '</'))
               np++;
         }
         return e < 0 ? st : '<span style="color: #666666; font-weight: bold;">(</span>' + st + '<span style="color: #666666; font-weight: bold;">)</span>';
      }

      function convertproduct(st, m) {
         m = sumtoterm(m);
         /*if(!sugar[17]||m[0]=='[')
            st+=multiplicationsign[sugar[16]];
         return powertofactor(st)+m;*/
         return powertofactor(st) + (!sugar[17] || m[0] == '[' ? multiplicationsign[sugar[16]] : '') + m;
      }

      /*function convertpower0(st,p)
      {
      if(p=='[!')
         return convertsubstring(st);
      st=st=='[[!!'?convertomega():convertsubstring(st);
      if(sugar[19])
         return st+'<sup>'+convertsubstring(p)+'</sup>';
      return st+'^'+convertsubstring(p);
      }*/

      function convertpower(st, p, b = true) {
         if (b && !sugar[13])
            return 'Ε(' + st + ',' + p + ')';
         if (sugar[19])
            return (sugar[20] ? st : powertofactor(st)) + '<sup>' + p + '</sup>';
         return powertofactor(st) + '^' + sumtoterm(p);
      }

      function convertsubscript(st, p) {
         if (sugar[20])
            return st + '<sub>' + p + '</sub>';
         return powertofactor(st) + '_' + sumtoterm(p);
      }

      function displayfunction(f, sub, st, subexists = true) {
         return (subexists ? convertsubscript(f, sub) : f) + '<span style="color: #666666; font-weight: bold;">(</span>' + st + '<span style="color: #666666; font-weight: bold;">)</span>';
      }

      function displaypsi(sub, st, subexists = true) {
         return displayfunction('ψ', sub, st, subexists);
      }

      function displayphi(st) {
         return displayfunction('<span style="color: #888888; font-weight: bold;">φ</span>', '', st, false);
      }

      function getOmeganumber(st) {
         /*if(!st)
            return '';
         let l=getepslevel(st);
         if(l>1)
            return st;*/
         let f = nexteps(st, 2);
         if (booster(st) >= bb(f, f))
            return st;
         let sopc = [];
         while (st) {
            sopc.push(booster(st));
            st = base(st);
         }
         sopc = sopdividedbyepsilon(sopc, leastr);
         return soptostring(sopc);
      }

      function convertbuchholz(st) {
         let c = flooreps(st, 1);
         let sop = [];
         while (st != c) {
            sop.push(booster(st));
            st = base(st);
         }
         if (!c)
            return displaypsi(convertzero(), convertsubstring(soptostring(sop), -1, -1));
         if (c == col)
            return displaypsi(nlevels == 1 ? convertone() : convertc(), convertsubstring(soptostring(sop), -1, -1));
         let g = getOmeganumber(c);
         if (c == g)
            return displaypsi(convertepsilon0(c, format), convertsubstring(soptostring(sop), -1, -1));
         return displaypsi(convertsubstring(g, -1, -1), convertsubstring(soptostring(sop), -1, -1));
         /*let sopc=[];
         while(c)
            {
            sopc.push(booster(c));
            c=base(c);
            }
         sopc=sopdividedbyepsilon(sopc,leastr);
         return displaypsi(convertsubstring(soptostring(sopc),-1,-1),convertsubstring(soptostring(sop),-1,-1));*/
      }

      function convertone() {
         if (sugar[14])
            return '1';
         //if(sugar[13]&&sugar[15]&&sugar[23])
         if (sugar[15] && sugar[23])
            return convertpower(convertomega(), convertzero());
         if (sugar[28])
            return displayphi(convertarray('', leastuncountable));
         if (sugar[40])
            return displaypsi(convertzero(), convertzero());
         //if(sugar[13])
         //   return convertpower(convertomega(),convertzero());
         return '[' + convertzero() + '!';
         //return '[!';
      }

      function convertbaseandbooster(st) {
         return bb(convertsubstring(base(st), -1, -1, false), convertsubstring(booster(st), -1, -1));
      }

      //function convertop(st,b=true)
      function convertop(op) {
         if (!op)
            return convertone();
         if (op == '[!')
            return convertomega();
         //if(b&&isepsilon(st))
         //let e=flooreps(op);
         //if(sugar[40]&&booster(e)<nextzeta(e,1))
         //if(sugar[40]&&booster(op)<nextzeta(op,1))
         //if(sugar[34]&&getepslevel(op)==1)
         //   return convertepsilon0(op,format);
         //if(sugar[40])
         //   return convertbuchholz(op);
         if (isepsilon(op))
            return convertepsilon(op);
         if (sugar[10] && op >= leastepsilon)
            return convertepa(optoepa(op));
         //return convertpower('[[!!',op);
         //if(sugar[13]&&sugar[23])
         if (sugar[23])
            return convertpower(convertomega(), convertsubstring(op, -1, -1));
         if (sugar[28] && (sugar[30] || !sugar[41])) {
            let cv = convertveblen(op);
            if (cv)
               return cv;
         }
         if (sugar[40] && !((sugar[15] || sugar[33] || sugar[34]) && op >= leastuncountable))
            return convertbuchholz(op);
         //return bb('',convertsubstring(op,-1,-1));
         return convertbaseandbooster(tostandard(bb('', op)));
         //return sugar[13]?convertpower(convertomega(),convertsubstring(op,-1,-1)):bb('',convertsubstring(op,-1,-1));
      }

      /*function getop(st)
      {let l=getepslevel(st);
      if
      return booster(st);
      if(st<leastepsilon)
         return booster(st);
      let x=booster(st);
      let beta=base(st);
      return x>beta?x:bb(beta,booster(x));
      }*/

      /*function convertomegap(st,b)
      {
      if(isepsilon(st))
         return convertepsilon(st,b);
      //return convertop(booster(st),false);
      //if(base(st)!=flooreps(booster(st)))
      //   alert(st);
      return convertop(booster(st));
      //return convertop(getop(st));
      }*/

      function optostring(st) {
         return isepsilon(st) ? st : bb(flooreps(st), st);
      }

      function stringtosop(s) {
         let st = s;
         if (!st)
            return [];
         let sop = [];
         //let st1=st;
         if (isomegap(st)) {
            sop.push(isepsilon(st) ? st : booster(st));
            return sop;
         }
         do {
            sop.push(booster(st));
            st = base(st);
         }
         while (!isomegap(st));
         //while(st&&!isomegap(st));
         sop.push(isepsilon(st) ? st : booster(st));
         //if(st1!=soptostring(sop))
         //   alert(st1+'\n'+soptostring(sop));
         return sop;
      }

      function soptostring(sop) {
         let e = sop.length - 1;
         if (e < 0)
            return '';
         let op = sop[e];
         let st = isepsilon(op) ? op : bb(flooreps(op), op);
         e--;
         while (e >= 0) {
            st += bb('', sop[e]);
            e--;
         }
         return st;
      }

      function soptosopn(sop) {
         let sopn = [];
         let op = sop[0];
         let n = 1;
         for (let e = 1; e < sop.length; e++)
            if (sop[e] == op)
               n++;
            else {
               //sopn.push([op,n]);
               //sopn.push(op?[op,n]:n);
               sopn.push(op ? n > 1 ? [op, n] : op : n);
               op = sop[e];
               n = 1;
            }
         //sopn.push([op,n]);
         //sopn.push(op?[op,n]:n);
         sopn.push(op ? n > 1 ? [op, n] : op : n);
         return sopn;
      }


      function sopslice(sop, op) {
         let e = 0;
         while (sop[e] < op && e < sop.length)
            e++;
         return [sop.slice(0, e), sop.slice(e)];
      }

      function opdividedbyepsilon(op, e) {
         op = op.slice(e.length);
         if (op < leastepsilonbb)
            return op;
         let ax = antibooster(op);
         let e1 = flooreps(ax);
         if (ax == e1)
            return ax + antibase(op);
         return e1 + op;

         /*if(op==e)
            return '';
         let e2=bb(e,e);
         if(op<e2)
            return bb('',op.slice(e.length+1,-1));
         if(op==e2)
            return e;
         if(op<bb(e,bb(e,'')))
            return bb('',e+op.slice(e2.length+1,-1));
         return op;*/
      }

      function sopdividedbyepsilon(sop, e) {
         return sop.map(op => opdividedbyepsilon(op, e))
      }

      function optoepa(op) {
         if (op < leastepsilon)
            return op;
         let e = flooreps(op);
         if (op == e)
            return [e, '[!', ''];
         //let sop=stringtosop(booster(op));
         let sop = stringtosop(op);
         let m, p;
         [m, p] = sopslice(sop, e);
         m = soptostring(m);
         //p=p.map(i=>opdividedbyepsilon(i,e));
         p = sopdividedbyepsilon(p, e);
         p = soptostring(p);
         return [e, p, m];
      }

      /*function opntoepan(opn)
      {
      let epa=optoepa(opn[0]);
      if(!Array.isArray(epa))
         return opn;
      return optoepa(opn[0]).push(opn[1]);
      }*/

      function soptosepa(sop) {
         return sop.map(optoepa);
      }

      /*function sopntosepan(sopn)
      {
      return sopn.map(opntoepan);
      }*/

      function sepatosepsum(sepa) {
         let sepsum = [];
         let i = 0;
         while (i < sepa.length && !Array.isArray(sepa[i]))
            i++;
         if (i) {
            sepsum = sugar[9] ? soptosopn(sepa.slice(0, i)) : sepa.slice(0, i);
            sepa = sepa.slice(i);
         }
         if (sepa.length) {
            let j = 0;
            let e = sepa[0][0];
            let p = sepa[0][1];
            let z = sepa[0][2];
            let a = '';
            /*let z1='';
            while(z)
               {
               z1=z;
               z=base(z);
               }
            let bs=z1;
            let em;
            if(isepsilon(bs))
               {
               a=bb('',bs)+sepa[0][2].slice(z1.length);
               em=bs;
               }
            else
               {
               a=sepa[0][2].slice(z.length);
               em=booster(bs);
               }*/

            for (let i = 1; i < sepa.length; i++) {
               if (sepa[i][0] == e && sepa[i][1] == p) {
                  if (i > j)
                     a = bb('', z) + a;
                  z = sepa[i][2];
                  /*while(z&&booster(z)<em)
                     z=base(z);
                  if(isepsilon(z)&&z<em)
                     z='';
                  z1='';
                  while(z)
                     {
                     z1=z;
                     z=base(z);
                     }
                  bs=z1;
                  if(isepsilon(bs))
                     {
                     a=bb('',bs)+sepa[i][2].slice(z1.length)+a;
                     em=bs;
                     }
                  else
                     {
                     a=sepa[i][2].slice(z.length)+a;
                     em=booster(bs);
                     }*/
               }
               else {
                  a = (isepsilon(z) ? z : flooreps(z) + bb('', z)) + a;
                  sepsum.push([e, p, a]);
                  j = i;
                  e = sepa[i][0];
                  p = sepa[i][1];
                  z = sepa[i][2];
                  a = '';
                  /*z1='';
                  while(z)
                     {
                     z1=z;
                     z=base(z);
                     }
                  bs=z1;
                  if(isepsilon(bs))
                     {
                     a=bb('',bs)+sepa[i][2].slice(z1.length);
                     em=bs;
                     }
                  else
                     {
                     a=sepa[i][2].slice(z.length);
                     em=booster(bs);
                     }*/
               }
            }
            a = (isepsilon(z) ? z : flooreps(z) + bb('', z)) + a;
            sepsum.push([e, p, a]);
         }
         return sepsum;
      }

      function convertsepa(sepa) {
         return sepa.map(convertepa);
      }

      /*function convertsepan(sepan)
      {
      return sepan.map(convertepan);
      }*/

      function convertsepsum(sepsum) {
         return sepsum.map(convertepsum);
      }

      function convertnatural(n) {
         //if(!n)
         //   return convertzero();
         if (n == 1)
            return convertone();
         if (sugar[18])
            return n;
         let s9 = sugar[9];
         let s10 = sugar[10];
         sugar[9] = 0;
         sugar[10] = 0;
         let st = convertsubstring('[!'.repeat(n), -1, -1);
         sugar[9] = s9;
         sugar[10] = s10;
         return st;
      }

      function convertopn(opn) {
         if (!Array.isArray(opn))
            return isNaN(opn) ? convertop(opn) : convertnatural(opn);
         if (sugar[13]) {
            if (opn[1] == 1)
               return convertop(opn[0]);
            if (!opn[0])
               return convertnatural(opn[1]);
            return convertproduct(convertop(opn[0]), convertnatural(opn[1]));
         }
         opn[0] = convertop(opn[0]);
         let s = 'Π';
         if (opn[0][0] == 'Ε') {
            opn[0] = opn[0].slice(2, -1);
            s = 'Ε';
         }
         opn[1] = convertnatural(opn[1]);
         //return JSON.stringify(opn).replaceAll('"','');
         //return 'Π('+JSON.stringify(opn).replaceAll('"','').slice(1,-1)+')';
         return s + '<span style="color: #666666; font-weight: bold;">(</span>' + opn[0] + ',' + opn[1] + '<span style="color: #666666; font-weight: bold;">)</span>';
      }

      function convertepa(epa) {
         if (!Array.isArray(epa))
            return convertop(epa);
         if (sugar[13]) {
            let a = epa[1] == '[!' ? convertepsilon(epa[0]) : convertpower(convertepsilon(epa[0]), convertsubstring(epa[1], -1, -1));
            return epa[2] ? convertproduct(a, convertop(epa[2])) : a;
         }
         if (epa[1] == '[!') {
            if (!epa[2])
               return convertepsilon(epa[0]);
            return 'Π(' + convertepsilon(epa[0]) + ',' + convertop(epa[2]) + ')';
         }
         if (!epa[2])
            return 'Ε(' + convertepsilon(epa[0]) + ',' + convertsubstring(epa[1], -1, -1) + ')';
         epa[0] = convertepsilon(epa[0]);
         epa[1] = convertsubstring(epa[1], -1, -1);
         epa[2] = convertop(epa[2]);
         //return JSON.stringify(epa).replaceAll('"','');
         //return 'Π('+JSON.stringify(epa).replaceAll('"','').slice(1,-1)+')';
         //return 'Π(Ε('+epa[0]+','+epa[1]+')'+','+epa[2]+')';
         //return 'Ε('+JSON.stringify(epa).replaceAll('"','').slice(1,-1)+')';
         return 'Ε(' + epa[0] + ',' + epa[1] + ',' + epa[2] + ')';
      }

      /*function convertepan(epan)
      {
      if(epan.length==2)
         return convertopn(epan);
      if(sugar[13])
         {
         let st=convertepa(epa.slice(0,2));
         if(epan[3]==1)
            return st;
         return convertproduct(st,convertnatural(opn[1]));
         }
      epan[0]=convertepsilon(epan[0]);
      epan[1]=convertsubstring(epan[1]);
      epan[2]=convertop(epan[2]);
      epan[3]=convertnatural(epan[3]);
      return JSON.stringify(opn).replaceAll('"','');
      }*/

      function convertepsum(epsum) {
         if (!Array.isArray(epsum))
            return !epsum || isNaN(epsum) ? convertop(epsum) : convertnatural(epsum);
         if (epsum.length == 2)
            return convertopn(epsum);
         if (sugar[13]) {
            let a = epsum[1] == '[!' ? convertepsilon(epsum[0]) : convertpower(convertepsilon(epsum[0]), convertsubstring(epsum[1], -1, -1));
            return epsum[2] == '[!' ? a : convertproduct(a, convertsubstring(epsum[2], -1, -1));
         }
         if (epsum[1] == '[!') {
            if (epsum[2] == '[!')
               return convertepsilon(epsum[0]);
            return 'Π(' + convertepsilon(epsum[0]) + ',' + convertsubstring(epsum[2], -1, -1) + ')';
         }
         if (epsum[2] == '[!')
            return 'Ε(' + convertepsilon(epsum[0]) + ',' + convertsubstring(epsum[1], -1, -1) + ')';
         epsum[0] = convertepsilon(epsum[0]);
         epsum[1] = convertsubstring(epsum[1], -1, -1);
         epsum[2] = convertsubstring(epsum[2], -1, -1);
         //return JSON.stringify(epsum).replaceAll('"','');
         //return 'Π('+JSON.stringify(epsum).replaceAll('"','').slice(1,-1)+')';
         //return 'Π(Ε('+epsum[0]+','+epsum[1]+')'+','+epsum[2]+')';
         //return 'Ε('+JSON.stringify(epsum).replaceAll('"','').slice(1,-1)+')';
         return 'Ε(' + epsum[0] + ',' + epsum[1] + ',' + epsum[2] + ')';
      }

      function convertsop(sop) {
         return sop.map(convertop);
      }

      function convertsopn(sopn) {
         return sopn.map(convertopn);
      }

      function convertsum(sum) {
         if (sum.length == 1)
            return sum[0];
         if (sugar[12]) {
            let s = '';
            for (let e = sum.length - 1; e >= 0; e--)
               s += sum[e] + ' + ';
            return s.slice(0, -3);
         }
         //return 'Σ'+JSON.stringify(sum).replaceAll('"','');
         return 'Σ(' + JSON.stringify(sum).replaceAll('"', '').slice(1, -1) + ')';
      }

      function convertbb(st, b) {
         //if(isomegap(st))
         //   return convertomegap(st,b);

         /*if(fsaltcheck)
            {
            fsaltcheck=false;
            st=fsalt(st,'',0);
            }*/

         if (isomegap(st))
            if (isepsilon(st))
               return convertepsilon(st, b);
            else
               return convertop(booster(st));
         if (sugar[8]) {
            let sop = stringtosop(st);
            //if(sugar[9]&&!(sugar[10]&&sugar[11]&&!sugar[40]))
            if (sugar[9] && !(sugar[10] && sugar[11])) {
               let sopn = soptosopn(sop);
               /*if(sugar[10])
                  {
                  let sepan=sopntosepan(sopn);
                  return convertsum(convertsepan(sepan));
                  }*/
               return convertsum(convertsopn(sopn));
            }
            if (sugar[10]) {
               let sepa = soptosepa(sop);
               //if(sugar[11]&&!sugar[40])
               if (sugar[11]) {
                  let sepsum = sepatosepsum(sepa);
                  return convertsum(convertsepsum(sepsum));
               }
               return convertsum(convertsepa(sepa));
            }
            return convertsum(convertsop(sop));
         }
         //return st;
         return convertbaseandbooster(st);
         //return convert0(st,0);
      }

      function convertzero(c = true) {
         if (sugar[2] && c)
            return '0';
         return '';
      }

      function convertc() {
         return col;
      }

      function convertsubstring(st, a = sugar[4], b = sugar[6], c = true) {
         if (!st)
            return convertzero(c);
         if (st == col)
            return convertc();
         if ((!sugar[5] && a <= 0) || (!sugar[7] && b <= 0))
            return convertbb(st, a == sugar[4] && b == sugar[6]);
         else
            return bb(convertsubstring(base(st), a, b - 1, false), convertsubstring(booster(st), a - 1, b));
      }

      function convertbo(st) {
         return st;
      }

      function convert(st) {
         //fsaltcheck=true;
         if (sugar[0])
            if (st == bo)
               st = convertbo(st);
            else
               st = convertsubstring(st);
         if (sugar[1])
            st = st.toString().replaceAll('!', ']');
         return st;
      }

      function seteo(i) {
         eo = i;
      }

      let uncountablemode = 1;
      let uncountablemodeinitnames = ['Some large countable ordinal', 'Some large cardinal'];
      let bo = uncountablemodeinitnames[uncountablemode], col = 'c', eo = 0, efs = 0,
         //exp=['expansion','recursive expansion','double recursive expansion','triple recursive expansion','quadruple recursive expansion','quintuple recursive expansion','sextuple recursive expansion','septuple recursive expansion','octuple recursive expansion','ninefold recursive expansion'];
         //exp[-1]='collapse',exp[-2]='view';
         exp = ['Expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand', 'Recursively expand'];
      exp[-1] = 'Collapse', exp[-2] = 'view';
      let count = 1, vt = true, pairb = [], pairl = [], exb = [], di = 5, fsl, fsn, fsp, lea, format = 1, ps = [];
      let countdifference, multicount;
      let mousex, mousey;
      let gtkey = 3, ltkey = 3;
      let processing = true;
      let indentmode = 0;
      let indentvisible = 1;
      let keytcheck = true;
      let mousetag, mousetagp;
      let fscurrent, fsopening, fsperiod0, fsperiod1, fsending, cofcurrent, cofclass, cardclass, fsarray;
      let fsprimer0, fsending0;
      let fsnumber = 1, fsopeningarray, fsperiodarray, fsendingarray;
      let cofclasslist = ['', 'zero', 'successor', 'regular cardinal', 'singular cardinal'];
      let cardclasslist = ['finite cardinal', 'countable', 'uncountable', 'countable cardinal', 'uncountable cardinal'];
      //let fsaltcheck;
      let cblen = 0, cbc = 0, cpn = 0;
      //let ulnar=['UL1','UL'];
      let ulnar = ['UL', 'UL'];
      let markedli;
      let prevsmallexp = '-', nextsmallexpn;
      let nextl, nextlb = false, mulcounter = 1;
      let nlevels = 2;
      let bolevels = 2;
      let leastr = 'c';
      let vero = 0;
      let spn = true;
      let subperiodpositionshift = 0;
      let leastuncountable = '[c!', leastepsilon = '[[c!!', leastepsilonbb = '[[[c!!!';
      let initlargeordinal = bo;
      let sugar = [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 35, 36, 37, 38, 39, 1, 0]
      let sugardefault = [[...sugar], [...sugar]];
      sugardefault[0][10] = 0;
      let sugarbuttoncolor = ['#d0e0ff', '#fff080', '#d0ffd0', '#d0ffff', '', '', '', '', '#ffff00', '#d0ffff', '#d0ffd0', '#d0ffd0', '#ffe0e0', '#fff0e0', '#d0ffd0', '#d0ffd0', '#d0ffd0', '#d0ffd0', '#d0ffd0', '#ffd0ff', '#ffd0ff', '#d0e0ff', '#d0e0ff', '#c0ffff', '#b0ffb0', '#ffe0e0', '#a0f0c0', '#fff000', '#fafa00', '#f0f040', '#f0f040', '#f0f040', '#f0f040', '#c0ffff', '#c0ffff', 35, 36, 37, 38, 39, '#ffd000', '#f0f040'];
      let sugarbuttonnumber = [1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1];
      let multiplicationsign = ['×', '·'];
      let propernames = ['Small Cantor ordinal', 'Cantor ordinal', 'Large Cantor ordinal', 'Feferman–Schütte ordinal', 'Ackermann ordinal', 'Small Veblen ordinal', 'Large Veblen ordinal', 'Second Large Veblen ordinal', 'Bachmann-Howard ordinal', 'Buchholz ordinal', 'Takeuti-Feferman-Buchholz ordinal', 'Bird ordinal', 'Extended Buchholz ordinal', 'Small Rathjen ordinal', 'Rathjen ordinal', 'Large Rathjen ordinal', 'Duchhardt ordinal'];
      let shortpropernames = ['', '', '', '', 'AO', 'SVO', 'LVO', 'SLVO', '<span style="color: #1900ff; font-weight: bold;">BHO</span>', 'BO', 'TFB', 'BiO', '', 'SRO', 'RO', 'LRO', 'DO'];
      let propernamestring = ['[[c!!', '[[c![[c!!!', '[[c![[c!![[c!!!', '[[c![[c![[c!!!!', '[[c![[c![[c!![[c!!!!', '[[c![[c![[c![!!!!', '[[c![[c![[c![[c!!!!!', '[[c![[c![[c![[c!!!![[c![[c![[c!!!!!', '[[c![c!!', '[[c[!!!', '[[c[!![c!!', '[[c[[c!!!!', '[[c[c!!!', '[[c[c!![c!!', '[[c[c[c!!![c!!', '[[c[c[c[c!!!![c!!', '[[c[c[c[c[c!!!!![c!!'];
      let modoldc = 0;
      let modc = 0;
      let modoldfraction;
      seteo(eo);

      /*
      let st='[[c!![[c!![[[c!![[c!!![[[c!![[c!!![[[c!![[[c!!!![[[c!![[[c!!!![[[c!![!![[[c!![!![[[c!!![[[c!!![[[c!!![[[!!![[[!!![[[!!![[![![![![!![[![![![!![[![![![!![[![![![!![![![![![!';
      list.innerHTML+=convert(st)+'<br/>';
      st=stringslice(st,'[!','[[c!![[c!!');
      list.innerHTML+=convert(st)+'<br/>';
      */

      function isSuccessor(str) { return str.endsWith("[!") }

      let ZERO = '';
      let Limit = bo

      function isTowerOfW(st) {
         if (!st) return false;
         if (st === '[!') return true;
         if (st === '[[!!' || isepsilon(st)) return true;
         if (!isomegap(st)) return false;
         let exp = booster(st);
         return isTowerOfW(exp);
      }

      return {
         fs, cmp, isSuccessor, convert, ZERO, Limit, sugar,
         isepsilon, isOmega, isTowerOfW, isomegap, isepsilon0
      }
   })();
   //Impportant: without this the program wont be able to render the number line
   function fs(ord, n) {
      return EcOCF.fs(ord, '', n)
   }

   //Important : etablish the well orderness of the number line.
   //without this, the number line will rather messy(no broken)
   function cmp(a, b) {
      return EcOCF.cmp(a, b)
   }

   //Important : handle for successor ordinal or it will literally take the successor fs's
   function isSuccessor(ord) {
      return EcOCF.isSuccessor(ord)
   }

   //Important : let the program display your ordinal in texts (you can add html tags too!)
   function display(ord, mode) {
      if (ord == EcOCF.ZERO) return '0'
      if (ord == EcOCF.Limit) return 'Lim(EcOCF)'
      if (mode == "raw") return ord
      return EcOCF.convert(ord)
   }

   function classifyOrdinal(ord) {
      if (ord == Limit) return "#ffffff";
      if (ord.length == 0) return "#808080";
      if (EcOCF.isSuccessor(ord)) return "#d40000";
      if (EcOCF.isOmega(ord)) return "#1988c9";
      if (EcOCF.isepsilon(ord)) return "#00ff00";
      if (EcOCF.isTowerOfW(ord)) return "#ffffff";
      if (EcOCF.isomegap(ord)) return "#ffff00";
      return "#ff8000"; // General limits / compound terms
   }

   //optional: if you dont have this, just leave empty and dont return this in the end of IIEF (this will ler the program know you don't implement this)
   function parse(str) {
   }

   //Required Constants
   const Zero = EcOCF.ZERO;
   const Limit = EcOCF.Limit;

   const DisplayName = ["pretty", "raw"];

   const ordinalTypes = [
      ["Zero", "#808080"],
      ["Successor Ordinal", "#d40000"],
      ["Limit Ordinal", "#ff8000"],
      ["Power of ω", "#ffff00"],
      ["Tower of ω", "#ffffff"],
      ["ε Ordinal", "#00FF00"],
      ["Transitive Ordinal", "#1988c9"],
   ];

   const Aliases = [
   ];

   const config = { modes: [0] };//you must put an array of number represents the orders of notations incase you want a starting notation. look for configs for more 

   const title = "EcOCF transfinite number line";

   return {
      fs,
      cmp,
      isSuccessor,
      display,
      classifyOrdinal,
      //parse,
      Zero,
      Limit,
      DisplayName,
      ordinalTypes,
      Aliases,
      config,
      title
   };

})();
