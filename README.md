personal-cms-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── redis.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.repository.ts
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.types.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── profile.controller.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── profile.routes.ts
│   │   │   ├── profile.validation.ts
│   │   │   └── profile.repository.ts
│   │   │
│   │   ├── interests/
│   │   │   ├── interest.controller.ts
│   │   │   ├── interest.service.ts
│   │   │   ├── interest.routes.ts
│   │   │   ├── interest.validation.ts
│   │   │   └── interest.repository.ts
│   │   │
│   │   ├── certifications/
│   │   │   ├── certification.controller.ts
│   │   │   ├── certification.service.ts
│   │   │   ├── certification.routes.ts
│   │   │   ├── certification.validation.ts
│   │   │   └── certification.repository.ts
│   │   │
│   │   ├── experience/
│   │   │   ├── experience.controller.ts
│   │   │   ├── experience.service.ts
│   │   │   ├── experience.routes.ts
│   │   │   ├── experience.validation.ts
│   │   │   └── experience.repository.ts
│   │   │
│   │   ├── education/
│   │   │   ├── education.controller.ts
│   │   │   ├── education.service.ts
│   │   │   ├── education.routes.ts
│   │   │   ├── education.validation.ts
│   │   │   └── education.repository.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── project.controller.ts
│   │   │   ├── project.service.ts
│   │   │   ├── project.routes.ts
│   │   │   ├── project.validation.ts
│   │   │   └── project.repository.ts
│   │   │
│   │   ├── skills/
│   │   │   ├── skill.controller.ts
│   │   │   ├── skill.service.ts
│   │   │   ├── skill.routes.ts
│   │   │   └── skill.repository.ts
│   │   │
│   │   ├── uploads/
│   │   │   ├── upload.controller.ts
│   │   │   ├── upload.service.ts
│   │   │   ├── upload.routes.ts
│   │   │   └── storage/
│   │   │       ├── storage.interface.ts
│   │   │       └── local.storage.ts
│   │   │
│   │   ├── cv/
│   │   │   ├── cv.controller.ts
│   │   │   ├── cv.service.ts
│   │   │   ├── cv.routes.ts
│   │   │   ├── cv.validation.ts
│   │   │   └── cv.generator.ts
│   │   │
│   │   └── contact/
│   │       ├── contact.controller.ts
│   │       ├── contact.service.ts
│   │       ├── contact.routes.ts
│   │       └── contact.validation.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── not-found.middleware.ts
│   │
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── authentication.error.ts
│   │   ├── authorization.error.ts
│   │   ├── validation.error.ts
│   │   ├── not-found.error.ts
│   │   └── conflict.error.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── logger.ts
│   │
│   ├── queues/
│   │   ├── queue.ts
│   │   ├── email.queue.ts
│   │   └── cv.queue.ts
│   │
│   ├── workers/
│   │   ├── email.worker.ts
│   │   └── cv.worker.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── uploads/
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md