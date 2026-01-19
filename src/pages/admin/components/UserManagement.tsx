import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
} from "lucide-react";
import {
  usersApi,
  type User,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/services/users.service";
import { useConfirm } from "@/hooks/useConfirm";

interface UserManagementProps {
  showToast: (
    title: string,
    description: string,
    type: "success" | "error"
  ) => void;
}

type UserFormData = {
  username: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "member";
};

export function UserManagement({
  showToast,
}: UserManagementProps): React.ReactElement {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "member">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
  const [changingRoleUserId, setChangingRoleUserId] = useState<number | null>(
    null
  );

  const confirm = useConfirm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll({
        page,
        limit: 10,
        search: searchQuery || undefined,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      showToast("Error", error.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, roleFilter, statusFilter]);

  const handleCreateUser = () => {
    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "member",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);

      if (editingUser) {
        // Update user
        const updateData: UpdateUserInput = {
          username:
            formData.username !== editingUser.username
              ? formData.username
              : undefined,
          name: formData.name !== editingUser.name ? formData.name : undefined,
          email:
            formData.email !== editingUser.email ? formData.email : undefined,
          password: formData.password ? formData.password : undefined,
          role: formData.role !== editingUser.role ? formData.role : undefined,
        };

        // Remove undefined fields
        Object.keys(updateData).forEach((key) => {
          if (updateData[key as keyof UpdateUserInput] === undefined) {
            delete updateData[key as keyof UpdateUserInput];
          }
        });

        await usersApi.update(editingUser.id, updateData);
        showToast("Success", "User updated successfully", "success");
        setIsEditDialogOpen(false);
      } else {
        // Create user
        const createData: CreateUserInput = {
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        await usersApi.create(createData);
        showToast("Success", "User created successfully", "success");
        setIsCreateDialogOpen(false);
      }

      fetchUsers();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to save user", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmed = await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      type: "danger",
    });

    if (!confirmed) return;

    try {
      setDeletingUserId(user.id);
      await usersApi.delete(user.id);
      showToast("Success", "User deleted successfully", "success");
      fetchUsers();
    } catch (error: any) {
      showToast("Error", error.message || "Failed to delete user", "error");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.isActive;
    const action = newStatus ? "activate" : "deactivate";

    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${user.name}?`,
      type: "warning",
    });

    if (!confirmed) return;

    try {
      setTogglingUserId(user.id);
      await usersApi.toggleStatus(user.id, newStatus);
      showToast("Success", `User ${action}d successfully`, "success");
      fetchUsers();
    } catch (error: any) {
      showToast("Error", error.message || `Failed to ${action} user`, "error");
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleChangeRole = async (user: User, newRole: "admin" | "member") => {
    const confirmed = await confirm({
      title: "Change User Role",
      message: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      type: "warning",
    });

    if (!confirmed) return;

    try {
      setChangingRoleUserId(user.id);
      await usersApi.updateRole(user.id, newRole);
      showToast("Success", "User role updated successfully", "success");
      fetchUsers();
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Failed to update user role",
        "error"
      );
    } finally {
      setChangingRoleUserId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            User Management
          </CardTitle>
          <CardDescription>
            View, create, edit, and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
                <div className="relative flex-1 w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(value: any) => {
                    setRoleFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value: any) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {(searchQuery ||
                  roleFilter !== "all" ||
                  statusFilter !== "all") && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear
                  </Button>
                )}
              </div>
              <Button
                onClick={handleCreateUser}
                className="cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* User List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
                <p className="text-sm mt-2">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first user to get started"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <Card
                    key={user.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground truncate">
                                {user.name}
                              </h3>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "default"
                                    : "secondary"
                                }
                                className="flex-shrink-0"
                              >
                                {user.role === "admin" ? (
                                  <Shield className="w-3 h-3 mr-1" />
                                ) : (
                                  <ShieldOff className="w-3 h-3 mr-1" />
                                )}
                                {user.role}
                              </Badge>
                              <Badge
                                variant={
                                  user.isActive ? "default" : "destructive"
                                }
                                className="flex-shrink-0"
                              >
                                {user.isActive ? (
                                  <UserCheck className="w-3 h-3 mr-1" />
                                ) : (
                                  <UserX className="w-3 h-3 mr-1" />
                                )}
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              @{user.username}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Joined{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleChangeRole(
                                user,
                                user.role === "admin" ? "member" : "admin"
                              )
                            }
                            disabled={changingRoleUserId === user.id}
                            className="cursor-pointer"
                            title={`Change to ${
                              user.role === "admin" ? "member" : "admin"
                            }`}
                          >
                            {changingRoleUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.role === "admin" ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingUserId === user.id}
                            className="cursor-pointer"
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {togglingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUserId === user.id}
                            className="cursor-pointer text-destructive hover:text-destructive"
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingUser(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user information. Leave password blank to keep unchanged."
                : "Fill in the details to create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="johndoe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editingUser && "(leave blank to keep unchanged)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={editingUser ? "••••••••" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "member") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingUser(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingUser ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
