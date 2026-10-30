// GitHub OIDC proves the repository + main workflow. No family/API key is read.
import {JOB_AUDIENCE} from './server/github-job.mjs';
export async function runLearningJob(env=process.env,fetcher=fetch){
 if(env.GITHUB_REPOSITORY!=='Lianag2018/educ-ecole'||env.GITHUB_REF!=='refs/heads/main'||!['schedule','workflow_dispatch'].includes(env.GITHUB_EVENT_NAME))throw Error('invalid_job');
 const tokenURL=new URL(env.ACTIONS_ID_TOKEN_REQUEST_URL);
 if(tokenURL.protocol!=='https:'||!tokenURL.hostname.endsWith('.actions.githubusercontent.com')||tokenURL.username||tokenURL.password)throw Error('invalid_token_endpoint');
 tokenURL.searchParams.set('audience',JOB_AUDIENCE);
 const tokenResponse=await fetcher(tokenURL,{redirect:'error',headers:{Authorization:`Bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`},signal:AbortSignal.timeout(10000)});
 if(!tokenResponse.ok)throw Error('job_auth_failed');
 const {value}=await tokenResponse.json();if(typeof value!=='string'||!value)throw Error('job_auth_failed');
 const response=await fetcher(JOB_AUDIENCE,{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${value}`,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(55000)});
 // Deliberately never print a token, response body, task, profile or document.
 if(!response.ok)throw Error(`job_http_${response.status}`);
 const result=await response.json();
 if(result?.skipped==='learning_disabled')return 'Évolution automatique désactivée : aucun traitement effectué.';
 if(!Number.isInteger(result?.updated)||result.updated<0||result.updated>2)throw Error('invalid_job_response');
 return 'Traitement privé terminé.';
}
// Only fixed codes/statuses may reach logs; never arbitrary exception messages.
export function jobErrorCode(error){
 const code=error?.message;
 return /^(invalid_job|invalid_token_endpoint|job_auth_failed|invalid_job_response|job_http_[1-5][0-9]{2})$/.test(code)?code:'job_unavailable';
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 try{console.log(await runLearningJob());}catch(error){console.error('Traitement privé indisponible ('+jobErrorCode(error)+'). Vérifier la configuration et le budget dans le projet personnel.');process.exitCode=1;}
}
