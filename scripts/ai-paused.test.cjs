/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
test('all AI routes refuse requests before reading CV content',async()=>{
 for(const route of ['enhance-ats','translate','parse-linkedin','parse-image']){
  const exports={};let read=0,provider=0;
  const deps={'@/lib/ai':{generateCvJson:()=>{provider++;}},'@/lib/api-guard':{guardAiRequest:()=>Response.json({code:'AI_TEMPORARILY_DISABLED'},{status:503})}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/app/api/${route}/route.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>deps[n]??{},Response});
  const result=await exports.POST({json:()=>{read++;},formData:()=>{read++;}});assert.equal(result.status,503);assert.equal(read,0);assert.equal(provider,0);
 }
});
test('shared guard is disabled independent of credentials',()=>{
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/api-guard.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>n==='next/server'?{NextResponse:Response}:{AI_ENABLED:false,AI_PAUSED_TR:'paused'},TextDecoder});
 assert.equal(exports.guardAiRequest({}).status,503);
});
