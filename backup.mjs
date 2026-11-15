import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const base=dirname(fileURLToPath(import.meta.url));
const mode=process.argv[2]||'local';
if(!['local','production'].includes(mode))throw new Error('Usage: npm run backup -- local|production');
const source=resolve(base,'data',mode+'.sqlite');
if(!existsSync(source))throw new Error('Database does not exist: '+source);
const folder=resolve(base,'backups');mkdirSync(folder,{recursive:true,mode:0o700});
const dest=resolve(folder,mode+'-'+new Date().toISOString().replaceAll(':','-')+'.sqlite');
const db=new DatabaseSync(source);
try{db.prepare('VACUUM INTO ?').run(dest);console.log('Backup created: '+dest)}finally{db.close()}
