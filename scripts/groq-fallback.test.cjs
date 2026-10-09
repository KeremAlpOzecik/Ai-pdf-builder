/* eslint-disable @typescript-eslint/no-require-imports -- Node regression harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies, env = {}, fetch) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {
    exports, require: name => dependencies[name] ?? require(name), process:{env}, fetch, AbortSignal,
  });
  return exports;
}
const common = {
  '@/lib/cv-json-schema':{CV_JSON_SCHEMA:{}},
  '@/lib/normalize-cv':{normalizeCv:v=>v},
  '@/lib/cv-utils':{cvHasContent:v=>!!v.personalInfo?.fullName},
};
test('fallback only accepts transient failures and bad output',()=>{
  const {shouldUseGroq:f}=load('src/lib/groq.ts',common);
  for(const status of [429,500,503,404]) assert.equal(f({status}),true);
  for(const status of [400,401,403]) assert.equal(f({status,message:'quota'}),false);
  assert.equal(f({message:'request timed out'}),true);
  assert.equal(f({name:'SyntaxError'}),true);
  assert.equal(f({message:'invalid user input'}),false);
});
test('Groq uses server credential, strict CV schema and rejects incomplete output',async()=>{
  let request;
  const groq=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test-key'},async(url,options)=>{
    request={url,...options}; return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"personalInfo":{"fullName":"Test"}}'}}]})};
  });
  const options={userPrompt:'synthetic CV',instruction:'keep facts',temperature:0.3,targetLanguage:'TR'};
  assert.equal((await groq.generateGroqAts(options)).personalInfo.fullName,'Test');
  assert.equal(request.headers.Authorization,'Bearer test-key');
  assert.equal(JSON.parse(request.body).response_format.json_schema.strict,true);
  const bad=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test-key'},async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'{}'}}]})}));
  await assert.rejects(bad.generateGroqAts(options),/incomplete/);
  const rate=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test-key'},async()=>({ok:false,status:429}));
  await assert.rejects(rate.generateGroqAts(options),/429/);
});
test('Gemini success skips backup, transient ATS failure uses it, import never uses it',async()=>{
  const {shouldUseGroq}=load('src/lib/groq.ts',common);
  let failures=false, calls=0, backups=0;
  const ai=load('src/lib/gemini.ts',{
    ...common,
    '@google/genai':{GoogleGenAI:class {models={generateContent:async()=>{calls++; if(failures) throw {status:503}; return {text:'{"personalInfo":{"fullName":"Gemini"}}'};}}}},
    '@/lib/groq':{shouldUseGroq,generateGroqAts:async()=>{backups++;return {personalInfo:{fullName:'Groq'}};}},
  },{GEMINI_API_KEY:'test',GROQ_API_KEY:'test'});
  const options={mode:'enhance',userPrompt:'test',temperature:0.3,targetLanguage:'TR'};
  assert.equal((await ai.generateCvJson(options)).personalInfo.fullName,'Gemini');
  assert.equal(backups,0);
  failures=true;
  assert.equal((await ai.generateCvJson(options)).personalInfo.fullName,'Groq');
  assert.equal(calls,2); assert.equal(backups,1);
  await assert.rejects(ai.generateCvJson({...options,mode:'parse'}));
  assert.equal(backups,1);
});
test('Gemini authentication errors never send a CV to Groq; disabled backup keeps Gemini model retry',async()=>{
  const {shouldUseGroq}=load('src/lib/groq.ts',common);
  let status=401, backups=0, calls=0;
  const deps={...common,
    '@google/genai':{GoogleGenAI:class {models={generateContent:async()=>{calls++; throw {status};}}}},
    '@/lib/groq':{shouldUseGroq,generateGroqAts:async()=>{backups++;throw new Error('429 backup exhausted');}},
  };
  const options={mode:'enhance',userPrompt:'test',temperature:0.3,targetLanguage:'TR'};
  const enabled=load('src/lib/gemini.ts',deps,{GEMINI_API_KEY:'test',GROQ_API_KEY:'test'});
  await assert.rejects(enabled.generateCvJson(options));
  assert.equal(backups,0);assert.equal(calls,1);
  status=503;
  await assert.rejects(enabled.generateCvJson(options),/429 backup exhausted/);
  assert.equal(backups,1);
  calls=0;
  const disabled=load('src/lib/gemini.ts',deps,{GEMINI_API_KEY:'test'});
  await assert.rejects(disabled.generateCvJson(options));
  assert.equal(calls,2);assert.equal(backups,1);
});
