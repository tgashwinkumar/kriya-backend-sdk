import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allowedOriginsRegEx = allowedOrigins.map((origin) => new RegExp(origin));

export default cors({
    origin: allowedOriginsRegEx,
    methods: ['GET', 'POST', 'HEAD']
});