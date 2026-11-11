import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, Injectable, Inject, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException, Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaClient, User } from '@prisma/client';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { registerSchema, loginSchema, preferencesSchema, compatibility, StartupData } from '../../../packages/shared/src';
import { hashPassword, verifyPassword, token, digest } from './security';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
export class Database extends PrismaClient {}
type AuthRequest = Request & { user: User };
const safeUser = (u: User) => ({ id:u.id, name:u.name, email:u.email, role:u.role });
@Injectable()
class Security implements CanActivate {
  constructor(@Inject(Database) private db: Database) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    if (['POST','PATCH','DELETE','PUT'].includes(req.method) && req.headers.origin && req.headers.origin !== (process.env.WEB_ORIGIN || 'http://localhost:3000')) throw new ForbiddenException('Origin not allowed');
    const raw = req.cookies?.vx_session;
    if (raw) { const session = await this.db.session.findUnique({ where:{id:digest(raw)}, include:{user:true} }); if (session && session.expiresAt > new Date()) req.user=session.user; }
    const path = req.path;
    const publicRead = req.method === 'GET' && (path === '/api/health' || path === '/api/startups' || /^\/api\/startups\/[^/]+$/.test(path));
    if (publicRead || ['/api/auth/register','/api/auth/login','/api/auth/forgot','/api/auth/reset'].includes(path)) return true;
    if (!req.user) throw new UnauthorizedException('Please sign in to continue');
    if (path.startsWith('/api/admin') && req.user.role !== 'ADMIN') throw new ForbiddenException('Administrator access required');
    return true;
  }
}
@Catch()
class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (error instanceof ZodError) return res.status(400).json({message:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')});
    if (error instanceof HttpException) return res.status(error.getStatus()).json({message:error.message});
    if ((error as {code?:string})?.code === 'P2002') return res.status(409).json({message:'This record already exists'});
    console.error(error instanceof Error ? error.message : 'Unexpected error');
    return res.status(500).json({message:'The request could not be completed'});
  }
}
@WebSocketGateway({ cors:{origin:process.env.WEB_ORIGIN || 'http://localhost:3000',credentials:true} })
class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  constructor(@Inject(Database) private db: Database) {}
  async handleConnection(socket: Socket) {
    try {
      if (socket.handshake.headers.origin !== (process.env.WEB_ORIGIN || 'http://localhost:3000')) return socket.disconnect();
      const raw = socket.handshake.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith('vx_session='))?.slice(11);
      if (!raw) return socket.disconnect();
      const session = await this.db.session.findUnique({where:{id:digest(raw)}});
      if (!session || session.expiresAt < new Date()) return socket.disconnect();
      socket.join(session.userId);
      setTimeout(()=>socket.disconnect(),Math.max(0,session.expiresAt.getTime()-Date.now())).unref();
    } catch { socket.disconnect(); }
  }
  emitTo(userId: string, message: unknown) { this.server?.to(userId).emit('message',message); }
}
const projectSchema=z.object({name:z.string().min(3).max(120),description:z.string().min(20).max(5000),fundingRequest:z.number().int().min(100).max(100000000),milestones:z.array(z.string().min(1).max(200)).max(20).default([])});
const startupSchema=z.object({name:z.string().min(2).max(100),sector:z.string().min(2).max(80),country:z.string().min(2).max(80),city:z.string().min(2).max(80),stage:z.enum(['Pre-seed','Seed','Series A']),description:z.string().min(20).max(5000),target:z.number().int().min(1000).max(100000000),instrument:z.enum(['SAFE','Equity','Convertible note'])});
@Controller('api')
class Api {
  constructor(@Inject(Database) private db: Database, @Inject(MessagingGateway) private gateway: MessagingGateway) {}
  private audit(userId:string,action:string,entityId?:string) { return this.db.auditLog.create({data:{userId,action,entityId}}); }
  private async session(user:User,res:Response) { const raw=token(); await this.db.session.create({data:{id:digest(raw),userId:user.id,expiresAt:new Date(Date.now()+7*86400000)}}); res.cookie('vx_session',raw,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*86400000,path:'/'}); return safeUser(user); }
  @Get('health') async health() { await this.db.$queryRaw`SELECT 1`; return {status:'ok',database:'connected'}; }
  @Post('auth/register') async register(@Body() body:unknown,@Res({passthrough:true}) res:Response) { const input=registerSchema.parse(body); const user=await this.db.user.create({data:{...input,email:input.email.toLowerCase(),passwordHash:await hashPassword(input.password),password:undefined} as never}); await this.audit(user.id,'REGISTER'); return this.session(user,res); }
  @Post('auth/login') async login(@Body() body:unknown,@Res({passthrough:true}) res:Response) { const input=loginSchema.parse(body); const user=await this.db.user.findUnique({where:{email:input.email.toLowerCase()}}); if (!user || !await verifyPassword(input.password,user.passwordHash)) throw new UnauthorizedException('Email or password is incorrect'); await this.audit(user.id,'LOGIN'); return this.session(user,res); }
  @Post('auth/logout') async logout(@Req() req:AuthRequest,@Res({passthrough:true}) res:Response) { await this.db.session.deleteMany({where:{id:digest(req.cookies.vx_session)}}); this.gateway.server?.in(req.user.id).disconnectSockets(); res.clearCookie('vx_session',{path:'/'}); return {ok:true}; }
  @Get('auth/me') me(@Req() req:AuthRequest) { return safeUser(req.user); }
  @Post('auth/forgot') async forgot(@Body() body:unknown) { const {email}=z.object({email:z.email()}).parse(body); const user=await this.db.user.findUnique({where:{email:email.toLowerCase()}}); if(user){const raw=token();await this.db.passwordReset.create({data:{id:digest(raw),userId:user.id,expiresAt:new Date(Date.now()+1800000)}});await this.audit(user.id,'PASSWORD_RESET_REQUESTED'); /* Delivery adapter intentionally unavailable; never expose token. */} return {message:'If an account exists, a reset was requested. Email delivery is not configured in this local build; contact the operator.'}; }
  @Post('auth/reset') async reset(@Body() body:unknown) { const input=z.object({token:z.string().length(64),password:z.string().min(12).max(128)}).parse(body); const reset=await this.db.passwordReset.findUnique({where:{id:digest(input.token)}}); if(!reset || reset.expiresAt<new Date()) throw new BadRequestException('Reset link is invalid or expired'); const passwordHash=await hashPassword(input.password); await this.db.$transaction(async tx=>{const consumed=await tx.passwordReset.deleteMany({where:{id:reset.id,expiresAt:{gt:new Date()}}});if(consumed.count!==1)throw new BadRequestException('Reset link already used');await tx.user.update({where:{id:reset.userId},data:{passwordHash}});await tx.session.deleteMany({where:{userId:reset.userId}});}); return {ok:true}; }
  @Get('startups') async startups(@Query() query:Record<string,string>) {
    const q=z.object({search:z.string().max(100).optional(),sector:z.string().optional(),country:z.string().optional(),stage:z.string().optional(),instrument:z.string().optional(),max:z.coerce.number().positive().optional(),page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(50).default(12),sort:z.enum(['featured','target','raised','name']).default('featured')}).parse(query);
    const where={published:true,...(q.search?{OR:[{name:{contains:q.search,mode:'insensitive' as const}},{description:{contains:q.search,mode:'insensitive' as const}}]}:{}),...(q.sector?{sector:q.sector}:{}),...(q.country?{country:q.country}:{}),...(q.stage?{stage:q.stage}:{}),...(q.instrument?{instrument:q.instrument}:{}),...(q.max?{target:{lte:q.max}}:{})};
    const [items,total]=await this.db.$transaction([this.db.startup.findMany({where,skip:(q.page-1)*q.limit,take:q.limit,orderBy:q.sort==='name'?{name:'asc'}:q.sort==='target'?{target:'asc'}:q.sort==='raised'?{raised:'desc'}:{createdAt:'asc'}}),this.db.startup.count({where})]);return {items,total,page:q.page,pages:Math.ceil(total/q.limit)};
  }
  @Get('startups/:slug') async startup(@Param('slug') slug:string) { const startup=await this.db.startup.findFirst({where:{slug,published:true},include:{campaigns:true,opportunities:true}});if(!startup)throw new NotFoundException('Startup not found');return startup; }
  @Post('startups') async createStartup(@Req() req:AuthRequest,@Body() body:unknown) { if(req.user.role!=='FOUNDER')throw new ForbiddenException('Founder access required');const input=startupSchema.parse(body);const startup=await this.db.startup.create({data:{...input,slug:input.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+token().slice(0,6),ownerId:req.user.id}});await this.audit(req.user.id,'STARTUP_CREATED',startup.id);return startup; }
  @Get('founder/startups') founderStartups(@Req() req:AuthRequest) { if(req.user.role!=='FOUNDER')throw new ForbiddenException();return this.db.startup.findMany({where:{ownerId:req.user.id},include:{campaigns:true,documents:{select:{id:true,name:true,size:true,createdAt:true}}}}); }
  @Post('campaigns') async campaign(@Req() req:AuthRequest,@Body() body:unknown) { const input=z.object({startupId:z.string(),title:z.string().min(3).max(150),target:z.number().int().min(1000).max(100000000)}).parse(body);if(!await this.db.startup.findFirst({where:{id:input.startupId,ownerId:req.user.id}}))throw new ForbiddenException();const result=await this.db.fundingCampaign.create({data:input});await this.audit(req.user.id,'CAMPAIGN_CREATED',result.id);return result; }
  @Get('watchlist') watchlist(@Req() req:AuthRequest) { return this.db.watchlist.findMany({where:{userId:req.user.id},include:{startup:true}}); }
  @Post('watchlist/:id') async save(@Req() req:AuthRequest,@Param('id') startupId:string) { if(!await this.db.startup.findFirst({where:{id:startupId,published:true}}))throw new NotFoundException();return this.db.watchlist.upsert({where:{userId_startupId:{userId:req.user.id,startupId}},update:{},create:{userId:req.user.id,startupId}}); }
  @Delete('watchlist/:id') async unsave(@Req() req:AuthRequest,@Param('id') startupId:string) { await this.db.watchlist.deleteMany({where:{userId:req.user.id,startupId}});return {ok:true}; }
  @Get('preferences') async preferences(@Req() req:AuthRequest) { return (await this.db.investorProfile.findUnique({where:{userId:req.user.id}}))?.preferences || {sectors:[],countries:[],stages:[],budget:50000,risk:'Balanced',thesis:''}; }
  @Post('preferences') async setPreferences(@Req() req:AuthRequest,@Body() body:unknown) { if(req.user.role!=='INVESTOR')throw new ForbiddenException();const preferences=preferencesSchema.parse(body);return this.db.investorProfile.upsert({where:{userId:req.user.id},update:{preferences},create:{userId:req.user.id,preferences}}); }
  @Get('matching') async matching(@Req() req:AuthRequest) { const preferences=preferencesSchema.parse(await this.preferences(req));const startups=await this.db.startup.findMany({where:{published:true}});return startups.map(s=>({...s,match:compatibility(s as StartupData,preferences)})).sort((a,b)=>b.match.score-a.match.score); }
  @Get('portfolio') portfolio(@Req() req:AuthRequest) { return this.db.portfolioHolding.findMany({where:{userId:req.user.id},include:{startup:true}}); }
  @Get('projects') projects(@Req() req:AuthRequest) { return this.db.project.findMany({where:{ownerId:req.user.id},orderBy:{createdAt:'desc'}}); }
  @Post('projects') async createProject(@Req() req:AuthRequest,@Body() body:unknown) { if(req.user.role!=='PROJECT_OWNER')throw new ForbiddenException('Project owner access required');const data=projectSchema.parse(body);const project=await this.db.project.create({data:{...data,ownerId:req.user.id}});await this.audit(req.user.id,'PROJECT_CREATED',project.id);return project; }
  @Get('deals') deals(@Req() req:AuthRequest) { return this.db.deal.findMany({where:{OR:[{investorId:req.user.id},{startup:{ownerId:req.user.id}}]},include:{startup:true},orderBy:{updatedAt:'desc'}}); }
  @Post('deals') async createDeal(@Req() req:AuthRequest,@Body() body:unknown) { if(req.user.role!=='INVESTOR')throw new ForbiddenException();const {startupId}=z.object({startupId:z.string()}).parse(body);const startup=await this.db.startup.findFirst({where:{id:startupId,published:true}});if(!startup)throw new NotFoundException();const deal=await this.db.deal.upsert({where:{investorId_startupId:{investorId:req.user.id,startupId}},update:{},create:{investorId:req.user.id,startupId}});await this.db.notification.create({data:{userId:startup.ownerId,body:`${req.user.name} requested access to ${startup.name}.`}});await this.audit(req.user.id,'ACCESS_REQUESTED',deal.id);return deal; }
  @Patch('deals/:id') async updateDeal(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown) { const data=z.object({stage:z.enum(['INTEREST','REVIEW','DUE_DILIGENCE','DISCUSSION','CLOSED']).optional(),notes:z.string().max(5000).optional(),checklist:z.array(z.object({label:z.string().max(200),done:z.boolean()})).max(30).optional()}).parse(body);if(!await this.db.deal.findFirst({where:{id,OR:[{investorId:req.user.id},{startup:{ownerId:req.user.id}}]}}))throw new ForbiddenException();const deal=await this.db.deal.update({where:{id},data});await this.audit(req.user.id,'DEAL_UPDATED',id);return deal; }
  @Get('conversations') conversations(@Req() req:AuthRequest) { return this.db.conversation.findMany({where:{members:{some:{userId:req.user.id}}},include:{members:{include:{user:{select:{id:true,name:true,role:true}}}},messages:{take:1,orderBy:{createdAt:'desc'}}},orderBy:{createdAt:'desc'}}); }
  @Post('conversations') async createConversation(@Req() req:AuthRequest,@Body() body:unknown) { const {startupId}=z.object({startupId:z.string()}).parse(body);const startup=await this.db.startup.findFirst({where:{id:startupId,published:true}});if(!startup || startup.ownerId===req.user.id)throw new BadRequestException('Choose another startup founder');const existing=await this.db.conversation.findFirst({where:{AND:[{members:{some:{userId:req.user.id}}},{members:{some:{userId:startup.ownerId}}}]}});return existing || this.db.conversation.create({data:{members:{create:[{userId:req.user.id},{userId:startup.ownerId}]}}}); }
  @Get('conversations/:id/messages') async messages(@Req() req:AuthRequest,@Param('id') id:string) { if(!await this.db.conversationMember.findUnique({where:{conversationId_userId:{conversationId:id,userId:req.user.id}}}))throw new ForbiddenException();return this.db.message.findMany({where:{conversationId:id},include:{sender:{select:{name:true,id:true}}},orderBy:{createdAt:'asc'},take:200}); }
  @Post('conversations/:id/messages') async sendMessage(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown) { const {body:text}=z.object({body:z.string().trim().min(1).max(5000)}).parse(body);if(!await this.db.conversationMember.findUnique({where:{conversationId_userId:{conversationId:id,userId:req.user.id}}}))throw new ForbiddenException();const message=await this.db.message.create({data:{conversationId:id,senderId:req.user.id,body:text},include:{sender:{select:{name:true,id:true}}}});const members=await this.db.conversationMember.findMany({where:{conversationId:id}});for(const member of members)this.gateway.emitTo(member.userId,message);return message; }
  @Get('meetings') meetings(@Req() req:AuthRequest) { return this.db.meeting.findMany({where:{userId:req.user.id},orderBy:{startsAt:'asc'}}); }
  @Post('meetings') async meeting(@Req() req:AuthRequest,@Body() body:unknown) {const data=z.object({title:z.string().min(3).max(150),startsAt:z.iso.datetime().refine(v=>new Date(v)>new Date(),'Choose a future date')}).parse(body);return this.db.meeting.create({data:{...data,userId:req.user.id}}); }
  @Delete('meetings/:id') async cancelMeeting(@Req() req:AuthRequest,@Param('id') id:string) {await this.db.meeting.deleteMany({where:{id,userId:req.user.id}});return {ok:true};}
  @Get('notifications') notifications(@Req() req:AuthRequest) { return this.db.notification.findMany({where:{userId:req.user.id},orderBy:{createdAt:'desc'},take:100}); }
  @Patch('notifications/:id') async readNotification(@Req() req:AuthRequest,@Param('id') id:string) {await this.db.notification.updateMany({where:{id,userId:req.user.id},data:{read:true}});return {ok:true};}
  @Patch('profile') async profile(@Req() req:AuthRequest,@Body() body:unknown) {const data=z.object({name:z.string().min(2).max(100)}).parse(body);return safeUser(await this.db.user.update({where:{id:req.user.id},data}));}
  @Get('organizations') organizations(@Req() req:AuthRequest) {return this.db.organizationMembership.findMany({where:{userId:req.user.id},include:{organization:true}});}
  @Post('organizations') async organization(@Req() req:AuthRequest,@Body() body:unknown) {const {name}=z.object({name:z.string().min(2).max(100)}).parse(body);return this.db.organization.create({data:{name,memberships:{create:{userId:req.user.id,role:'OWNER'}}}});}
  @Get('documents') documents(@Req() req:AuthRequest) { return this.db.document.findMany({where:{OR:[{ownerId:req.user.id},{grants:{some:{userId:req.user.id,status:'APPROVED'}}}]},select:{id:true,name:true,size:true,mimeType:true,createdAt:true,ownerId:true}}); }
  @Post('documents') async upload(@Req() req:AuthRequest,@Body() body:unknown) {const input=z.object({name:z.string().min(1).max(150).regex(/^[a-zA-Z0-9 _.()-]+$/),content:z.string().max(2800000),mimeType:z.enum(['application/pdf','text/plain']),startupId:z.string().optional()}).parse(body);if(input.startupId && !await this.db.startup.findFirst({where:{id:input.startupId,ownerId:req.user.id}}))throw new ForbiddenException();const bytes=Buffer.from(input.content,'base64');if(bytes.length>2000000)throw new BadRequestException('Maximum file size is 2MB');if(input.mimeType==='application/pdf' && bytes.subarray(0,5).toString()!=='%PDF-')throw new BadRequestException('Invalid PDF');const key=token();const root=resolve(process.env.DOCUMENT_ROOT || '.data/documents');await mkdir(root,{recursive:true});await writeFile(resolve(root,key),bytes,{mode:0o600});const document=await this.db.document.create({data:{name:input.name,mimeType:input.mimeType,size:bytes.length,storageKey:key,ownerId:req.user.id,startupId:input.startupId}});await this.audit(req.user.id,'DOCUMENT_UPLOADED',document.id);return {id:document.id,name:document.name};}
  @Get('documents/:id/download') async download(@Req() req:AuthRequest,@Param('id') id:string,@Res() res:Response) { const document=await this.db.document.findFirst({where:{id,OR:[{ownerId:req.user.id},{grants:{some:{userId:req.user.id,status:'APPROVED'}}}]}});if(!document)throw new NotFoundException();await this.audit(req.user.id,'DOCUMENT_DOWNLOADED',id);res.setHeader('Content-Type',document.mimeType);res.setHeader('Content-Disposition',`attachment; filename="${document.name.replace(/[^a-zA-Z0-9 ._-]/g,'_')}"`);res.setHeader('Cache-Control','no-store');res.send(await readFile(resolve(process.env.DOCUMENT_ROOT || '.data/documents',document.storageKey))); }
  @Post('documents/:id/request') async requestDocument(@Req() req:AuthRequest,@Param('id') documentId:string) {const doc=await this.db.document.findFirst({where:{id:documentId,startup:{published:true}}});if(!doc)throw new NotFoundException();return this.db.documentAccessGrant.upsert({where:{documentId_userId:{documentId,userId:req.user.id}},update:{},create:{documentId,userId:req.user.id}});}
  @Get('document-requests') documentRequests(@Req() req:AuthRequest) {return this.db.documentAccessGrant.findMany({where:{document:{ownerId:req.user.id}},include:{document:{select:{name:true}},user:{select:{name:true}}}});}
  @Patch('document-requests/:id') async grantDocument(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown) {const {status}=z.object({status:z.enum(['APPROVED','DENIED'])}).parse(body);const grant=await this.db.documentAccessGrant.findFirst({where:{id,document:{ownerId:req.user.id}}});if(!grant)throw new ForbiddenException();await this.audit(req.user.id,'DOCUMENT_ACCESS_'+status,id);return this.db.documentAccessGrant.update({where:{id},data:{status}});}
  @Post('verifications') async verification(@Req() req:AuthRequest) {const existing=await this.db.verificationRequest.findFirst({where:{userId:req.user.id,status:'PENDING'}});return existing || this.db.verificationRequest.create({data:{userId:req.user.id}});}
  @Get('admin/:resource') async admin(@Param('resource') resource:string) {switch(resource){case 'users':return this.db.user.findMany({select:{id:true,name:true,email:true,role:true,createdAt:true},take:100});case 'startups':return this.db.startup.findMany({take:100});case 'verifications':return this.db.verificationRequest.findMany({include:{user:{select:{name:true}}},take:100});case 'audit-logs':return this.db.auditLog.findMany({orderBy:{createdAt:'desc'},take:100});case 'dashboard':return {users:await this.db.user.count(),startups:await this.db.startup.count(),pending:await this.db.verificationRequest.count({where:{status:'PENDING'}})};default:throw new NotFoundException();}}
  @Patch('admin/startups/:id') async moderate(@Req() req:AuthRequest,@Param('id') id:string,@Body() body:unknown) {const {published}=z.object({published:z.boolean()}).parse(body);await this.audit(req.user.id,'MODERATE_STARTUP',id);return this.db.startup.update({where:{id},data:{published}});}
}
@Module({imports:[ThrottlerModule.forRoot([{ttl:60000,limit:120}])],controllers:[Api],providers:[Database,MessagingGateway,{provide:APP_GUARD,useClass:ThrottlerGuard},{provide:APP_GUARD,useClass:Security}]})
class AppModule {}
async function main(){const app=await NestFactory.create(AppModule,{bodyParser:false});app.use(helmet());app.use(json({limit:'3mb'}));app.use(cookieParser());app.enableCors({origin:process.env.WEB_ORIGIN || 'http://localhost:3000',credentials:true});app.useGlobalFilters(new Errors());SwaggerModule.setup('docs',app,SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('VENTUREX API').setVersion('0.1').addCookieAuth('vx_session').build()));await app.listen(Number(process.env.PORT || 4000),'0.0.0.0');}
main();
