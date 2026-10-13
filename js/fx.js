/* CodeLearn FX layer: theme switcher, kinetic headlines, particles, scroll reveal, card tilt. */
(function(){
  "use strict";
  var root = document.documentElement;
  var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
  var THEMES = [["default","Default"],["neon","Neon glow"],["glass","Glassmorphism"],["brutal","Neo-brutalism"],["blueprint","Blueprint"],["vhs","Retro VHS"]];
  var KEY = "codelearn.theme";
  function load(){ try { return localStorage.getItem(KEY) || "default"; } catch(e){ return "default"; } }
  function name(id){ for (var i=0;i<THEMES.length;i++) if (THEMES[i][0]===id) return THEMES[i][1]; return "Default"; }
  function apply(id){
    if (id === "default") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", id);
    try { localStorage.setItem(KEY, id); } catch(e){}
    var l = document.querySelector(".fx-style .lbl"); if (l) l.textContent = name(id);
    document.querySelectorAll(".fx-pop button").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.t===id)); });
    if (window.fxRecolor) window.fxRecolor();
  }
  apply(load());          // apply early so there is no flash
  root.classList.add("fx-on");

  function ready(fn){ document.readyState==="loading" ? document.addEventListener("DOMContentLoaded", fn) : fn(); }
  ready(function(){

    /* ----- Style switcher ----- */
    var bar = document.querySelector(".bar");
    if (bar) {
      var wrap = document.createElement("div"); wrap.className = "fx-style";
      wrap.innerHTML = '<button type="button" aria-haspopup="true" aria-expanded="false"><span class="lbl">Style</span><i class="chev" aria-hidden="true"></i></button><div class="fx-pop" role="group" aria-label="Choose a style"></div>';
      var btn = wrap.querySelector("button"), pop = wrap.querySelector(".fx-pop");
      THEMES.forEach(function(t){ var b=document.createElement("button"); b.type="button"; b.dataset.t=t[0]; b.textContent=t[1]; pop.appendChild(b); });
      bar.appendChild(wrap);
      var close = function(){ pop.classList.remove("open"); btn.setAttribute("aria-expanded","false"); };
      btn.addEventListener("click", function(e){ e.stopPropagation(); var o=pop.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o)); });
      document.addEventListener("click", function(e){ if(!wrap.contains(e.target)) close(); });
      document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ close(); btn.focus(); } });
      pop.addEventListener("click", function(e){
        var b = e.target.closest("button"); if(!b) return;
        var go = function(){ apply(b.dataset.t); };
        if (document.startViewTransition && !REDUCE) document.startViewTransition(go); else go();
        close();
      });
      apply(load());
    }

    /* ----- Kinetic headline ----- */
    document.querySelectorAll(".heroText h1, .pagehead h1").forEach(function(h){
      if (h.dataset.kin || h.children.length) return;
      var text = h.textContent.trim(); h.dataset.kin = "1"; h.setAttribute("aria-label", text); h.textContent = "";
      text.split(/\s+/).forEach(function(w, i, a){
        var s = document.createElement("span"); s.className = "kw" + (/^writing/i.test(w) ? " hl" : ""); s.style.setProperty("--i", i);
        s.setAttribute("aria-hidden","true"); s.textContent = w; h.appendChild(s);
        if (i < a.length-1) h.appendChild(document.createTextNode(" "));
      });
    });

    /* ----- Scroll reveal ----- */
    var targets = document.querySelectorAll(".path, .stats>div, .callout, .flow span, details");
    if ("IntersectionObserver" in window && !REDUCE) {
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, {threshold:.15});
      targets.forEach(function(el, i){ el.classList.add("rv"); el.style.setProperty("--d", i % 4); io.observe(el); });
    }

    /* ----- 3D card tilt (mouse devices only; flat themes skip it) ----- */
    if (FINE && !REDUCE) {
      document.querySelectorAll("a.path").forEach(function(c){
        c.addEventListener("mousemove", function(e){
          if (root.dataset.theme === "brutal") return;
          var r = c.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
          c.style.transition = "transform .08s"; c.style.transform = "perspective(700px) rotateX("+(-y*8)+"deg) rotateY("+(x*10)+"deg) translateY(-4px)";
        });
        c.addEventListener("mouseleave", function(){ c.style.transition = ""; c.style.transform = ""; });
      });
    }

    /* ----- Particles ----- */
    var lite = navigator.connection && navigator.connection.saveData;
    if (!REDUCE && !lite) {
      var cv = document.createElement("canvas"); cv.id = "fxCanvas"; cv.setAttribute("aria-hidden","true"); document.body.insertBefore(cv, document.body.firstChild);
      var ctx = cv.getContext("2d"), W=0, H=0, dpr = Math.min(2, devicePixelRatio||1), P = [], mx=-999, my=-999, color = "10,100,216", raf = 0;
      var hex2rgb = function(v){ v=v.trim(); var m; if((m=/^#([0-9a-f]{6})$/i.exec(v))) return parseInt(m[1].slice(0,2),16)+","+parseInt(m[1].slice(2,4),16)+","+parseInt(m[1].slice(4,6),16); if((m=/^#([0-9a-f]{3})$/i.exec(v))) return parseInt(m[1][0]+m[1][0],16)+","+parseInt(m[1][1]+m[1][1],16)+","+parseInt(m[1][2]+m[1][2],16); return null; };
      window.fxRecolor = function(){ var c = hex2rgb(getComputedStyle(root).getPropertyValue("--acc")); if (c) color = c; };
      window.fxRecolor();
      var size = function(){
        W = innerWidth; H = innerHeight; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
        var n = Math.round(Math.min(70, W*H/22000)); P = [];
        for (var i=0;i<n;i++) P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:1+Math.random()*1.6});
      };
      var tick = function(){
        ctx.clearRect(0,0,W,H);
        for (var i=0;i<P.length;i++){
          var p=P[i]; p.x+=p.vx; p.y+=p.vy;
          if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
          var dx=p.x-mx, dy=p.y-my, d=dx*dx+dy*dy;
          if (d<14000){ var f=.6/Math.sqrt(d+1); p.x+=dx*f; p.y+=dy*f; }
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.283); ctx.fillStyle="rgba("+color+",.8)"; ctx.fill();
          for (var j=i+1;j<P.length;j++){
            var q=P[j], ax=p.x-q.x, ay=p.y-q.y, dd=ax*ax+ay*ay;
            if (dd<13000){ ctx.strokeStyle="rgba("+color+","+(.35*(1-dd/13000))+")"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); }
          }
        }
        raf = requestAnimationFrame(tick);
      };
      size(); tick();
      addEventListener("resize", function(){ clearTimeout(size.t); size.t = setTimeout(size, 200); });
      addEventListener("pointermove", function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});
      document.addEventListener("visibilitychange", function(){ cancelAnimationFrame(raf); if(!document.hidden) tick(); });
    }
  });
})();
