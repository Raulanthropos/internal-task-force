import { useState, useEffect } from 'react';
import { useMutation, gql } from 'urql';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicket($ticketId: String!, $title: String, $technicalSpecs: String, $priority: TicketPriority) {
    updateTicket(ticketId: $ticketId, title: $title, technicalSpecs: $technicalSpecs, priority: $priority) {
      id
      title
      technicalSpecs
      priority
    }
  }
`;

interface TicketEditDialogProps {
    ticketId: string;
    initialTitle: string;
    initialSpecs?: string;
    initialPriority: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TicketEditDialog({
    ticketId,
    initialTitle,
    initialSpecs,
    initialPriority,
    open,
    onOpenChange
}: TicketEditDialogProps) {
    const [title, setTitle] = useState(initialTitle);
    const [specs, setSpecs] = useState(initialSpecs || '');
    const [priority, setPriority] = useState(initialPriority);

    const [{ fetching }, updateTicket] = useMutation(UPDATE_TICKET_MUTATION);

    useEffect(() => {
        if (open) {
            setTitle(initialTitle);
            setSpecs(initialSpecs || '');
            setPriority(initialPriority);
        }
    }, [open, initialTitle, initialSpecs, initialPriority]);

    const handleSubmit = async () => {
        if (!title.trim()) return;

        await updateTicket({
            ticketId,
            title,
            technicalSpecs: specs,
            priority
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Ticket</DialogTitle>
                    <DialogDescription>
                        Make changes to the ticket details.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-priority" className="text-right">
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
                        <Label htmlFor="edit-specs" className="text-right">
                            Specs
                        </Label>
                        <Textarea
                            id="edit-specs"
                            value={specs}
                            onChange={(e) => setSpecs(e.target.value)}
                            className="col-span-3 h-32"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={fetching}>
                        {fetching ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
