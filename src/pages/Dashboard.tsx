import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import JobStatusBadge from "@/components/JobStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wrench,
  DollarSign,
  Package,
  Users,
  Plus,
  TrendingUp,
  Clock,
} from "lucide-react";

// Sample data
const recentJobs = [
  {
    id: "JOB-001",
    customer: "John Doe",
    device: "iPhone 13 Pro",
    issue: "Screen replacement",
    status: "repairing" as const,
    assignee: "Mike Tech",
    dueDate: "Today",
  },
  {
    id: "JOB-002",
    customer: "Jane Smith",
    device: "MacBook Air",
    issue: "Battery replacement",
    status: "ready" as const,
    assignee: "Sarah Tech",
    dueDate: "Today",
  },
  {
    id: "JOB-003",
    customer: "Bob Johnson",
    device: "Samsung S23",
    issue: "Water damage repair",
    status: "diagnosing" as const,
    assignee: "Mike Tech",
    dueDate: "Tomorrow",
  },
  {
    id: "JOB-004",
    customer: "Alice Brown",
    device: "iPad Pro",
    issue: "Charging port issue",
    status: "received" as const,
    assignee: "Unassigned",
    dueDate: "Tomorrow",
  },
];

const lowStockItems = [
  { name: "iPhone 13 Screen", quantity: 2, reorderLevel: 5 },
  { name: "Samsung Battery", quantity: 3, reorderLevel: 5 },
  { name: "USB-C Charging Port", quantity: 4, reorderLevel: 10 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your shop overview.
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate("/jobs/new")}>
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Jobs"
            value={24}
            icon={Wrench}
            trend={{ value: "12% from last week", isPositive: true }}
            variant="default"
          />
          <StatCard
            title="Today's Revenue"
            value="UGX 2,450,000"
            icon={DollarSign}
            trend={{ value: "8% from yesterday", isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Low Stock Items"
            value={8}
            icon={Package}
            trend={{ value: "3 critical", isPositive: false }}
            variant="warning"
          />
          <StatCard
            title="Total Customers"
            value={186}
            icon={Users}
            trend={{ value: "5 new this week", isPositive: true }}
            variant="info"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Recent Jobs</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono font-medium">
                        {job.id}
                      </TableCell>
                      <TableCell>{job.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.device}
                      </TableCell>
                      <TableCell>
                        <JobStatusBadge status={job.status} />
                      </TableCell>
                      <TableCell>{job.assignee}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {job.dueDate}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="h-2 w-2 rounded-full bg-warning mt-2" />
                  <div>
                    <p className="text-sm font-medium">Urgent: 3 jobs due today</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JOB-001, JOB-002, JOB-007
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-info/10 border border-info/20">
                  <div className="h-2 w-2 rounded-full bg-info mt-2" />
                  <div>
                    <p className="text-sm font-medium">4 customers waiting</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send status updates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Package className="h-5 w-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} left
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning"
                        style={{
                          width: `${(item.quantity / item.reorderLevel) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Jobs Completed
                  </span>
                  <span className="text-lg font-bold">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="text-lg font-bold">UGX 8,450,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Time</span>
                  <span className="text-lg font-bold">2.4 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
