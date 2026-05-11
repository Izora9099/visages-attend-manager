import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { StudentCreateDialog } from "./StudentCreateDialog";
import {
  useDepartments,
  useSpecializations,
  useLevels,
  useStudents,
  useUpdateStudent,
  useDeleteStudent,
  useCreateStudent,
} from "@/hooks/queries";
import type { Student, StudentFilters } from "@/types";

// ─── Local types ──────────────────────────────────────────────────────────────

interface EditFormData {
  first_name: string;
  last_name: string;
  matric_number: string;
  email: string;
  phone: string;
  address: string;
  department: number;
  specialization: number;
  level: number;
  date_of_birth: string;
  gender: string;
  emergency_contact: string;
  emergency_phone: string;
}

type EditFormErrors = Partial<Record<keyof EditFormData, string>>;

const EMPTY_FORM: EditFormData = {
  first_name: "", last_name: "", matric_number: "", email: "",
  phone: "", address: "", department: 0, specialization: 0, level: 0,
  date_of_birth: "", gender: "", emergency_contact: "", emergency_phone: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "active":    return "default";
    case "graduated": return "secondary";
    case "suspended": return "destructive";
    default:          return "outline";
  }
}

function validateEditForm(data: EditFormData): EditFormErrors {
  const errors: EditFormErrors = {};
  if (!data.first_name.trim())    errors.first_name    = "First name is required";
  if (!data.last_name.trim())     errors.last_name     = "Last name is required";
  if (!data.matric_number.trim()) errors.matric_number = "Matriculation number is required";
  if (!data.email.trim())         errors.email         = "Email is required";
  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) errors.email = "Email is invalid";
  if (!data.department)           errors.department    = "Department is required";
  if (!data.level)                errors.level         = "Level is required";
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Students = () => {
  const [filters, setFilters] = useState<StudentFilters>({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [isCreateOpen,   setIsCreateOpen]   = useState(false);
  const [isEditOpen,     setIsEditOpen]     = useState(false);
  const [isViewOpen,     setIsViewOpen]     = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editForm,       setEditForm]       = useState<EditFormData>(EMPTY_FORM);
  const [editErrors,     setEditErrors]     = useState<EditFormErrors>({});

  // ── Queries ──
  const { data: departments = [] } = useDepartments();
  const { data: specializations = [] } = useSpecializations();
  const { data: levels = [] } = useLevels();
  const {
    data: studentsPage,
    isLoading,
    isError,
    refetch,
  } = useStudents({ ...filters, page, page_size: PAGE_SIZE });

  const students: Student[] = studentsPage?.results ?? [];
  const totalCount: number  = studentsPage?.count ?? 0;
  const totalPages          = Math.ceil(totalCount / PAGE_SIZE);

  // ── Mutations ──
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  // ── Handlers ──
  const handleFilterChange = (key: keyof StudentFilters, value: unknown) => {
    setFilters(prev => {
      const next = { ...prev };
      if (value === undefined || value === null || value === "" || value === "all") {
        delete next[key as keyof typeof next];
      } else {
        (next as Record<string, unknown>)[key] = value;
      }
      return next;
    });
    setPage(1);
  };

  const handleCreateFromDialog = async (data: EditFormData & { face_image: File }) => {
    try {
      await createStudent.mutateAsync(data as unknown as Record<string, unknown>);
      toast.success("Student created successfully.");
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create student.");
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      first_name:        student.first_name        ?? "",
      last_name:         student.last_name         ?? "",
      matric_number:     student.matric_number     ?? "",
      email:             student.email             ?? "",
      phone:             student.phone             ?? "",
      address:           student.address           ?? "",
      department:        student.department        ?? 0,
      specialization:    student.specialization    ?? 0,
      level:             student.level             ?? 0,
      date_of_birth:     student.date_of_birth     ?? "",
      gender:            student.gender            ?? "",
      emergency_contact: student.emergency_contact ?? "",
      emergency_phone:   student.emergency_phone   ?? "",
    });
    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    const errors = validateEditForm(editForm);
    if (Object.keys(errors).length) { setEditErrors(errors); return; }
    if (!editingStudent) return;

    try {
      await updateStudent.mutateAsync({
        id: editingStudent.id,
        data: { ...editForm, specialization: editForm.specialization || null } as Record<string, unknown>,
      });
      toast.success("Student updated successfully.");
      setIsEditOpen(false);
      setEditingStudent(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update student.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStudent.mutateAsync(deleteTarget.id);
      toast.success("Student deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete student.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const deptSpecializations = (deptId: number) =>
    specializations.filter((s: { department: number }) => s.department === deptId);

  // ── Render ──
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 pb-8 border-b border-hairline md:flex-row md:items-end md:justify-between animate-fade-up">
        <div className="space-y-2 max-w-2xl">
          <p className="eyebrow">Directory</p>
          <h1 className="display-serif text-4xl md:text-5xl leading-[1.05] text-balance">Students.</h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed pt-1">
            Manage enrolment, capture biometric data, and monitor attendance health.
          </p>
        </div>
        <Button variant="ink" size="lg" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search students..."
                  value={filters.search ?? ""}
                  onChange={e => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Department</Label>
              <Select
                value={filters.department?.toString() ?? "all"}
                onValueChange={v => handleFilterChange("department", v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="All departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d: { id: number; department_name: string }) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.department_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Specialization</Label>
              <Select
                value={filters.specialization?.toString() ?? "all"}
                onValueChange={v => handleFilterChange("specialization", v === "all" ? undefined : Number(v))}
                disabled={!filters.department}
              >
                <SelectTrigger><SelectValue placeholder="All specializations" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {deptSpecializations(filters.department ?? 0).map((s: { id: number; specialization_name: string }) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.specialization_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Level</Label>
              <Select
                value={filters.level?.toString() ?? "all"}
                onValueChange={v => handleFilterChange("level", v === "all" ? undefined : Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((l: { id: number; level_name: string }) => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.level_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={filters.status ?? "all"}
                onValueChange={v => handleFilterChange("status", v === "all" ? undefined : v)}
              >
                <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${totalCount} students found`}
            </span>
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isError && (
            <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/5 border-b border-hairline">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-sm">Failed to load students. Please try refreshing.</span>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Matric Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading students...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {Object.keys(filters).length > 0
                        ? "No students match the current filters."
                        : 'No students yet. Click "Add Student" to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.matric_number}`}
                              alt={student.full_name}
                            />
                            <AvatarFallback>
                              {student.first_name[0]}{student.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.full_name ?? `${student.first_name} ${student.last_name}`}</div>
                            <div className="text-sm text-muted-foreground">{student.specialization_name ?? "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{student.matric_number}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department_name ?? "—"}</TableCell>
                      <TableCell>{student.level_name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(student.status)} className="capitalize">{student.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium num">{student.attendance_rate}%</span>
                          <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-accent h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, student.attendance_rate))}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost" size="sm"
                            aria-label={`View ${student.full_name ?? student.first_name}`}
                            onClick={() => { setViewingStudent(student); setIsViewOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            aria-label={`Edit ${student.full_name ?? student.first_name}`}
                            onClick={() => openEdit(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            aria-label={`Delete ${student.full_name ?? student.first_name}`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(student)}
                            disabled={deleteStudent.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-hairline">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.full_name ?? `${deleteTarget?.first_name} ${deleteTarget?.last_name}`}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create dialog */}
      <StudentCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateFromDialog}
        departments={departments}
        specializations={specializations}
        levels={levels}
      />

      {/* Edit dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <EditForm
            form={editForm}
            errors={editErrors}
            departments={departments}
            specializations={specializations}
            levels={levels}
            onChange={patch => setEditForm(prev => ({ ...prev, ...patch }))}
            onDeptChange={id => setEditForm(prev => ({ ...prev, department: id, specialization: 0 }))}
          />
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingStudent(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateStudent.isPending}>
              {updateStudent.isPending
                ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                : "Update Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
          {viewingStudent && <StudentDetail student={viewingStudent} />}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => { setIsViewOpen(false); setViewingStudent(null); }}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface EditFormProps {
  form: EditFormData;
  errors: EditFormErrors;
  departments: Array<{ id: number; department_name: string }>;
  specializations: Array<{ id: number; specialization_name: string; department: number }>;
  levels: Array<{ id: number; level_name: string }>;
  onChange: (patch: Partial<EditFormData>) => void;
  onDeptChange: (id: number) => void;
}

function EditForm({ form, errors, departments, specializations, levels, onChange, onDeptChange }: EditFormProps) {
  const specs = form.department
    ? specializations.filter(s => s.department === form.department)
    : [];

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name *" error={errors.first_name}>
          <Input value={form.first_name} onChange={e => onChange({ first_name: e.target.value })}
            className={errors.first_name ? "border-destructive" : ""} placeholder="First name" />
        </Field>
        <Field label="Last Name *" error={errors.last_name}>
          <Input value={form.last_name} onChange={e => onChange({ last_name: e.target.value })}
            className={errors.last_name ? "border-destructive" : ""} placeholder="Last name" />
        </Field>
      </div>

      <Field label="Matriculation Number *" error={errors.matric_number}>
        <Input value={form.matric_number} onChange={e => onChange({ matric_number: e.target.value })}
          className={errors.matric_number ? "border-destructive" : ""} placeholder="Matric number" />
      </Field>

      <Field label="Email *" error={errors.email}>
        <Input type="email" value={form.email} onChange={e => onChange({ email: e.target.value })}
          className={errors.email ? "border-destructive" : ""} placeholder="Email" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone">
          <Input value={form.phone} onChange={e => onChange({ phone: e.target.value })} placeholder="Phone" />
        </Field>
        <Field label="Date of Birth">
          <Input type="date" value={form.date_of_birth} onChange={e => onChange({ date_of_birth: e.target.value })} />
        </Field>
      </div>

      <Field label="Address">
        <Input value={form.address} onChange={e => onChange({ address: e.target.value })} placeholder="Address" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender">
          <Select value={form.gender} onValueChange={v => onChange({ gender: v })}>
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Emergency Contact">
          <Input value={form.emergency_contact} onChange={e => onChange({ emergency_contact: e.target.value })}
            placeholder="Emergency contact" />
        </Field>
      </div>

      <Field label="Emergency Phone">
        <Input value={form.emergency_phone} onChange={e => onChange({ emergency_phone: e.target.value })}
          placeholder="Emergency phone" />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Department *" error={errors.department}>
          <Select value={form.department.toString()} onValueChange={v => onDeptChange(Number(v))}>
            <SelectTrigger className={errors.department ? "border-destructive" : ""}><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.department_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Specialization">
          <Select value={form.specialization.toString()} onValueChange={v => onChange({ specialization: Number(v) })}
            disabled={!form.department}>
            <SelectTrigger><SelectValue placeholder="Specialization" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">None</SelectItem>
              {specs.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.specialization_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Level *" error={errors.level}>
          <Select value={form.level.toString()} onValueChange={v => onChange({ level: Number(v) })}>
            <SelectTrigger className={errors.level ? "border-destructive" : ""}><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              {levels.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.level_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

function StudentDetail({ student }: { student: Student }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.matric_number}`} />
          <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{student.full_name ?? `${student.first_name} ${student.last_name}`}</h3>
          <p className="text-muted-foreground">{student.matric_number}</p>
          <Badge variant={statusBadgeVariant(student.status)} className="capitalize mt-1">{student.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {([
          ["Email", student.email],
          ["Phone", student.phone ?? "—"],
          ["Department", student.department_name ?? "—"],
          ["Level", student.level_name ?? "—"],
          ["Specialization", student.specialization_name ?? "—"],
          ["Attendance Rate", `${student.attendance_rate}%`],
          ["Enrolled Courses", `${student.enrolled_courses.length}`],
          ["Registration Date", new Date(student.registration_date).toLocaleDateString()],
        ] as [string, string][]).map(([key, val]) => (
          <div key={key}>
            <span className="font-medium text-muted-foreground">{key}</span>
            <p>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
