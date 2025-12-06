import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from 'urql';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GET_ENGINEERS = gql`
  query GetEngineers($team: Team!) {
    getEngineers(team: $team) {
      id
      username
      fullName
    }
  }
`;

const ASSIGN_TICKET_MUTATION = gql`
  mutation AssignTicket($ticketId: String!, $userIds: [String!]!) {
    assignTicket(ticketId: $ticketId, userIds: $userIds) {
      id
      assignees {
        id
        username
        fullName
      }
    }
  }
`;

interface AssigneeSelectDialogProps {
    ticketId: string;
    team: string; // To fetch relevant engineers
    currentAssignees: string[]; // List of IDs
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssigneeSelectDialog({
    ticketId,
    team,
    currentAssignees,
    open,
    onOpenChange
}: AssigneeSelectDialogProps) {
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

    // Reset selection when dialog opens or props change
    useEffect(() => {
        if (open) {
            setSelectedAssignees(currentAssignees);
        }
    }, [open, currentAssignees]);

    const [{ data, fetching }] = useQuery({
        query: GET_ENGINEERS,
        variables: { team },
        pause: !open
    });

    const [{ fetching: saving }, assignTicket] = useMutation(ASSIGN_TICKET_MUTATION);

    const toggleAssignee = (userId: string) => {
        setSelectedAssignees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = async () => {
        await assignTicket({ ticketId, userIds: selectedAssignees });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Assignees</DialogTitle>
                    <DialogDescription>
                        Select engineers to assign to this ticket.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {fetching ? (
                        <div className="text-center py-4 text-sm text-gray-500">Loading engineers...</div>
                    ) : (
                        <div className="border rounded-md p-2 max-h-60 overflow-y-auto space-y-2">
                            {data?.getEngineers.map((engineer: any) => (
                                <div key={engineer.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                                    <input
                                        type="checkbox"
                                        id={`assignee-${engineer.id}`}
                                        checked={selectedAssignees.includes(engineer.id)}
                                        onChange={() => toggleAssignee(engineer.id)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label
                                        htmlFor={`assignee-${engineer.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                    >
                                        <div className="font-semibold">{engineer.fullName || engineer.username}</div>
                                        {engineer.fullName && <div className="text-xs text-gray-400">@{engineer.username}</div>}
                                    </label>
                                </div>
                            ))}
                            {!data?.getEngineers?.length && (
                                <div className="text-sm text-gray-500 italic text-center py-2">No engineers found in this team.</div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Assignment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
