(() => {
  const $=id=>document.getElementById(id);
  const e={input:$('imageInput'),upload:$('uploadArea'),uploadTitle:$('uploadTitle'),uploadHelp:$('uploadHelp'),paper:$('paper'),orientation:$('orientation'),orientationButtons:[...document.querySelectorAll('[data-orientation]')],margin:$('margin'),width:$('width'),height:$('height'),ratioLock:$('ratioLock'),swap:$('swapSize'),economy:$('economy'),guides:$('cutGuides'),numbers:$('pageNumbers'),notice:$('notice'),download:$('download'),canvas:$('previewCanvas'),empty:$('emptyState'),size:$('sizeStat'),sheets:$('sheetsStat'),parts:$('gridStat'),paperInfo:$('paperInfo'),canvasWrap:$('canvasWrap'),viewSheets:$('viewSheets'),viewPanel:$('viewPanel')};
  let image=null,ratio=1,locked=true,imageName='painel',view='sheets';
  function paper(){let w=e.paper.value==='A4'?210:297,h=e.paper.value==='A4'?297:420;return e.orientation.value==='portrait'?[w,h]:[h,w];}
  function val(el,d=0){return Number.isFinite(parseFloat(el.value))?parseFloat(el.value):d;}
  function place(page,p,areaW,areaH){
    for(const sh of page.shelves){if(p.h<=sh.h&&p.w<=areaW-sh.x){p.x=sh.x;p.y=sh.y;sh.x+=p.w;page.pieces.push(p);page.usedW=Math.max(page.usedW,sh.x);page.usedH=Math.max(page.usedH,sh.y+sh.h);return true;}}
    const y=page.shelves.reduce((m,s)=>Math.max(m,s.y+s.h),0);
    if(p.w<=areaW&&y+p.h<=areaH){p.x=0;p.y=y;page.shelves.push({x:p.w,y,h:p.h});page.pieces.push(p);page.usedW=Math.max(page.usedW,p.w);page.usedH=Math.max(page.usedH,y+p.h);return true;}
    return false;
  }
  function packParts(parts,areaW,areaH){
    const pages=[];
    for(const p of parts){let placed=false;
      // Revisit every previously started sheet so narrow edge strips can share a page.
      for(const page of pages){if(place(page,p,areaW,areaH)){placed=true;break;}}
      if(!placed){const page={shelves:[],pieces:[],usedW:0,usedH:0};pages.push(page);place(page,p,areaW,areaH);}
    }
    return pages;
  }
  function calculate(){
    const [pw,ph]=paper(),m=Math.max(0,Math.min(30,val(e.margin,10))),aw=pw-2*m,ah=ph-2*m,W=Math.max(1,val(e.width,100))*10,H=Math.max(1,val(e.height,100))*10;
    const cols=Math.max(1,Math.ceil(W/aw)),rows=Math.max(1,Math.ceil(H/ah)),parts=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const sx=c*aw,sy=r*ah;parts.push({id:r*cols+c+1,row:r,col:c,xSrc:sx,ySrc:sy,w:Math.min(aw,W-sx),h:Math.min(ah,H-sy)});}
    const sheets=e.economy.checked?packParts(parts,aw,ah):parts.map(p=>({shelves:[],pieces:[Object.assign(p,{x:0,y:0})],usedW:p.w,usedH:p.h}));
    return {pw,ph,m,aw,ah,W,H,cols,rows,parts,sheets,total:sheets.length};
  }
  function setPreviewMode(next){view=next;e.viewSheets.classList.toggle('active',view==='sheets');e.viewPanel.classList.toggle('active',view==='panel');e.viewSheets.setAttribute('aria-selected',String(view==='sheets'));e.viewPanel.setAttribute('aria-selected',String(view==='panel'));drawPreview();}
  function drawPanelGrid(ctx,s,maxW,maxH){
    const scale=Math.min(maxW/s.W,maxH/s.H),w=Math.max(1,Math.round(s.W*scale)),h=Math.max(1,Math.round(s.H*scale)),x=8,y=8;e.canvas.width=w+16;e.canvas.height=h+16;
    ctx.fillStyle='#fff';ctx.fillRect(0,0,e.canvas.width,e.canvas.height);ctx.drawImage(image,x,y,w,h);ctx.strokeStyle='#2763d8';ctx.lineWidth=1.4;
    for(let c=1;c<s.cols;c++){const xx=x+c*s.aw*scale;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+h);ctx.stroke();}
    for(let r=1;r<s.rows;r++){const yy=y+r*s.ah*scale;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();}
    ctx.strokeStyle='#2763d8';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
    for(const p of s.parts){const pw=p.w*scale,ph=p.h*scale;if(pw>33&&ph>20){ctx.fillStyle='#fff';ctx.globalAlpha=.85;ctx.fillRect(x+(p.col*s.aw+4)*scale,y+(p.row*s.ah+4)*scale,32,14);ctx.globalAlpha=1;ctx.fillStyle='#183f91';ctx.font='600 10px Inter,Arial';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`${p.row+1}-${p.col+1}`,x+(p.col*s.aw+7)*scale,y+(p.row*s.ah+11)*scale);}}
  }
  function drawSheets(ctx,s,maxW){
    const perRow=Math.min(4,Math.max(1,Math.ceil(Math.sqrt(s.total)))),gap=12,labelH=23,thumbW=Math.min(230,(maxW-gap*(perRow+1))/perRow),scale=thumbW/s.pw,thumbH=s.ph*scale,rows=Math.ceil(s.total/perRow);
    e.canvas.width=Math.ceil(perRow*thumbW+(perRow+1)*gap);e.canvas.height=Math.ceil(rows*(thumbH+labelH+gap)+gap);ctx.fillStyle='#f4f7fb';ctx.fillRect(0,0,e.canvas.width,e.canvas.height);
    for(let i=0;i<s.sheets.length;i++){const page=s.sheets[i],x=gap+(i%perRow)*(thumbW+gap),y=gap+Math.floor(i/perRow)*(thumbH+labelH+gap);ctx.fillStyle='#fff';ctx.fillRect(x,y,thumbW,thumbH);ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,thumbW-1,thumbH-1);
      for(const p of page.pieces){const px=x+(s.m+p.x)*scale,py=y+(s.m+p.y)*scale,pw=p.w*scale,ph=p.h*scale;const sx=p.xSrc/s.W*image.naturalWidth,sy=p.ySrc/s.H*image.naturalHeight,sw=p.w/s.W*image.naturalWidth,sh=image.naturalHeight*p.h/s.H;ctx.drawImage(image,sx,sy,sw,sh,px,py,pw,ph);ctx.strokeStyle='#5681e9';ctx.lineWidth=1;ctx.strokeRect(px+.5,py+.5,Math.max(1,pw-1),Math.max(1,ph-1));if(pw>21&&ph>14){ctx.fillStyle='#17459d';ctx.font=`600 ${Math.max(8,Math.min(11,thumbW*.05))}px Inter,Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`${p.row+1}-${p.col+1}`,px+pw/2,py+ph/2);}}
      ctx.fillStyle='#526278';ctx.font='600 10px Inter,Arial';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`Folha ${i+1} · ${page.pieces.length} ${page.pieces.length===1?'parte':'partes'}`,x,y+thumbH+labelH/2);
    }
  }
  function drawPreview(){
    e.size.textContent=`${Number(e.width.value||0).toLocaleString('pt-BR')} × ${Number(e.height.value||0).toLocaleString('pt-BR')} cm`;e.paperInfo.textContent=`${e.paper.value} · ${e.orientation.value==='portrait'?'Vertical':'Horizontal'}`;
    if(!image){e.canvas.hidden=true;e.empty.hidden=false;e.sheets.textContent='—';e.parts.textContent='—';return;}
    const s=calculate();e.empty.hidden=true;e.canvas.hidden=false;e.sheets.textContent=`${s.total} ${s.total===1?'folha':'folhas'}`;const counts=s.sheets.map(p=>p.pieces.length),min=Math.min(...counts),max=Math.max(...counts);e.parts.textContent=min===max?`${min} por folha`:`${min}–${max} por folha`;
    const ctx=e.canvas.getContext('2d'),wrap=e.canvasWrap.getBoundingClientRect(),maxW=Math.max(260,wrap.width-22),maxH=Math.max(220,wrap.height-22);if(view==='panel')drawPanelGrid(ctx,s,maxW,maxH);else drawSheets(ctx,s,maxW);
  }
  function setImage(file){if(!file)return;if(!file.type.startsWith('image/')){showError('Escolha um arquivo de imagem.');return;}const reader=new FileReader();reader.onload=()=>{const im=new Image();im.onload=()=>{image=im;imageName=(file.name||'painel').replace(/\.[^.]+$/,'').replace(/[^a-z0-9-_]+/gi,'-');ratio=im.naturalWidth/im.naturalHeight;e.uploadTitle.textContent=file.name;e.uploadHelp.textContent=`${im.naturalWidth} × ${im.naturalHeight} px`;e.height.value=(val(e.width,100)/ratio).toFixed(1);e.download.disabled=false;e.notice.className='notice';e.notice.textContent='Arte carregada.';drawPreview();};im.src=reader.result;};reader.readAsDataURL(file);}
  function showError(msg){e.notice.className='notice error';e.notice.textContent=msg;}
  function updateRatio(changed){if(locked&&image){if(changed==='width')e.height.value=(val(e.width)/ratio).toFixed(1);else e.width.value=(val(e.height)*ratio).toFixed(1);}drawPreview();}
  function partCode(p){return `L${String(p.row+1).padStart(2,'0')}-C${String(p.col+1).padStart(2,'0')}`;}
  function drawMarks(doc,x,y,w,h,p){if(e.guides.checked){const k=3.5;doc.setDrawColor(89,111,144);doc.setLineWidth(.22);[[x,y,-1,-1],[x+w,y,1,-1],[x,y+h,-1,1],[x+w,y+h,1,1]].forEach(([a,b,dx,dy])=>{doc.line(a+dx*.8,b,a+dx*(k+.8),b);doc.line(a,b+dy*.8,a,b+dy*(k+.8));});doc.setDrawColor(131,157,214);doc.rect(x,y,w,h);}if(e.numbers.checked){doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(40,64,105);doc.text(partCode(p),x+2,y+3.5);}}
  async function makePdf(){if(!image)return;const s=calculate();if(s.total>100){showError('O painel passa de 100 folhas. Reduza o tamanho ou escolha A3.');return;}if(!window.jspdf?.jsPDF){showError('Confira sua conexão e tente novamente.');return;}e.download.disabled=true;e.download.textContent='Preparando PDF…';
    try{const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:e.orientation.value==='portrait'?'portrait':'landscape',unit:'mm',format:e.paper.value.toLowerCase(),compress:true}),ppm=150/25.4;
      for(let i=0;i<s.sheets.length;i++){if(i>0)doc.addPage(e.paper.value.toLowerCase(),e.orientation.value==='portrait'?'portrait':'landscape');for(const p of s.sheets[i].pieces){const can=document.createElement('canvas');can.width=Math.max(1,Math.ceil(p.w*ppm));can.height=Math.max(1,Math.ceil(p.h*ppm));const cx=can.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,can.width,can.height);cx.drawImage(image,p.xSrc/s.W*image.naturalWidth,p.ySrc/s.H*image.naturalHeight,p.w/s.W*image.naturalWidth,p.h/s.H*image.naturalHeight,0,0,can.width,can.height);const x=s.m+p.x,y=s.m+p.y;doc.addImage(can.toDataURL('image/jpeg',.96),'JPEG',x,y,p.w,p.h,undefined,'FAST');drawMarks(doc,x,y,p.w,p.h,p);}if(e.numbers.checked){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(90,101,116);doc.text(`Folha ${i+1} de ${s.total}`,s.pw/2,s.ph-3,{align:'center'});}if((i+1)%3===0)await new Promise(resolve=>setTimeout(resolve,0));}
      doc.save(`${imageName}-painel-${e.paper.value.toLowerCase()}.pdf`);e.notice.className='notice';e.notice.textContent=`PDF pronto · ${s.total} folhas.`;
    }catch(err){console.error(err);showError('Não foi possível gerar o PDF.');}finally{e.download.disabled=false;e.download.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 17v4h16v-4"/></svg> Baixar PDF';}
  }
  e.input.addEventListener('change',ev=>setImage(ev.target.files[0]));e.upload.addEventListener('dragover',ev=>{ev.preventDefault();e.upload.classList.add('dragging');});e.upload.addEventListener('dragleave',()=>e.upload.classList.remove('dragging'));e.upload.addEventListener('drop',ev=>{ev.preventDefault();e.upload.classList.remove('dragging');setImage(ev.dataTransfer.files[0]);});
  e.orientationButtons.forEach(btn=>btn.addEventListener('click',()=>{e.orientation.value=btn.dataset.orientation;e.orientationButtons.forEach(item=>{const active=item===btn;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});drawPreview();}));
  e.width.addEventListener('input',()=>updateRatio('width'));e.height.addEventListener('input',()=>updateRatio('height'));e.ratioLock.addEventListener('click',()=>{locked=!locked;e.ratioLock.classList.toggle('locked',locked);e.ratioLock.classList.toggle('unlocked',!locked);e.ratioLock.setAttribute('aria-label',locked?'Manter proporção da imagem':'Proporção livre');e.ratioLock.title=locked?'Manter proporção da imagem':'Proporção livre';e.ratioLock.innerHTML=locked?'<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>':'<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7-2"/></svg>';});
  e.swap.addEventListener('click',()=>{const w=e.width.value;e.width.value=e.height.value;e.height.value=w;drawPreview();});[e.paper,e.margin,e.economy,e.guides,e.numbers].forEach(el=>el.addEventListener('input',drawPreview));e.viewSheets.addEventListener('click',()=>setPreviewMode('sheets'));e.viewPanel.addEventListener('click',()=>setPreviewMode('panel'));e.download.addEventListener('click',makePdf);window.addEventListener('resize',drawPreview);drawPreview();
})();
