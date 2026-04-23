import { Queue } from "bullmq";
import { redis } from "@/lib/redis"; 
export const transactionQueue = new Queue("transactionQueue", { connection: redis });