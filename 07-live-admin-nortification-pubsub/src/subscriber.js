import Redis from "ioredis";

const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

subscriber.subscribe("notification" ,(err)=>{
    if(err){
        console.err("Failed to subscribe",err.message)

        return;
    }

    console.log("Subscribed successfully !")
})

subscriber.on("message" , (channel,message)=>{
    console.log("Recevied on",channel,":",JSON.parse(message))
})