import Queue from 'bull';
//connect redis
const articleQueue = new Queue('articleQueue', {
    redis: {
        host: 'localhost',
        port: 6379
    }
});

export default articleQueue;
