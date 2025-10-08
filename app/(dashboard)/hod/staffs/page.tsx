"use client"
import { useState, useEffect, useCallback } from 'react';

import {
  getStaff,
  getSubjects,
  createStaff,
  deleteStaff,
  updateStaff,
  getAssignedSubjectsForStaff
} from '@/services/api';

import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { FormModal, FormField } from '@/app/components/FormModal';
import styles from '@/app/styles/views/StaffManagement.module.css';
import { useAuth } from '@/app/context/AuthContext';

export default function StaffManagement() {

  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>('');
  // Removed department filter for HOD

  interface Staff {
    id: number;
    username: string;
    full_name: string;
    department: string;
    role: string;
    assigned_class?: string;
    subject_ids?: string[];
    teacher_id?: string;
  }

  interface Subject {
    id: number;
    name: string;
  }

  const [staff, setStaff] = useState<Staff[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Derived teachers array from staff
  const teachers: { id: number; name: string }[] = staff.filter(
    (s) => s.role === 'staff' || s.role === 'class-teacher'
  ).map((s) => ({
    id: s.id,
    name: s.full_name,
  }));

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const staffData = await getStaff();
      const subjectsData = await getSubjects();
      const staffList = Array.isArray(staffData) ? staffData.map((s: any) => ({
        id: Number(s.id),
        username: s.username,
        full_name: s.full_name,
        department: s.department,
        role: s.role,
        assigned_class: s.assigned_class,
        teacher_id: s.teacher_id ? String(s.teacher_id) : undefined,
      })) : [];
      setStaff(staffList);
      setSubjects(Array.isArray(subjectsData) ? subjectsData.map((sub: any) => ({
        id: Number(sub.id),
        name: sub.name || '',
      })) : []);
    } catch (err: any) {
      setError(`Error fetching data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Modal form fields
  const addStaffFields: FormField[] = [
    { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'e.g., John Doe', required: true },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'e.g., johndoe', required: true },
    { name: 'password', label: 'Password', type: 'text', placeholder: 'Enter a secure password', required: true },
    {
      name: 'role', label: 'Role', type: 'select', required: true, options: [
        { value: 'class-teacher', label: 'Class Teacher' },
        { value: 'staff', label: 'Staff' },
      ]
    },
    { name: 'assigned_class', label: 'Assigned Class', type: 'text', placeholder: 'e.g., SYCO', required: false },
    {
      name: 'subject_ids',
      label: 'Subject',
      type: 'select',
      required: true,
      options: subjects.map((sub) => ({ value: String(sub.id), label: sub.name }))
    },
  ];

  const getEditStaffFields = (): FormField[] => [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true, defaultValue: editingStaff?.full_name || '' },
    { name: 'username', label: 'Username', type: 'text', required: true, defaultValue: editingStaff?.username || '' },
    { name: 'password', label: 'Password', type: 'text', required: false, placeholder: 'Enter a password (leave blank to keep unchanged)' },
    {
      name: 'role', label: 'Role', type: 'select', required: true, options: [
        { value: 'class-teacher', label: 'Class Teacher' },
        { value: 'staff', label: 'Staff' },
      ], defaultValue: editingStaff?.role || ''
    },
    { name: 'assigned_class', label: 'Assigned Class', type: 'text', required: false, defaultValue: editingStaff?.assigned_class || '' },
    {
      name: 'subject_ids',
      label: 'Subject',
      type: 'select',
      required: true,
      options: subjects.map((sub) => ({ value: String(sub.id), label: sub.name })),
      defaultValue: editingStaff?.subject_ids ? editingStaff.subject_ids[0] : '',
    },
  ];


  // Add Staff
  const handleAddStaff = () => setIsAddModalOpen(true);
  const handleAddFormSubmit = async (data: Record<string, any>) => {
    // Client-side validation for required fields
  const requiredFields = ['full_name', 'username', 'role', 'password'];
    const missingFields = requiredFields.filter(field => !data[field] || String(data[field]).trim() === '');
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      setError(errorMsg);
      alert(`Failed to create staff: ${errorMsg}`);
      return;
    }
    try {
      // Only send required fields to API
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('full_name', data.full_name);
  formData.append('department', user?.department || '');
      formData.append('role', data.role);
      formData.append('password', data.password);
      // assigned_class can be null or string
      if (data.assigned_class !== undefined && data.assigned_class !== null && String(data.assigned_class).trim() !== '') {
        formData.append('assigned_class', data.assigned_class);
      } else {
        formData.append('assigned_class', '');
      }
      // is_class_teacher required by backend
      formData.append('is_class_teacher', String(data.role === 'class-teacher'));
      // subject_ids required by backend
      if (Array.isArray(data.subject_ids)) {
        data.subject_ids.forEach((id: string | number) => formData.append('subject_ids', String(id)));
      }
      // teacher_id required by backend
      if (data.teacher_id) {
        formData.append('teacher_id', String(data.teacher_id));
      }
      await createStaff(formData);
      alert('Staff member created successfully!');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      let errorMsg = '';
      if (err?.message && typeof err.message === 'string') {
        errorMsg = err.message;
      } else if (err?.detail) {
        errorMsg = err.detail;
      } else if (typeof err === 'object') {
        errorMsg = JSON.stringify(err);
      } else {
        errorMsg = String(err);
      }
      setError(errorMsg);
      alert(`Failed to create staff: ${errorMsg}`);
    }
  };

  // Edit Staff
  const handleEditClick = (staff: Staff) => {
    setEditingStaff(staff);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStaff(null);
  };
  const handleEditFormSubmit = async (data: Record<string, any>) => {
    // Client-side validation for required fields
  const requiredFields = ['full_name', 'username', 'role'];
    const missingFields = requiredFields.filter(field => !data[field] || String(data[field]).trim() === '');
    if (!editingStaff || !editingStaff.id) return;
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      setError(errorMsg);
      alert(`Failed to update staff: ${errorMsg}`);
      return;
    }
    try {
      // Build payload matching backend requirements
      const payload: Record<string, any> = {
        username: data.username,
        full_name: data.full_name,
        department: user?.department || '',
        role: data.role,
        assigned_class: data.assigned_class ?? '',
        is_class_teacher: data.role === 'class-teacher',
        subject_ids: Array.isArray(data.subject_ids) ? data.subject_ids : [],
        teacher_id: data.teacher_id ? String(data.teacher_id) : '',
      };
      if (data.password && String(data.password).trim() !== '') {
        payload.password = data.password;
      }
      await updateStaff(String(editingStaff.id), payload);
      alert('Staff member updated successfully.');
      handleCloseEditModal();
      fetchData();
    } catch (error: any) {
      setError(`Update Error: ${error.message}`);
    }
  };

  const handleDelete = async (staffId: number, staffName: string) => {
    if (!window.confirm(`Are you sure you want to delete staff member: ${staffName}?`)) return;
    try {
      await deleteStaff(String(staffId));
      alert('Staff member deleted successfully.');
      fetchData();
    } catch (err: any) {
      alert(`Error deleting staff: ${err.message}`);
    }
  };

  const filteredStaff = staff.filter(member =>
    (member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Staff Management</h2>
        <button
          className={styles.primaryButton}
          onClick={handleAddStaff}
          data-testid="button-add-staff"
        >
          <PlusIcon size={24} />
          Add Staff
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon size={24} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            data-testid="input-search-staff"
          />
        </div>

        {/* Department filter removed for HOD */}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.staffTable} data-testid="table-staff">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Role</th>
              <th>Assigned Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member.id} data-testid={`row-staff-${member.id}`}>
                <td>{member.full_name}</td>
                <td>{member.role}</td>
                <td>{member.assigned_class || '-'}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(member)}
                      data-testid={`button-edit-${member.id}`}
                      title="Edit Staff"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(member.id, member.full_name)}
                      data-testid={`button-delete-${member.id}`}
                      title="Delete Staff"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Staff"
        description="Fill in the details to add a new staff member."
        fields={addStaffFields}
        onSubmit={handleAddFormSubmit}
        submitText="Add Staff"
      />

      <FormModal
        key={editingStaff?.id || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={handleCloseEditModal}
        title="Edit Staff Details"
        description={`Update details for ${editingStaff?.full_name}`}
        fields={getEditStaffFields()}
        onSubmit={handleEditFormSubmit}
        submitText="Update Staff"
      />
    </div>
  );
}