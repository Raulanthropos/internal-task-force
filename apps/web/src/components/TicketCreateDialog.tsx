import { useState } from 'react';
import { useQuery, useMutation, gql } from 'urql';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const GET_ENGINEERS = gql`
  query GetEngineers($team: Team!) {
    getEngineers(team: $team) {
      id
      username
    }
  }
`;

const CREATE_TICKET_MUTATION = gql`
  mutation CreateTicket($scopeId: String!, $title: String!, $technicalSpecs: String, $priority: TicketPriority!) {
    createTicket(scopeId: $scopeId, title: $title, technicalSpecs: $technicalSpecs, priority: $priority) {
      id
      title
      status
      priority
    }
  }
`;

const ASSIGN_TICKET_MUTATION = gql`
  mutation AssignTicket($ticketId: String!, $userIds: [String!]!) {
    assignTicket(ticketId: $ticketId, userIds: $userIds) {
      id
      assignees {
        username
      }
    }
  }
`;

interface TicketCreateDialogProps {
    scopeId: string;
    team: string; // The team of the scope
    onTicketCreated?: () => void;
}

export function TicketCreateDialog({ scopeId, team, onTicketCreated }: TicketCreateDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [specs, setSpecs] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [priority, setPriority] = useState('P2');

    const [{ data: engineersData }] = useQuery({
        query: GET_ENGINEERS,
        variables: { team: team },
        pause: !open // Only fetch when open
    });

    const [, createTicket] = useMutation(CREATE_TICKET_MUTATION);
    const [, assignTicket] = useMutation(ASSIGN_TICKET_MUTATION);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        // Create Ticket
        const res = await createTicket({
            scopeId,
            title,
            technicalSpecs: specs,
            priority
        });

        if (res.data?.createTicket) {
            const ticketId = res.data.createTicket.id;
            // Assign Users
            if (selectedAssignees.length > 0) {
                await assignTicket({ ticketId, userIds: selectedAssignees });
            }

            setOpen(false);
            setTitle('');
            setSpecs('');
            setSelectedAssignees([]);
            setPriority('P2');
            onTicketCreated?.();
        }
    };

    const toggleAssignee = (userId: string) => {
        setSelectedAssignees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">+ Add Ticket</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>
                        Add a new ticket to this scope.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">
                            Priority
                        </Label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="P0">P0 - Critical</SelectItem>
                                <SelectItem value="P1">P1 - High</SelectItem>
                                <SelectItem value="P2">P2 - Normal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="specs" className="text-right">
                            Specs
                        </Label>
                        <Textarea
                            id="specs"
                            value={specs}
                            onChange={(e) => setSpecs(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Assignees
                        </Label>
                        <div className="col-span-3 border rounded-md p-2 max-h-32 overflow-y-auto space-y-2">
                            {engineersData?.getEngineers.map((engineer: any) => (
                                <div key={engineer.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={engineer.id}
                                        checked={selectedAssignees.includes(engineer.id)}
                                        onChange={() => toggleAssignee(engineer.id)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor={engineer.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {engineer.username}
                                    </label>
                                </div>
                            ))}
                            {!engineersData?.getEngineers?.length && (
                                <div className="text-xs text-gray-500 italic">No engineers found in this team.</div>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Create Ticket</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
