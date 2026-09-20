import express,{type Request, type Response} from 'express';
import dotenv from 'dotenv';

dotenv.config();

const PORT =process.env.PORT || 3000;

const app=express();
app.use(express.json());

app.get('/health',async(req:Request, res:Response)=>{
    res.status(200).json({
        message:"server is healthy"
    })
});

app.listen( PORT, ()=>{
    console.log("server running on port 3000!")
})