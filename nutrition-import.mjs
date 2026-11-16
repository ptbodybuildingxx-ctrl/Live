// Offline adapter for Swedish Food Agency API JSON saved by an administrator.
// No network connection and no automated guessing of food identity.
// node nutrition-import.mjs matched-source.json > nutrition-batches.json
// Each input entry: {id, sourceCode, nutrientRows, portions, preparation, allergens}.
import {readFileSync} from 'node:fs';
import {seedFoods,nutrientKeys,normalizeSwedishCarbs} from './dist/core/nutrition-catalog.js';

const components={kcal:['ENERC','kcal'],protein:['PROT','g'],carbs:['CHO','g'],fat:['FAT','g'],fiber:['FIBT','g'],sugar:['SUGAR','g'],saturated:['FASAT','g'],sodium:['NA','mg']};
const lookup=(row,k)=>row[k]??row[k[0].toUpperCase()+k.slice(1)];
export function convertSwedishRecords(input){
  if(!Array.isArray(input))throw Error('Expected array');
  const seen=new Set();
  return input.map(record=>{
    const base=seedFoods.find(x=>x.id===record.id);
    if(!base||seen.has(base.id)||!/^\d+$/.test(String(record.sourceCode))||!Array.isArray(record.nutrientRows))throw Error('Every source record needs a distinct matched food ID');
    seen.add(base.id);
    const nutrients=Object.fromEntries(nutrientKeys.map(key=>{
      const [code,unit]=components[key];
      const matched=record.nutrientRows.filter(x=>String(lookup(x,'euroFIRkod')||lookup(x,'forkortning')).toUpperCase()===code&&String(lookup(x,'enhet')).toLowerCase()===unit&&Number(lookup(x,'viktGram'))===100);
      if(matched.length!==1)return [key,null];
      const value=lookup(matched[0],'varde');
      return [key,typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null];
    }));
    if(['kcal','protein','carbs','fat'].some(k=>nutrients[k]===null))throw Error('Missing required source values for '+base.id);
    return {...base,...normalizeSwedishCarbs(nutrients,'Livsmedelsverkets Livsmedelsdatabas (CC BY 4.0) · https://soknaringsinnehall.livsmedelsverket.se/Home/FoodDetails/'+record.sourceCode),
      portions:{g:1,kg:1000,...record.portions},preparation:record.preparation||base.preparation,allergens:record.allergens||'',status:'ready'};
  });
}
if(process.argv[1]?.endsWith('nutrition-import.mjs')&&process.argv[2]){
  const rows=convertSwedishRecords(JSON.parse(readFileSync(process.argv[2],'utf8')));
  const batches=Array.from({length:Math.ceil(rows.length/50)},(_,i)=>rows.slice(i*50,i*50+50));
  process.stdout.write(JSON.stringify(batches,null,2)+'\n');
}
