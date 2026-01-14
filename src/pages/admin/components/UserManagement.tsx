import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Plus } from "lucide-react";

export function UserManagement(): React.ReactElement {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          User Management
        </CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input placeholder="Search users..." className="max-w-sm" />
            <Button className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>User list will be displayed here</p>
            <p className="text-sm mt-2">Feature coming soon...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
