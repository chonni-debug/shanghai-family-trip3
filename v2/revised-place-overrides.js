'use strict';

async function loadRevisedPlaceOverrides(){
  try{
    const r=await fetch('../data/revised-place-overrides.json',{cache:'no-store'});if(!r.ok)throw new Error('revised-place-overrides');
    const payload=await r.json();
    const apply=()=>{
      if(!DATA?.places||typeof mergeExtendedPlace!=='function')return false;
      (payload.places||[]).forEach(mergeExtendedPlace);
      if(typeof render==='function')render();
      return true;
    };
    if(!apply()){
      let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>80)clearInterval(timer)},50);
    }
  }catch(err){console.warn('Revised place overrides unavailable',err)}
}
loadRevisedPlaceOverrides();
