"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Webcam from "react-webcam";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import styles from "@/app/styles/views/StudentManagement.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { getStudents, registerStudent, deleteStudent, updateStudent } from "@/services/api";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter
} from "@/app/components/ui/Dialog";
import { FormModal, FormField } from "@/app/components/FormModal";



const getClassesForDepartment = (departmentCode: string, userRole: string): string[] => {
  if (userRole === "principal") {
    return ["FYCO", "SYCO", "TYCO", "FYME", "SYME", "TYME", "FYEE", "SYEE", "TYEE", "FYCE", "SYCE", "TYCE"];
  }
  switch (departmentCode) {
    case "CO":
      return ["FYCO", "SYCO", "TYCO"];
    case "ME":
      return ["FYME", "SYME", "TYME"];
    case "EE":
      return ["FYEE", "SYEE", "TYEE"];
    case "CE":
      return ["FYCE", "SYCE", "TYCE"];
    default:
      return [];
  }
};

const StudentManagement: React.FC = () => {
  const handleDelete = async (rollNo: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete student: ${studentName} (${rollNo})?`)) return;
    try {
      await deleteStudent(rollNo);
      setSuccess("Student deleted successfully.");
      fetchStudents();
    } catch (error: any) {
      setError(`Error: ${error.message}`);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
  };

  const handleEditFormSubmit = async (data: Record<string, any>) => {
    if (!editingStudent) return;
    try {
      await updateStudent(editingStudent.roll_no, {
        name: data.name,
        student_class: data.student_class,
        parent_phone: data.parent_phone,
      });
      setSuccess("Student updated successfully.");
      handleCloseEditModal();
      fetchStudents();
    } catch (error: any) {
      setError(`Update Error: ${error.message}`);
    }
  };
  const { user } = useAuth();

  const [students, setStudents] = useState<import("@/services/api").Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<import("@/services/api").Student | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const webcamRef = useRef<Webcam>(null);

  // --- NEW: Determine if the user is a class teacher with a specific class ---
  // Accept both legacy role name "class-teacher" and newer "mentor".
  const normalizedAssignedClass = (user as any)?.assignedClass ?? (user as any)?.assigned_class ?? (user as any)?.assignedClass;
  const isClassTeacherWithClass = (user?.role === "class-teacher" || user?.role === "mentor") && !!normalizedAssignedClass;

  useEffect(() => {
    if (user) {
      const classes = getClassesForDepartment(user.department, user.role);
      setAvailableClasses(classes);
    }
  }, [user, isClassTeacherWithClass]);

  // --- NEW: Filter the student list based on the user's role and assigned class ---
  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (selectedClass !== "all") {
      filtered = filtered.filter((s) => s.student_class === selectedClass);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (isClassTeacherWithClass) {
      filtered = filtered.filter((s) => s.student_class === normalizedAssignedClass);
    }
    return filtered;
  }, [students, selectedClass, searchTerm, isClassTeacherWithClass, user]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setError("Could not load student data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [user, fetchStudents]);

  const handleEditClick = (student: import("@/services/api").Student) => {
    setEditingStudent(student);
    setIsEditModalOpen(true);
  };
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleAddFormSubmit = async (data: Record<string, any>) => {
    setError("");
    setSuccess("");
    if (photos.length < 3) {
      setError("Please capture 5 photos.");
      return;
    }
    const formData = new FormData();
    formData.append("roll_no", data.roll_no);
    formData.append("name", data.name);
    formData.append("student_class", data.student_class);
    formData.append("parent_phone", data.parent_phone);
    formData.append("department", user?.department || "");
    photos.forEach((photo, index) => {
      const blob = dataURLtoBlob(photo);
      formData.append("photos", blob, `capture_${index}.jpg`);
    });
    try {
      const result = await registerStudent(formData);
      setSuccess(result.message || "Student registered successfully.");
      setPhotos([]);
      setIsAddModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.studentManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Student Management</h2>
        <Button className={styles.primaryButton} onClick={() => {
          setPhotos([]);
          setError("");
          setSuccess("");
          setIsPhotoModalOpen(true);
        }}>
          <PlusIcon size={24} /> Add Student
        </Button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon size={24} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            data-testid="input-search-students"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className={styles.filterSelect}
          data-testid="select-class-filter"
        >
          <option value="all">All Classes</option>
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <Card className={styles.tableContainer}>
        <table className={styles.studentsTable} data-testid="table-students">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Department</th>
              <th>Parent Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.roll_no} data-testid={`row-student-${student.roll_no}`}>
                <td>{student.roll_no}</td>
                <td>{student.name}</td>
                <td>{student.student_class}</td>
                <td>{student.department || "Unassigned"}</td>
                <td>{(student as any).parent_phone || (student as any).parent_phone_number || "-"}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(student)}
                      title="Edit Student"
                      data-testid={`button-edit-${student.roll_no}`}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(student.roll_no, student.name)}
                      title="Delete Student"
                      data-testid={`button-delete-${student.roll_no}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p>Loading students...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </Card>

      {/* Photo Capture Modal */}
      {isPhotoModalOpen && (
        <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
          <DialogContent size="lg" showClose={true} onClose={() => setIsPhotoModalOpen(false)}>
            <DialogHeader>
              <DialogTitle>Capture Student Photo</DialogTitle>
              <DialogDescription>Capture at least one photo for student registration.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className={styles.captureSection}>
                <div className={styles.webcamContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', width: '100%' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{
                      borderRadius: '16px',
                      border: '2px solid var(--color-primary)',
                      width: '100%',
                      maxWidth: '480px',
                      height: '320px',
                      objectFit: 'cover',
                      background: '#f8f8f8'
                    }}
                  />
                </div>
                <Button onClick={() => {
                  if (photos.length >= 5) {
                    setError("You can capture a maximum of 5 photos.");
                    return;
                  }
                  const imageSrc = webcamRef.current?.getScreenshot();
                  if (imageSrc) {
                    setPhotos([...photos, imageSrc]);
                  }
                }} disabled={photos.length >= 5}>
                  Capture Photo ({photos.length}/5)
                </Button>
                <div className={styles.thumbnails} style={{ display: 'flex', flexDirection: 'row', gap: '12px', marginTop: '12px', overflowX: 'auto', justifyContent: 'center' }}>
                  {photos.map((src, index) => (
                    <div key={index} className={styles.thumbnail} style={{ position: 'relative', width: '80px', height: '80px', flex: '0 0 auto' }}>
                      <img src={src} alt={`Capture ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-primary)' }} />
                      <Button
                        type="button"
                        className={styles.removePhotoButton}
                        style={{ position: 'absolute', top: 4, right: 4, minWidth: '24px', height: '24px', padding: 0, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        title="Remove photo"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                {error && <p className={styles.error}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
              </div>
            </DialogBody>
            <DialogFooter style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button
                className={styles.primaryButton}
                onClick={() => {
                  if (photos.length < 1) {
                    setError("Please capture at least 1 photo.");
                    return;
                  }
                  setIsPhotoModalOpen(false);
                  setIsAddModalOpen(true);
                }}
              >
                Next: Fill Student Details
              </Button>
              <Button
                className={styles.cancelButton}
                style={{ background: 'var(--color-danger)', color: '#fff', borderRadius: '6px', fontWeight: '500', minWidth: '100px' }}
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setPhotos([]);
                  setError("");
                }}
                title="Cancel photo capture"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Student Form Modal */}
      <FormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Register New Student"
        description="Fill in the details. Photo(s) captured will be submitted."
        fields={[
          { name: "roll_no", label: "Roll Number", type: "text", required: true },
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "student_class", label: "Class", type: "select", required: false, options: availableClasses.map(cls => ({ value: cls, label: cls })) },
          { name: "parent_phone", label: "Parent's Phone", type: "text", required: true },
        ]}
        onSubmit={handleAddFormSubmit}
        submitText="Register Student"
      />

      {/* Edit Student Modal */}
      <FormModal
        key={editingStudent?.roll_no || "edit-modal"}
        open={isEditModalOpen}
        onOpenChange={handleCloseEditModal}
        title={`Edit Student: ${editingStudent?.name}`}
        description="Update student details."
        fields={[
          { name: "name", label: "Full Name", type: "text", required: true, defaultValue: editingStudent?.name || "" },
          { name: "student_class", label: "Class", type: "select", required: true, options: availableClasses.map(cls => ({ value: cls, label: cls })), defaultValue: editingStudent?.student_class || "" },
          { name: "parent_phone", label: "Parent's Phone", type: "text", required: true, defaultValue: editingStudent?.parent_phone || "" },
        ]}
        onSubmit={handleEditFormSubmit}
        submitText="Save Changes"
      />
    </div>
  );
};

export default StudentManagement;