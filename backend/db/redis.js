const redis = require('redis');

console.log("try to connect to redis")


const client = redis.createClient({
    password: 'WpwSnG1hDc9vh9EHFpdr9GaDmU1e2kam',
    socket: {
        host: 'redis-14186.c62.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 14186
    }
});


// establish connection with redis
client.on("connect" , () => {
    console.log("connect to redis") 
})

client.on("error" , (e) => {
    console.log(`redis error : ${e}`)
})


client.connect()


module.exports = client