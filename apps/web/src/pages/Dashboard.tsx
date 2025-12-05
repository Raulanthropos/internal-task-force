import { useQuery, gql, useMutation } from 'urql';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ModeToggle } from '@/components/mode-toggle';

const PROJECTS_QUERY = gql`
  query Projects {
    me {
      id
      username
      role
      team
    }
    projects {
      id
      codeName
      client
      status
      scopes {
        id
        team
        allowCrossTeamComments
        tickets {
          id
          technical_specs
        }
        comments {
          id
          content
          createdAt
          user {
            username
          }
        }
      }
    }
  }
`;

const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($scopeId: String!, $content: String!) {
    addComment(scopeId: $scopeId, content: $content) {
      id
      content
      createdAt
      user {
        username
      }
    }
  }
`;

const TOGGLE_SCOPE_COMMENTS_MUTATION = gql`
  mutation ToggleScopeComments($scopeId: String!) {
    toggleScopeComments(scopeId: $scopeId) {
      id
      allowCrossTeamComments
    }
  }
`;

export default function Dashboard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [result] = useQuery({ query: PROJECTS_QUERY });
    const [{ fetching: loggingOut }, logout] = useMutation(gql`
        mutation Logout {
            logout
        }
    `);
    const [, addComment] = useMutation(ADD_COMMENT_MUTATION);
    const [, toggleScopeComments] = useMutation(TOGGLE_SCOPE_COMMENTS_MUTATION);

    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

    const handleLogout = async () => {
        const res = await logout({});
        if (res.data?.logout) {
            navigate('/login');
        }
    };

    const handleAddComment = async (scopeId: string) => {
        const content = commentInputs[scopeId];
        if (!content?.trim()) return;

        await addComment({ scopeId, content });
        setCommentInputs(prev => ({ ...prev, [scopeId]: '' }));
    };

    const handleToggleComments = async (scopeId: string) => {
        await toggleScopeComments({ scopeId });
    };

    if (result.fetching) return <div className="p-8 text-center">{t('login.loading')}</div>;
    if (result.error) return <div className="p-8 text-red-500">Error: {result.error.message}</div>;

    const { me, projects } = result.data;

    // Helper to check if user can comment
    const canComment = (scope: any) => {
        if (me.role === 'ADMIN') return true;
        if (me.team === scope.team) return true;
        return scope.allowCrossTeamComments;
    };

    // Helper to check if user can toggle
    const canToggle = (scope: any) => {
        if (me.role === 'ADMIN') return true;
        if (me.role === 'LEAD' && me.team === scope.team) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="border-b bg-white dark:bg-gray-800 px-8 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {t('dashboard.title')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('dashboard.welcome', { user: me.username })}
                        <Badge variant="outline" className="ml-2 gap-1">
                            {t(`roles.${me.role}`)} • {me.team ? t(`teams.${me.team}`) : 'N/A'}
                        </Badge>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ModeToggle />
                    <Button variant="outline" onClick={handleLogout}>{t('dashboard.logout')}</Button>
                </div>
            </div>

            <div className="p-8 space-y-6">
                {projects.length === 0 ? (
                    <Card className="p-12 text-center text-gray-500">
                        {t('dashboard.no_projects')}
                    </Card>
                ) : (
                    projects.map((project: any) => (
                        <Card key={project.id} className="overflow-hidden border shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {project.codeName}
                                            <Badge className={project.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}>
                                                {project.status}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="mt-1 font-medium text-gray-600 dark:text-gray-300">
                                            {t('common.client')}: {project.client}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/30 dark:bg-gray-800/30">
                                            <TableHead className="w-[15%]">{t('common.team')}</TableHead>
                                            <TableHead className="w-[35%]">{t('common.scope')}</TableHead>
                                            <TableHead className="w-[50%]">Comments</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.scopes.length > 0 ? (
                                            project.scopes.map((scope: any) => (
                                                <TableRow key={scope.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <TableCell className="font-medium align-top py-4">
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {t(`teams.${scope.team}`)}
                                                        </Badge>
                                                        {canToggle(scope) && (
                                                            <div className="mt-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleToggleComments(scope.id)}
                                                                    className="text-xs h-6 px-2"
                                                                >
                                                                    {scope.allowCrossTeamComments ? 'Lock Comments' : 'Unlock Comments'}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top py-4">
                                                        {scope.tickets.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {scope.tickets.map((ticket: any) => (
                                                                    <div key={ticket.id} className="bg-white dark:bg-gray-900 p-3 rounded-lg border text-sm shadow-sm group-hover:border-gray-300 transition-colors">
                                                                        <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                            Ticket
                                                                        </div>
                                                                        {ticket.technical_specs}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic text-sm">{t('common.no_tickets')}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top py-4 bg-gray-50/20 dark:bg-gray-800/20">
                                                        <div className="space-y-4">
                                                            <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2">
                                                                {scope.comments.length > 0 ? (
                                                                    scope.comments.map((comment: any) => (
                                                                        <div key={comment.id} className="text-sm bg-white dark:bg-gray-900 p-3 rounded-lg border shadow-sm">
                                                                            <div className="flex justify-between items-center mb-1 text-xs text-gray-500">
                                                                                <span className="font-semibold text-gray-700 dark:text-gray-300">{comment.user.username}</span>
                                                                                <span>{new Date(parseInt(comment.createdAt)).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <p className="text-gray-800 dark:text-gray-200">{comment.content}</p>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-xs text-gray-400 italic text-center py-2">No comments yet</div>
                                                                )}
                                                            </div>

                                                            {canComment(scope) ? (
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="Add a comment..."
                                                                        value={commentInputs[scope.id] || ''}
                                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [scope.id]: e.target.value }))}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleAddComment(scope.id);
                                                                        }}
                                                                        className="h-9 text-sm"
                                                                    />
                                                                    <Button size="sm" onClick={() => handleAddComment(scope.id)} className="h-9 w-9 p-0">
                                                                        <span className="sr-only">Send</span>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-400 italic text-center border-t pt-2">
                                                                    Commenting restricted
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                                    {t('common.no_scopes')}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
