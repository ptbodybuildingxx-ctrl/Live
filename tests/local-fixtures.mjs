import {randomBytes} from 'node:crypto';
import {createApp as createServer} from '../server.mjs';

// Ephemeral credentials for isolated test databases only. Nothing is checked in.
export const newTestPassword=()=>randomBytes(32).toString('hex');
export const demoPassword=newTestPassword();
export const createApp=options=>createServer({...options,demoPassword});
