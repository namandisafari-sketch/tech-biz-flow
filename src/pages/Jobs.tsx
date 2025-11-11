import Layout from "@/components/Layout";
import JobStatusBadge from "@/components/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const jobs = [
  {
    id: "JOB-001",
    customer: "John Doe",
    phone: "+256 700 123456",
    device: "iPhone 13 Pro",
    issue: "Screen replacement",
    status: "repairing" as const,
    assignee: "Mike Tech",
    priority: "urgent",
    created: "2024-01-15",
    dueDate: "2024-01-16",
  },
  {
    id: "JOB-002",
    customer: "Jane Smith",
    phone: "+256 700 234567",
    device: "MacBook Air",
    issue: "Battery replacement",
    status: "ready" as const,
    assignee: "Sarah Tech",
    priority: "normal",
    created: "2024-01-14",
    dueDate: "2024-01-16",
  },
  {
    id: "JOB-003",
    customer: "Bob Johnson",
    phone: "+256 700 345678",
    device: "Samsung S23",
    issue: "Water damage repair",
    status: "diagnosing" as const,
    assignee: "Mike Tech",
    priority: "high",
    created: "2024-01-15",
    dueDate: "2024-01-17",
  },
  {
    id: "JOB-004",
    customer: "Alice Brown",
    phone: "+256 700 456789",
    device: "iPad Pro",
    issue: "Charging port issue",
    status: "received" as const,
    assignee: "Unassigned",
    priority: "normal",
    created: "2024-01-15",
    dueDate: "2024-01-18",
  },
  {
    id: "JOB-005",
    customer: "Charlie Wilson",
    phone: "+256 700 567890",
    device: "Dell XPS 15",
    issue: "Hard drive replacement",
    status: "repairing" as const,
    assignee: "Sarah Tech",
    priority: "normal",
    created: "2024-01-14",
    dueDate: "2024-01-17",
  },
];

export default function Jobs() {
  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all repair jobs
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job ID, customer, or device..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-mono font-medium">
                      {job.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.customer}</p>
                        <p className="text-xs text-muted-foreground">{job.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{job.device}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {job.issue}
                    </TableCell>
                    <TableCell>
                      <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          job.priority === "urgent"
                            ? "border-destructive/20 bg-destructive/10 text-destructive"
                            : job.priority === "high"
                            ? "border-warning/20 bg-warning/10 text-warning"
                            : "border-muted-foreground/20"
                        }
                      >
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.assignee}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(job.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash className="h-4 w-4" />
                            Cancel Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
