import 'dotenv/config';
import express from 'express';
import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient, Role, Team } from '@prisma/client';
import { signToken, verifyPassword, getUser } from './auth';

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5179'],
  credentials: true
}));
app.use(cookieParser());

const typeDefs = `
  enum Role {
    ADMIN
    LEAD
    ENGINEER
  }

  enum Team {
    SOFTWARE
    STRUCTURAL
    ELECTRICAL
    ENVIRONMENTAL
  }

  type User {
    id: String!
    username: String!
    role: Role!
    team: Team
  }

  type Ticket {
    id: String!
    technical_specs: String
  }

  type Comment {
    id: String!
    content: String!
    user: User!
    createdAt: String!
  }

  type Scope {
    id: String!
    team: Team!
    tickets: [Ticket!]!
    comments: [Comment!]!
    allowCrossTeamComments: Boolean!
  }

  type Project {
    id: String!
    codeName: String!
    client: String!
    status: String!
    scopes: [Scope!]!
  }

  type LoginResponse {
    user: User!
  }

  type Query {
    me: User
    projects: [Project!]!
  }

  type Mutation {
    login(username: String!, password: String!): LoginResponse!
    logout: Boolean!
    addComment(scopeId: String!, content: String!): Comment!
    toggleScopeComments(scopeId: String!): Scope!
  }
`;

const resolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      if (!context.user) return null;
      return prisma.user.findUnique({ where: { id: context.user.userId } });
    },
    projects: async (parent: any, args: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const { role, team } = context.user;
      console.log('Fetching projects for user:', context.user);

      try {
        return await prisma.project.findMany({
          include: {
            scopes: {
              where: role === 'ADMIN' ? {} : { team: team },
              include: {
                tickets: true,
                comments: {
                  include: {
                    user: true
                  },
                  orderBy: {
                    createdAt: 'desc'
                  }
                }
              }
            }
          }
        });
      } catch (e) {
        console.error('Error fetching projects:', e);
        throw e;
      }
    }
  },
  Mutation: {
    login: async (parent: any, { username, password }: any, { res }: any) => {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const valid = await verifyPassword(password, user.passwordHash);

      if (!valid) {
        throw new Error('Invalid credentials');
      }

      const token = signToken(user.id, user.role, user.team);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      return { user };
    },
    logout: (parent: any, args: any, { res }: any) => {
      res.clearCookie('token');
      return true;
    },
    addComment: async (parent: any, { scopeId, content }: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const scope = await prisma.scope.findUnique({ where: { id: scopeId } });
      if (!scope) throw new Error('Scope not found');

      const { role, team, userId } = context.user;

      const isTeamMember = team === scope.team;
      const isAdmin = role === 'ADMIN';
      const isCrossTeamAllowed = scope.allowCrossTeamComments;

      if (!isTeamMember && !isAdmin && !isCrossTeamAllowed) {
        throw new Error('Forbidden: You do not have permission to comment on this scope.');
      }

      return prisma.comment.create({
        data: {
          content,
          scopeId,
          userId,
        },
        include: {
          user: true
        }
      });
    },
    toggleScopeComments: async (parent: any, { scopeId }: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const { role, team } = context.user;
      const scope = await prisma.scope.findUnique({ where: { id: scopeId } });
      if (!scope) throw new Error('Scope not found');

      // Only Admin or Lead of the owning team can toggle
      const isTeamLead = role === 'LEAD' && team === scope.team;
      const isAdmin = role === 'ADMIN';

      if (!isTeamLead && !isAdmin) {
        throw new Error('Forbidden: Only Admins or Team Leads can toggle comments.');
      }

      return prisma.scope.update({
        where: { id: scopeId },
        data: { allowCrossTeamComments: !scope.allowCrossTeamComments },
        include: { tickets: true, comments: { include: { user: true } } }
      });
    }
  }
};

const schema = createSchema({
  typeDefs,
  resolvers
});

const yoga = createYoga({
  schema,
  maskedErrors: false,
  context: async (ctx: YogaInitialContext & { req: any; res: any }) => {
    const token = ctx.req.cookies?.token;
    if (token) console.log('Token received');
    const user = getUser(token);
    return { ...ctx, prisma, user, res: ctx.res };
  }
});

app.use('/graphql', yoga as any);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
