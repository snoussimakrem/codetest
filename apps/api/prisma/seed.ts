import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { demoStartups } from '../../../packages/shared/src/demo';
import { hashPassword } from '../src/security';
const db = new PrismaClient();
async function main() {
  const passwordHash = await hashPassword('VentureX-demo-2026!');
  const founder = await db.user.upsert({where:{email:'founder@venturex.demo'},update:{},create:{email:'founder@venturex.demo', name:'Alex Morgan (demo)', role:'FOUNDER', passwordHash}});
  const investor = await db.user.upsert({where:{email:'investor@venturex.demo'},update:{},create:{email:'investor@venturex.demo', name:'Jordan Lee (demo)', role:'INVESTOR', passwordHash}});
  for (const startup of demoStartups) await db.startup.upsert({where:{slug:startup.slug},update:{},create:{...startup, ownerId:founder.id,isDemo:true,published:true}});
  await db.investorProfile.upsert({where:{userId:investor.id},update:{},create:{userId:investor.id,preferences:{sectors:['AI & Machine Learning','Climate Tech'],countries:[],stages:['Seed'],budget:100000,risk:'Balanced',thesis:'Human-centered technology'}}});
  if (!await db.portfolioHolding.count({where:{userId:investor.id}})) for (const [i,s] of demoStartups.slice(0,4).entries()) await db.portfolioHolding.create({data:{userId:investor.id,startupId:s.id,invested:25000*(i+1),value:30000*(i+1),simulated:true}});
  if (!await db.conversation.count()) await db.conversation.create({data:{members:{create:[{userId:investor.id},{userId:founder.id}]},messages:{create:{senderId:founder.id,body:'Welcome! This is a fictional demonstration conversation. Happy to discuss the Lumina AI product roadmap.'}}}});
}
main().finally(()=>db.$disconnect());
