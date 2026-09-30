import cors from 'cors';
import express from 'express';
import type { PrismaClient } from '@prisma/client';
import type { AppEnv } from './config/env.js';
import { parseUniversityDomains } from './config/env.js';
import { prisma as defaultPrisma } from './database/prisma.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { createAuthRouter } from './modules/auth/auth.router.js';
import { AuthService } from './modules/auth/auth.service.js';
import { createRoleProbeRouter } from './modules/auth/role-probe.router.js';
import { SessionService } from './modules/auth/session.service.js';
import { UniversityEmailValidator } from './modules/auth/university-email.js';
import { HelpSeekerController } from './modules/help-seeker/help-seeker.controller.js';
import { createHelpSeekerRouter } from './modules/help-seeker/help-seeker.router.js';
import { HelpSeekerService } from './modules/help-seeker/help-seeker.service.js';
import { SkillsController } from './modules/skills/skills.controller.js';
import { createSkillCatalogRouter, createStudentSkillsRouter } from './modules/skills/skills.router.js';
import { SkillsService } from './modules/skills/skills.service.js';
import type { EmailService } from './services/email/email.service.js';
import { LoggingEmailAdapter } from './services/email/logging-email.adapter.js';
import { PasswordHasher } from './services/password-hasher.js';

export type CreateAppOptions = {
  env: AppEnv;
  emailService?: EmailService;
  prisma?: PrismaClient;
};

export function createApp(options: CreateAppOptions) {
  const { env } = options;
  const prisma = options.prisma ?? defaultPrisma;
  const emailService = options.emailService ?? new LoggingEmailAdapter(env.LOG_VERIFICATION_LINKS);
  const passwordHasher = new PasswordHasher(env.BCRYPT_COST);
  const sessionService = new SessionService(prisma, env.SESSION_TTL_HOURS);
  const authService = new AuthService({
    prisma,
    passwordHasher,
    universityEmailValidator: new UniversityEmailValidator(
      parseUniversityDomains(env.UNIVERSITY_EMAIL_DOMAINS),
    ),
    emailService,
    appPublicUrl: env.APP_PUBLIC_URL,
    verificationTokenTtlHours: env.VERIFICATION_TOKEN_TTL_HOURS,
  });
  const helpSeekerService = new HelpSeekerService({
    prisma,
    passwordHasher,
    sessionService,
  });
  const authController = new AuthController({
    authService,
    sessionService,
    sessionTtlHours: env.SESSION_TTL_HOURS,
    secureCookies: env.NODE_ENV === 'production',
  });
  const helpSeekerController = new HelpSeekerController({
    helpSeekerService,
    sessionTtlHours: env.SESSION_TTL_HOURS,
    secureCookies: env.NODE_ENV === 'production',
  });
  const skillsController = new SkillsController(new SkillsService({ prisma }));

  const app = express();
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '32kb' }));
  app.use('/auth', createAuthRouter(authController, helpSeekerController));
  app.use('/help-seeker', createHelpSeekerRouter(helpSeekerController, sessionService));
  app.use('/skills', createSkillCatalogRouter(skillsController));
  app.use('/students/me/skills', createStudentSkillsRouter(skillsController, sessionService));
  app.use(createRoleProbeRouter(sessionService));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
