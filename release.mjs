// Local-only release preparation. No connection occurs at import or startup.
export function readReleaseConfig(env=process.env){
  if(env.ML_MODE!=='production')return {production:false};
  const required=['ML_PUBLIC_ORIGIN','ML_ADMIN_EMAIL','ML_ADMIN_PASSWORD','ML_CONTACT_EMAIL','ML_MAIL_ENDPOINT','ML_MAIL_TOKEN','ML_POLICY_APPROVED'];
  const missing=required.filter(k=>!env[k]);
  if(missing.length)throw new Error('Release blocked: missing '+missing.join(', '));
  const origin=new URL(env.ML_PUBLIC_ORIGIN);
  const endpoint=new URL(env.ML_MAIL_ENDPOINT);
  if(origin.protocol!=='https:'||origin.origin!==env.ML_PUBLIC_ORIGIN||endpoint.protocol!=='https:')throw new Error('Release blocked: exact HTTPS origin and HTTPS mail endpoint required');
  if([origin.host,endpoint.host,env.ML_ADMIN_EMAIL,env.ML_CONTACT_EMAIL,env.ML_MAIL_TOKEN].some(v=>/change_me|replace_me|\.invalid$/i.test(v)))throw new Error('Release blocked: replace all configuration placeholders');
  if(env.ML_ADMIN_PASSWORD.length<16||env.ML_ADMIN_PASSWORD==='REPLACE_ME_WITH_A_UNIQUE_LONG_PASSWORD')throw new Error('Release blocked: unique admin password, 16+ characters required');
  if(env.ML_POLICY_APPROVED!=='yes')throw new Error('Release blocked: owner must review and approve legal policies');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ML_CONTACT_EMAIL))throw new Error('Release blocked: valid support email required');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ML_ADMIN_EMAIL)||env.ML_ADMIN_EMAIL.endsWith('@demo.local'))throw new Error('Release blocked: real admin email required');
  const maxUsers=Number(env.ML_MAX_USERS||100);
  if(!Number.isInteger(maxUsers)||maxUsers<2||maxUsers>500)throw new Error('Release blocked: initial pilot supports an explicit 2–500 account cap only');
  return {
    production:true,origin:origin.origin,adminEmail:env.ML_ADMIN_EMAIL.toLowerCase(),adminPassword:env.ML_ADMIN_PASSWORD,contact:env.ML_CONTACT_EMAIL,maxUsers,
    async mailer({to,purpose,code,lang}){
      // A future operator-provided transactional relay, not an embedded paid provider.
      // Never log codes, passwords, or tokens.
      const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.ML_MAIL_TOKEN},body:JSON.stringify({to,purpose,code,lang}),signal:AbortSignal.timeout(10000),redirect:'error'});
      if(!res.ok)throw new Error('Mail relay rejected message');
    }
  };
}
