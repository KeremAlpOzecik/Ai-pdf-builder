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
test('Groq uses server credential, strict CV schema and rejects incomplete output',async()=>{
  let request;
  const groq=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test-key'},async(url,options)=>{
    request={url,...options}; return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"personalInfo":{"fullName":"Test"}}'}}]})};
  });
  const options={userPrompt:'synthetic CV',instruction:'keep facts',temperature:0.3,targetLanguage:'TR'};
  assert.equal((await groq.generateGroqCv(options)).personalInfo.fullName,'Test');
  assert.equal(request.headers.Authorization,'Bearer test-key');
  assert.equal(JSON.parse(request.body).response_format.json_schema.strict,true);
  const bad=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test-key'},async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'{}'}}]})}));
  await assert.rejects(bad.generateGroqCv(options),/incomplete/);
  const rate=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test-key'},async()=>({ok:false,status:429}));
  await assert.rejects(rate.generateGroqCv(options),/429/);
});

test('all AI modes use Groq without a Google dependency',async()=>{
  let calls=[];
  const ai=load('src/lib/ai.ts',{'@/lib/ai-availability':{AI_ENABLED:true},'@/lib/groq':{generateGroqCv:async o=>{calls.push(o);return {personalInfo:{fullName:'Test'}};}}});
  for(const mode of ['parse','enhance','translate']) await ai.generateCvJson({mode,userPrompt:'synthetic',temperature:0.1,targetLanguage:'TR'});
  assert.equal(calls.length,3); assert.match(calls[2].instruction,/translate/);
});
test('image import uses vision JSON mode and respects image limits',async()=>{
  let body;
  const groq=load('src/lib/groq.ts',common,{GROQ_API_KEY:'test'},async(url,options)=>{
    body=JSON.parse(options.body);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"personalInfo":{"fullName":"Test"}}'}}]})};
  });
  const part={inlineData:{mimeType:'image/jpeg',data:'test'}};
  const options={parts:[part],instruction:'extract',userPrompt:'test',temperature:0.1,targetLanguage:'TR'};
  await groq.generateGroqCv(options);
  assert.equal(body.model,'qwen/qwen3.8-27b');assert.equal(body.response_format.type,'json_object');
  assert.match(body.messages[1].content[1].image_url.url,/^data:image\/jpeg;base64,/);
  await assert.rejects(groq.generateGroqCv({...options,parts:[part,part,part,part]}),/Unsupported/);
  await assert.rejects(groq.generateGroqCv({...options,parts:[{inlineData:{mimeType:'application/pdf',data:'test'}}]}),/Unsupported/);
});
