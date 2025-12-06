import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";
import { TicketCreateDialog } from "../components/TicketCreateDialog";
import { TicketEditDialog } from "../components/TicketEditDialog";
import { AssigneeSelectDialog } from "../components/AssigneeSelectDialog";
import { ClientSidebar } from "../components/ClientSidebar";
import { NotificationBell } from "../components/NotificationBell";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Pencil,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Queries & Mutations

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      fullName
      role
      team
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      id
      codeName
      status
      client {
        name
        logoUrl
      }
      scopes {
        id
        team
        allowCrossTeamComments
        tickets {
          id
          title
          technicalSpecs
          status
          priority
          assignees {
            id
            username
            fullName
          }
          creator {
            id
            username
            fullName
          }
        }
        comments {
          id
          content
          createdAt
          user {
            id
            username
            fullName
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
      user {
        username
      }
    }
  }
`;

const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($commentId: String!, $content: String!) {
    updateComment(commentId: $commentId, content: $content) {
      id
      content
    }
  }
`;

const UPDATE_TICKET_STATUS_MUTATION = gql`
  mutation UpdateTicketStatus($ticketId: String!, $status: TicketStatus!) {
    updateTicketStatus(ticketId: $ticketId, status: $status) {
      id
      status
    }
  }
`;

export function Dashboard() {
  const [{ data: meData }] = useQuery({ query: ME_QUERY });
  const [
    { data: projectsData, fetching: projectsFetching },
    reexecuteProjects,
  ] = useQuery({ query: PROJECTS_QUERY });
  const [, logout] = useMutation(LOGOUT_MUTATION);
  const [, addComment] = useMutation(ADD_COMMENT_MUTATION);
  const [, updateComment] = useMutation(UPDATE_COMMENT_MUTATION);
  const [, updateTicketStatus] = useMutation(UPDATE_TICKET_STATUS_MUTATION);

  const navigate = useNavigate();
  const [_loggingOut, setLoggingOut] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  // Dialog States
  const [editTicket, setEditTicket] = useState<any | null>(null);
  const [assignTicket, setAssignTicket] = useState<any | null>(null);

  // Comment Editing State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [expandedScopes, setExpandedScopes] = useState<Record<string, boolean>>(
    {}
  );

  const toggleScope = (scopeId: string) => {
    setExpandedScopes((prev) => ({ ...prev, [scopeId]: !prev[scopeId] }));
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout({});
    navigate("/login");
  };

  const handleCommentSubmit = async (scopeId: string) => {
    const content = commentInputs[scopeId];
    if (!content?.trim()) return;

    await addComment({ scopeId, content });
    setCommentInputs((prev) => ({ ...prev, [scopeId]: "" }));
  };

  const handleUpdateStatus = async (ticketId: string, val: string) => {
    await updateTicketStatus({ ticketId, status: val });
  };

  const startEditingComment = (id: string, content: string) => {
    setEditingCommentId(id);
    setEditingCommentContent(content);
  };

  const saveEditedComment = async (id: string) => {
    if (!editingCommentContent.trim()) return;
    await updateComment({ commentId: id, content: editingCommentContent });
    setEditingCommentId(null);
  };

  if (projectsFetching) return <div className="p-8">Loading dashboard...</div>;
  if (!meData?.me) return <div className="p-8">Redirecting...</div>;

  const { role, team, id: myId } = meData.me;
  const canManageTickets = role === "ADMIN" || role === "LEAD";

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "P0":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "P1":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "P2":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <ClientSidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden ml-16">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <h1 className="flex-1 font-semibold text-lg">
            Welcome, {meData.me.fullName || meData.me.username}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({role} - {team || "Global"})
            </span>
          </h1>
          <NotificationBell />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid gap-6">
            {projectsData?.projects.map((project: any) => (
              <Card key={project.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{project.codeName}</CardTitle>
                      <CardDescription>
                        Client: {project.client.name} | Status: {project.status}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        project.status === "IN_PROGRESS"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={project.scopes[0]?.id}>
                    <TabsList className="mb-4">
                      {project.scopes.map((scope: any) => (
                        <TabsTrigger key={scope.id} value={scope.id}>
                          {scope.team} Team
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {project.scopes.map((scope: any) => (
                      <TabsContent
                        key={scope.id}
                        value={scope.id}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                          <h3 className="font-semibold">Tickets</h3>
                          {canManageTickets &&
                            (role === "ADMIN" || team === scope.team) && (
                              <TicketCreateDialog
                                scopeId={scope.id}
                                team={scope.team}
                                onTicketCreated={() =>
                                  reexecuteProjects({
                                    requestPolicy: "network-only",
                                  })
                                }
                              />
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {scope.tickets.map((ticket: any) => (
                            <Card
                              key={ticket.id}
                              className="p-4 flex flex-col justify-between"
                            >
                              <div className="mb-2 flex justify-between items-start">
                                <h4 className="font-bold">{ticket.title}</h4>
                                <div className="flex gap-1">
                                  {(myId === ticket.creator?.id ||
                                    canManageTickets) && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
                                      onClick={() => setEditTicket(ticket)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Badge
                                    className={`${getPriorityColor(ticket.priority || "P2")} text-white text-[10px] px-1 py-0`}
                                  >
                                    {ticket.priority === "P0"
                                      ? "CRITICAL"
                                      : ticket.priority === "P1"
                                        ? "HIGH"
                                        : "NORMAL"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="text-sm text-gray-500 mb-4 line-clamp-3 whitespace-pre-wrap">
                                {ticket.technicalSpecs}
                              </div>

                              <div className="flex justify-between items-center mt-auto pt-2 border-t">
                                <Select
                                  defaultValue={ticket.status}
                                  onValueChange={(val) =>
                                    handleUpdateStatus(ticket.id, val)
                                  }
                                  disabled={
                                    role === "ENGINEER" &&
                                    ![
                                      "IN_PROGRESS",
                                      "AWAITING_REVIEW",
                                    ].includes(ticket.status) &&
                                    [
                                      "PLANNING",
                                      "COMPLETED",
                                      "REJECTED",
                                    ].includes(ticket.status)
                                  }
                                >
                                  <SelectTrigger className="h-7 w-[130px] text-xs">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PLANNING">
                                      Planning
                                    </SelectItem>
                                    <SelectItem value="IN_PROGRESS">
                                      In Progress
                                    </SelectItem>
                                    <SelectItem value="AWAITING_REVIEW">
                                      Review
                                    </SelectItem>
                                    <SelectItem value="COMPLETED">
                                      Completed
                                    </SelectItem>
                                    <SelectItem value="REJECTED">
                                      Rejected
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                <div className="flex items-center justify-between relative">
                                    <div className="flex gap-2">
                                  <TooltipProvider>
                                    {ticket.assignees?.map((assignee: any) => (
                                      <Tooltip key={assignee.id}>
                                        <TooltipTrigger>
                                          <Avatar className="h-6 w-6 border-2 border-background">
                                            <AvatarImage
                                              src={`https://ui-avatars.com/api/?name=${assignee.username}&background=random`}
                                            />
                                            <AvatarFallback>
                                              {getInitials(
                                                assignee.fullName ||
                                                  assignee.username
                                              )}
                                            </AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {assignee.fullName ||
                                              assignee.username}{" "}
                                            (@{assignee.username})
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))}
                                  </TooltipProvider>
                                    </div>
                                  {canManageTickets &&
                                    (role === "ADMIN" ||
                                      team === scope.team) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity ml-2"
                                        onClick={() =>
                                          setAssignTicket({
                                            ...ticket,
                                            team: scope.team,
                                          })
                                        }
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    )}
                                </div>
                              </div>
                            </Card>
                          ))}
                          {!scope.tickets.length && (
                            <div className="text-sm text-gray-500 italic">
                              No tickets yet.
                            </div>
                          )}
                        </div>

                        <div className="mt-6 border-t pt-4">
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 p-0 h-auto font-semibold hover:bg-transparent mb-2"
                            onClick={() => toggleScope(scope.id)}
                          >
                            {expandedScopes[scope.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            Scope Discussion
                          </Button>

                          {expandedScopes[scope.id] && (
                            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 bg-muted/20 p-2 rounded">
                                {scope.comments.map((comment: any) => (
                                  <div
                                    key={comment.id}
                                    className="text-sm p-2 bg-background rounded border shadow-sm group"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold">
                                          {comment.user.fullName ||
                                            comment.user.username}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(
                                            Number(comment.createdAt)
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                      {comment.user.id === myId &&
                                        editingCommentId !== comment.id && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() =>
                                              startEditingComment(
                                                comment.id,
                                                comment.content
                                              )
                                            }
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                        )}
                                    </div>

                                    {editingCommentId === comment.id ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        <Input
                                          value={editingCommentContent}
                                          onChange={(e) =>
                                            setEditingCommentContent(
                                              e.target.value
                                            )
                                          }
                                          className="h-8 text-sm"
                                        />
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-green-600"
                                          onClick={() =>
                                            saveEditedComment(comment.id)
                                          }
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-red-600"
                                          onClick={() =>
                                            setEditingCommentId(null)
                                          }
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <p>{comment.content}</p>
                                    )}
                                  </div>
                                ))}
                                {!scope.comments.length && (
                                  <div className="text-sm text-gray-500 italic">
                                    No comments yet.
                                  </div>
                                )}
                              </div>

                              {role === "ADMIN" ||
                              team === scope.team ||
                              scope.allowCrossTeamComments ? (
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={commentInputs[scope.id] || ""}
                                    onChange={(e) =>
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [scope.id]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) =>
                                      e.key === "Enter" &&
                                      handleCommentSubmit(scope.id)
                                    }
                                  />
                                  <Button
                                    onClick={() =>
                                      handleCommentSubmit(scope.id)
                                    }
                                  >
                                    Send
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-sm text-red-500 italic">
                                  Comments locked for cross-team viewing.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {editTicket && (
        <TicketEditDialog
          open={!!editTicket}
          onOpenChange={(open) => !open && setEditTicket(null)}
          ticketId={editTicket.id}
          initialTitle={editTicket.title}
          initialSpecs={editTicket.technicalSpecs}
          initialPriority={editTicket.priority || "P2"}
        />
      )}

      {assignTicket && (
        <AssigneeSelectDialog
          open={!!assignTicket}
          onOpenChange={(open) => !open && setAssignTicket(null)}
          ticketId={assignTicket.id}
          team={assignTicket.team || "SOFTWARE"}
          currentAssignees={assignTicket.assignees?.map((u: any) => u.id) || []}
        />
      )}
    </div>
  );
}
