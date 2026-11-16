// Check every maintained JavaScript source, including newly added modules.
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
function files(path,recursive){return readdirSync(path,{withFileTypes:true}).flatMap(f=>f.isDirectory()&&recursive?files(join(path,f.name),true):f.isFile()&&/\.m?js$/.test(f.name)?[join(path,f.name)]:[])}
const sources=[...files(root,false),...files(join(root,'dist'),true),...files(join(root,'tests'),true)];
for(const path of sources){const result=spawnSync(process.execPath,['--check',path],{stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1)}
console.log(`Syntax checked: ${sources.length} JavaScript sources.`);
