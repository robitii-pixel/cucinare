#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera index.html (build web pubblicabile) da la-nostra-cucina.html (build personale).
   Rimuove i dati personali e imposta PERSONAL=false. Genera anche qa-web.js.
   Eseguire SEMPRE dopo ogni modifica alla build personale."""
s = open('la-nostra-cucina.html', encoding='utf-8').read()
w = s.replace('var PERSONAL=true;', 'var PERSONAL=false;')
w = w.replace('var PROF_FIXED={r:{dob:"1980-02-21",h:175,w:74,goal:"ricomp"},g:{dob:"1990-04-16",h:185,w:86,goal:"cut"}};',
              'var PROF_FIXED={r:{goal:"ricomp"},g:{goal:"cut"}};')
w = w.replace('''    if(!pr.dob){ var fx=PROF_FIXED[k];
      pr.dob=fx.dob; pr.h=pr.h||fx.h; pr.goal=pr.goal||fx.goal;
      pr.w=fx.w;
      var hh=state.whist&&state.whist[k]; if(hh&&(!hh.length||hh[hh.length-1].w!==pr.w)) hh.push({d:(new Date()).toISOString().slice(0,10),w:pr.w});
    }''', '    if(!pr.goal){ pr.goal=PROF_FIXED[k].goal; }')
w = w.replace('<div class="pname">Roberto <span style="font-weight:400;font-size:.75rem;color:var(--muted)">\u00b7 n. 21/02/1980 \u00b7 175 cm</span></div>', '<div class="pname">Roberto</div>')
w = w.replace('<div class="pname">Gigi <span style="font-weight:400;font-size:.75rem;color:var(--muted)">\u00b7 n. 16/04/1990 \u00b7 185 cm</span></div>', '<div class="pname">Gigi</div>')
assert 'var PERSONAL=false;' in w, 'flag PERSONAL non convertito'
assert '1980' not in w and '1990-04' not in w, 'DATI PERSONALI RESIDUI NELLA BUILD WEB'
open('index.html', 'w', encoding='utf-8').write(w)
q = open('qa.js', encoding='utf-8').read().replace('la-nostra-cucina.html', 'index.html')
open('qa-web.js', 'w', encoding='utf-8').write(q)
print('build web ok \u00b7 dati personali: assenti \u00b7 qa-web.js rigenerato')
