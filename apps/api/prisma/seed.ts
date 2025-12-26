import { PrismaClient, Role, Team, TicketStatus, ClientStatus, TicketPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

import fs from 'fs';

export async function seed() {
    await prisma.notification.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.scope.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('GENERATED_HASH:', passwordHash);
    fs.writeFileSync('hash.txt', passwordHash);

    // Users
    // 1. Ioannis Psychias (sw_lead, sw_eng)
    const swLead = await prisma.user.create({ data: { username: 'sw_lead', fullName: 'Ioannis Psychias', passwordHash, role: Role.LEAD, team: Team.SOFTWARE } });
    const swEng = await prisma.user.create({ data: { username: 'sw_eng', fullName: 'Ioannis Psychias', passwordHash, role: Role.ENGINEER, team: Team.SOFTWARE } });

    // 2. The Papadopoulos Clan (Everyone else)
    const admin = await prisma.user.create({ data: { username: 'admin', fullName: 'Admin Papadopoulos', passwordHash, role: Role.ADMIN, team: null } });
    const boss1 = await prisma.user.create({ data: { username: 'boss_1', fullName: 'Boss Papadopoulos', passwordHash, role: Role.ADMIN, team: null } });

    const structLead = await prisma.user.create({ data: { username: 'struct_lead', fullName: 'StructLead Papadopoulos', passwordHash, role: Role.LEAD, team: Team.STRUCTURAL } });
    const elecLead = await prisma.user.create({ data: { username: 'elec_lead', fullName: 'ElecLead Papadopoulos', passwordHash, role: Role.LEAD, team: Team.ELECTRICAL } });
    const envLead = await prisma.user.create({ data: { username: 'env_lead', fullName: 'EnvLead Papadopoulos', passwordHash, role: Role.LEAD, team: Team.ENVIRONMENTAL } });

    const structEng = await prisma.user.create({ data: { username: 'struct_eng', fullName: 'StructEng Papadopoulos', passwordHash, role: Role.ENGINEER, team: Team.STRUCTURAL } });
    const elecEng = await prisma.user.create({ data: { username: 'elec_eng', fullName: 'ElecEng Papadopoulos', passwordHash, role: Role.ENGINEER, team: Team.ELECTRICAL } });
    const envEng = await prisma.user.create({ data: { username: 'env_eng', fullName: 'EnvEng Papadopoulos', passwordHash, role: Role.ENGINEER, team: Team.ENVIRONMENTAL } });

    // 3. Bulk Expansion (10 new Generic Engineers)
    const teams = [Team.SOFTWARE, Team.STRUCTURAL, Team.ELECTRICAL, Team.ENVIRONMENTAL];
    const extraEngineers = [];
    for (let i = 1; i <= 10; i++) {
        const team = teams[(i - 1) % 4];
        const eng = await prisma.user.create({
            data: {
                username: `eng_${i}`,
                fullName: `Engineer ${i} Papadopoulos`,
                passwordHash,
                role: Role.ENGINEER,
                team
            }
        });
        extraEngineers.push(eng);
    }

    console.log('Users created with new names');

    // Clients
    const acme = await prisma.client.create({
        data: {
            name: 'Acme Recycling',
            logoUrl: '/Code_Generated_Image.png',
            status: ClientStatus.ACTIVE,
        }
    });

    const bioGas = await prisma.client.create({
        data: {
            name: 'BioGas Corp',
            logoUrl: '/Code_Generated_Image1.png',
            status: ClientStatus.ACTIVE,
        }
    });
    console.log('Clients created');

    // Projects
    const project1 = await prisma.project.create({
        data: {
            codeName: 'MH-2025-01',
            client: { connect: { id: acme.id } },
            clientContactPerson: 'John Acme',
            status: 'PLANNING',
        },
    });

    const project2 = await prisma.project.create({
        data: {
            codeName: 'BG-2025-X',
            client: { connect: { id: bioGas.id } },
            clientContactPerson: 'Jane Bio',
            status: 'IN_PROGRESS',
        },
    });
    console.log('Projects created');

    // Scopes & Tickets
    const scopeSw = await prisma.scope.create({
        data: {
            projectId: project1.id,
            team: Team.SOFTWARE,
            allowCrossTeamComments: true,
            tickets: {
                create: [
                    {
                        title: 'Setup React Frontend',
                        technicalSpecs: 'Initialize Vite + React project',
                        priority: TicketPriority.P1,
                        status: TicketStatus.PLANNING,
                        creator: { connect: { id: admin.id } }
                    },
                    {
                        title: 'Integrate GraphQL',
                        technicalSpecs: 'Setup Apollo Client',
                        priority: TicketPriority.P0,
                        status: TicketStatus.IN_PROGRESS,
                        assignees: { connect: [{ id: swLead.id }, { id: swEng.id }] },
                        creator: { connect: { id: admin.id } }
                    },
                ],
            },
        },
    });

    const scopeStruct = await prisma.scope.create({
        data: {
            projectId: project1.id,
            team: Team.STRUCTURAL,
            allowCrossTeamComments: true,
            tickets: {
                create: [
                    {
                        title: 'Analyze Beam Load',
                        technicalSpecs: 'Calculate max load for main beams',
                        priority: TicketPriority.P2,
                        status: TicketStatus.AWAITING_REVIEW,
                        assignees: { connect: [{ id: structEng.id }] },
                        creator: { connect: { id: structLead.id } }
                    },
                ],
            },
        },
    });

    // Project 2 Scope
    await prisma.scope.create({
        data: {
            projectId: project2.id,
            team: Team.SOFTWARE,
            allowCrossTeamComments: true,
            tickets: {
                create: [
                    {
                        title: 'BioGas Dashboard',
                        technicalSpecs: 'Create main dashboard view',
                        priority: TicketPriority.P1,
                        status: TicketStatus.PLANNING,
                        creator: { connect: { id: swLead.id } }
                    }
                ]
            }
        }
    });

    console.log('Seeding completed');
}

if (require.main === module) {
    seed()
        .then(async () => {
            await prisma.$disconnect();
        })
        .catch(async (e) => {
            console.error(e);
            await prisma.$disconnect();
            process.exit(1);
        });
}
