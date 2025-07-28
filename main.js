const WEBAPP_URL = 'YOUR_WEBAPP_URL_HERE';
const SPOTS = [
  { spotId: 'spot1', code: '1112', stampURL: 'https://imgur.com/ldJFnt9.png' },
  { spotId: 'spot2', code: '0831', stampURL: 'https://imgur.com/ox3aBm1.png' },
  { spotId: 'spot3', code: '0624', stampURL: 'https://imgur.com/sZmdg0Y.png' }
];
let authMode = 'signin', enteredDigits=[0,0,0,0], currentNick='', currentPin='';
const $ = id => document.getElementById(id);

function show(id){
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  $(id).style.display='flex';
}
function updateModeLabel(){
  const lbl=$('input-mode-label');
  lbl.textContent=authMode==='signin'?'ログイン':'新規登録';
  lbl.style.color=authMode==='signin'?'#2196f3':'#43a047';
}
function clearInputs(){
  $('nick').value=''; $('pin').value=''; $('login-error').textContent='';
}
function createStampBoard(){
  const board=$('stamp-board');
  board.innerHTML='';
  SPOTS.forEach(s=>{
    const frame=document.createElement('div');
    frame.className='stamp-frame'; frame.id=s.spotId;
    const img=document.createElement('img'); img.style.display='none';
    frame.appendChild(img); board.appendChild(frame);
  });
}
window.addEventListener('DOMContentLoaded',()=>{
  $('choose-signin').onclick=()=>{authMode='signin';updateModeLabel();show('input-page');};
  $('choose-signup').onclick=()=>{authMode='signup';updateModeLabel();show('input-page');};
  $('back-btn').onclick=()=>{clearInputs();show('mode-page');};
  $('login-btn').onclick=submitAuth;
  $('sync-button').onclick=()=>syncToSheet(true);
  $('dial-up').onclick=()=>adjustAllDigits(-1);
  $('dial-down').onclick=()=>adjustAllDigits(1);
  document.querySelectorAll('.dial-slot').forEach((el,i)=>el.onclick=()=>rotateDigit(i,1));
  createStampBoard();show('mode-page');updateModeLabel();
});

function submitAuth(){
  const nick=$('nick').value.trim(),pin=$('pin').value.trim(),err=$('login-error');
  err.textContent='';
  if(!nick||!/^\d{4}$/.test(pin)){err.textContent='ニックネーム／PIN を正しく入力してください';return;}
  let req;
  if(authMode==='signup'){
    req=fetch(WEBAPP_URL,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nickname:nick,pin:pin,mode:'register'})});
  }else{
    req=fetch(`${WEBAPP_URL}?nickname=${encodeURIComponent(nick)}&pin=${encodeURIComponent(pin)}`);
  }
  req.then(r=>r.json()).then(data=>{
    if((authMode==='signup'&&data.status==='registered')||(authMode==='signin'&&!data.error)){
      currentNick=nick; currentPin=pin;
      if(authMode==='signin'){
        SPOTS.forEach(s=>{
          const f=$(s.spotId),img=f.querySelector('img');
          if(data[s.spotId]){f.classList.add('stamped');img.src=s.stampURL;img.style.display='block';}
        });
        $('comment-input').value=data.memo||'';
      }
      clearInputs();show('main-page');
    }else{
      err.textContent=data.error==='duplicate'?'既に登録済みです':data.error==='not found'?'ユーザー未登録':'エラーが発生しました';
    }
  }).catch(()=>{err.textContent='接続エラー';});
}
function resetToDial(){enteredDigits=[0,0,0,0];document.querySelectorAll('.dial-slot').forEach(el=>el.textContent='0');}
function adjustAllDigits(step){enteredDigits=enteredDigits.map(d=>(d+step+10)%10);document.querySelectorAll('.dial-slot').forEach((el,i)=>el.textContent=enteredDigits[i]);checkCode();}
function rotateDigit(i,step){enteredDigits[i]=(enteredDigits[i]+step+10)%10;document.querySelectorAll('.dial-slot')[i].textContent=enteredDigits[i];checkCode();}
function checkCode(){const code=enteredDigits.join('');SPOTS.forEach(s=>{const f=$(s.spotId);if(!f.classList.contains('stamped')&&code===s.code)triggerStamp(s);});}
function triggerStamp(spot){if($('se-decision'))$('se-decision').play();const overlay=$('stamp-overlay'),img=$('overlay-img');img.src=spot.stampURL;overlay.style.display='flex';setTimeout(()=>overlay.style.display='none',1200);const frame=$(spot.spotId),icon=frame.querySelector('img');icon.src=spot.stampURL;icon.style.display='block';frame.classList.add('stamped');resetToDial();syncToSheet(false);if(document.querySelectorAll('.stamp-frame.stamped').length===SPOTS.length){if($('se-complete'))$('se-complete').play();const comp=$('complete-effect');comp.style.display='flex';setTimeout(()=>comp.style.display='none',2500);}}
function syncToSheet(showMsg){if(!currentNick||!currentPin)return;const body={nickname:currentNick,pin:currentPin,spot1:$('spot1').classList.contains('stamped'),spot2:$('spot2').classList.contains('stamped'),spot3:$('spot3').classList.contains('stamped'),memo:$('comment-input').value};fetch(WEBAPP_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).then(data=>{if(showMsg){$('sync-msg').textContent=data.status==='ok'?'同期しました！':'同期失敗';setTimeout(()=>$('sync-msg').textContent='',2000);}}).catch(()=>{if(showMsg)$('sync-msg').textContent='接続エラー';});}
