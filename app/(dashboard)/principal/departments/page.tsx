'use client'
import { useCallback, useEffect, useState } from 'react';


import { useAuth } from '@/app/context/AuthContext';
import { getDepartments, createDepartment, deleteDepartment, updateDepartment } from '@/services/api';

import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, Building2Icon } from 'lucide-react';
import { FormModal, FormField } from '@/app/components/FormModal';
import styles from '@/app/styles/views/ManageDepartments.module.css';

// Use DepartmentData type from services/api for consistency
import type { DepartmentData } from '@/services/api';

export default function ManageDepartments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { user } = useAuth();
  const token = user?.token;
  const [depts, setDepts] = useState<DepartmentData[]>([]);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);

  const fetchDepts = useCallback(async () => {
    try {
      const data = await getDepartments();
      setDepts(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  const handleEditClick = (dept: DepartmentData | null) => {
    if (!dept) return;
    setEditingDept(dept);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingDept(null);
  };

  const handleEditFormSubmit = async (data: Record<string, any>) => {
    try {
      if (!editingDept) return;
      await updateDepartment(editingDept.id || editingDept.code, { name: data.name, code: data.code });
      alert('Department updated successfully.');
      setIsEditModalOpen(false);
      setEditingDept(null);
      fetchDepts();
    } catch (error: any) {
      alert(`Update Error: ${error.message}`);
    }
  };

  const handleDelete = async (deptId: string, deptName: string) => {
    if (!confirm(`Are you sure you want to delete the department: ${deptName}?`)) return;
    try {
      await deleteDepartment(deptId);
      alert('Department deleted successfully.');
      fetchDepts();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };



  const filteredDepartments = depts.filter((dept: DepartmentData) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = () => {
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      await createDepartment({ name: data.name, code: data.code });
      alert('Department created successfully.');
      setIsAddModalOpen(false);
      fetchDepts();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const addDepartmentFields: FormField[] = [
    {
      name: 'name',
      label: 'Department Name',
      type: 'text',
      placeholder: 'e.g., Computer Science',
      required: true,
    },
    {
      name: 'code',
      label: 'Department Code',
      type: 'text',
      placeholder: 'e.g., CS',
      required: true,
    },
  ];

  const getEditDepartmentFields = (): FormField[] => [
    {
      name: 'name',
      label: 'Department Name',
      type: 'text',
      placeholder: 'e.g., Computer Science',
      required: true,
      defaultValue: editingDept?.name || '',
    },
    {
      name: 'code',
      label: 'Department Code',
      type: 'text',
      placeholder: 'e.g., CS',
      required: true,
      defaultValue: editingDept?.code || '',
    },
  ];

  return (
    <div className={styles.manageDepartments}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Departments</h2>
        <button
          className={styles.primaryButton}
          onClick={handleAddDepartment}
          data-testid="button-add-department"
        >
          <PlusIcon size={24} />
          Add Department
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon size={24} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            data-testid="input-search-departments"
          />
        </div>


      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard} data-testid="stat-total-departments">
          <div className={styles.statIcon}>
            <Building2Icon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{depts.length}</div>
            <div className={styles.statLabel}>Total Departments</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>        
        <table className={styles.departmentsTable}>
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Department Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={3} style={{textAlign: 'center', padding: '20px'}}>
                  {depts.length === 0 ? 'No departments found. Try adding some departments.' : 'No departments match your search criteria.'}
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept: DepartmentData) => (
              <tr key={dept.id || dept.code} data-testid={`row-department-${dept.id || dept.code}`}>
                <td className={styles.deptName} data-testid={`text-dept-name-${dept.id || dept.code}`}>
                  {dept.name}
                </td>
                <td data-testid={`text-dept-code-${dept.id || dept.code}`}>{dept.code}</td>
                {/* <td data-testid={`text-status-${dept.id}`}>
                  <span className={`${styles.statusBadge} ${styles[dept.status]}`}>
                    {dept.status}
                  </span>
                </td> */}
                <td>
                  <div className={styles.actionButtons}>
                    {/* <button 
                      className={styles.actionButton}
                      onClick={() => handleViewDepartment(dept.id)}
                      data-testid={`button-view-${dept.id}`}
                      title="View Department"
                    >
                      <EyeIcon size={16} />
                    </button> */}
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditClick(dept)}
                      data-testid={`button-edit-${dept.id || dept.code}`}
                      title="Edit Department"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(dept.id || dept.code, dept.name)}
                      data-testid={`button-delete-${dept.id || dept.code}`}
                      title="Delete Department"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Department"
        description="Fill in the details to create a new department"
        fields={addDepartmentFields}
        onSubmit={handleFormSubmit}
        submitText="Add Department"
      />

      <FormModal
        key={editingDept?.id || editingDept?.code || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Department"
        description="Update the department details"
        fields={getEditDepartmentFields()}
        onSubmit={handleEditFormSubmit}
        submitText="Update Department"
      />
    </div>
  );
}
