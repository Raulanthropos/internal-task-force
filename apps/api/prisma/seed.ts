import { PrismaClient, Role, Team } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

import fs from 'fs';

async function main() {
    await prisma.ticket.deleteMany();
    await prisma.scope.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('GENERATED_HASH:', passwordHash);
    fs.writeFileSync('hash.txt', passwordHash);

    // Users
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            passwordHash,
            role: Role.ADMIN,
            team: null,
        },
    });

    const swLead = await prisma.user.upsert({
        where: { username: 'sw_lead' },
        update: {},
        create: {
            username: 'sw_lead',
            passwordHash,
            role: Role.LEAD,
            team: Team.SOFTWARE,
        },
    });

    const structEngineer = await prisma.user.upsert({
        where: { username: 'struct_eng' },
        update: {},
        create: {
            username: 'struct_eng',
            passwordHash,
            role: Role.ENGINEER,
            team: Team.STRUCTURAL,
        },
    });

    console.log({ admin, swLead, structEngineer });

    // Projects
    const project1 = await prisma.project.upsert({
        where: { codeName: 'MH-2025-01' },
        update: {},
        create: {
            codeName: 'MH-2025-01',
            client: 'Acme Corp',
            status: 'PLANNING',
        },
    });

    // Scopes
    const scopeSw = await prisma.scope.create({
        data: {
            projectId: project1.id,
            team: Team.SOFTWARE,
            tickets: {
                create: [
                    { technical_specs: 'Setup React Frontend' },
                    { technical_specs: 'Integrate GraphQL' },
                ],
            },
        },
    });

    const scopeStruct = await prisma.scope.create({
        data: {
            projectId: project1.id,
            team: Team.STRUCTURAL,
            tickets: {
                create: [
                    { technical_specs: 'Analyze Beam Load' },
                ],
            },
        },
    });

    console.log({ project1, scopeSw, scopeStruct });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
