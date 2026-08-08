import express from "express";
import Redis from "ioredis";

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function getotp(phone){
    return `otp:${phone}`
}

app.post("/otp" ,async(req,res)=>{
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    await redis.set(getotp(phone) , otp , "EX" , 30)

    res.status(200).json({message:"OTP generated:",otp})

})

app.post("/otp/verify" , async(req,res) =>{
    const { phone,otp } = req.body;
    const savedOtp = await redis.get(getotp(phone))

    if(!savedOtp){
        return res.status(400).json({message:"OTP EXPRIED!!"})
    }

    if(savedOtp !== otp){
        return res.status(400).json({message:"Invalid OTP"})
    }

    res.status(200).json({message:"OTP verified successfully!!"})
})

app.get("/otp/:phone/ttl",async(req,res)=>{

    const ttl = await redis.ttl(getotp(req.params.phone));
    res.status(200).json({TTL:ttl})
})

app.listen(port ,()=>{
    console.log(`server running on PORT:${port}`)
})