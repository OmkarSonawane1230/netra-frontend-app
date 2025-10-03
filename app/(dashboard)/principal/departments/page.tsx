'use client'
import { useState } from 'react';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, Building2Icon } from 'lucide-react';
import { FormModal, FormField } from '@/app/components/FormModal';
import styles from '@/app/styles/views/ManageDepartments.module.css';

export default function ManageDepartments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const departments = [
    { 
      id: 1, 
      deptId: 'DEPT001', 
      name: 'Mathematics', 
      hod: 'Dr. Sarah Wilson',
      totalStaff: 12,
      totalSubjects: 8,
      building: 'Block A',
      status: 'active'
    },
    { 
      id: 2, 
      deptId: 'DEPT002', 
      name: 'Physics', 
      hod: 'Prof. John Davis',
      totalStaff: 10,
      totalSubjects: 6,
      building: 'Block B',
      status: 'active'
    },
    { 
      id: 3, 
      deptId: 'DEPT003', 
      name: 'Chemistry', 
      hod: 'Dr. Emily Brown',
      totalStaff: 8,
      totalSubjects: 5,
      building: 'Block A',
      status: 'active'
    },
    { 
      id: 4, 
      deptId: 'DEPT004', 
      name: 'Biology', 
      hod: 'Prof. Michael Lee',
      totalStaff: 9,
      totalSubjects: 7,
      building: 'Block C',
      status: 'active'
    },
    { 
      id: 5, 
      deptId: 'DEPT005', 
      name: 'Computer Science', 
      hod: 'Dr. Anna Garcia',
      totalStaff: 15,
      totalSubjects: 10,
      building: 'Block D',
      status: 'active'
    },
  ];

  const filteredDepartments = departments.filter(dept => 
    (selectedStatus === 'all' || dept.status === selectedStatus) &&
    (dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     dept.deptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     dept.hod.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDepartment = () => {
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('New department data:', data);
    // Here you would make an API request to save the department
    // Example: await fetch('/api/departments', { method: 'POST', body: JSON.stringify(data) })
    setIsAddModalOpen(false);
  };

  const handleEditDepartment = (id: number) => {
    console.log(`Edit department ${id} action triggered`);
  };

  const handleDeleteDepartment = (id: number) => {
    console.log(`Delete department ${id} action triggered`);
  };

  const handleViewDepartment = (id: number) => {
    console.log(`View department ${id} details triggered`);
  };

  const addDepartmentFields: FormField[] = [
    {
      name: 'deptId',
      label: 'Department ID',
      type: 'text',
      placeholder: 'e.g., DEPT006',
      required: true,
    },
    {
      name: 'name',
      label: 'Department Name',
      type: 'text',
      placeholder: 'e.g., Computer Science',
      required: true,
    },
    {
      name: 'hod',
      label: 'Head of Department',
      type: 'text',
      placeholder: 'e.g., Dr. John Doe',
      required: true,
    },
    {
      name: 'building',
      label: 'Building',
      type: 'select',
      required: true,
      options: [
        { value: 'Block A', label: 'Block A' },
        { value: 'Block B', label: 'Block B' },
        { value: 'Block C', label: 'Block C' },
        { value: 'Block D', label: 'Block D' },
        { value: 'Block E', label: 'Block E' },
      ],
    },
    {
      name: 'totalStaff',
      label: 'Total Staff',
      type: 'number',
      placeholder: '0',
      defaultValue: 0,
    },
    {
      name: 'totalSubjects',
      label: 'Total Subjects',
      type: 'number',
      placeholder: '0',
      defaultValue: 0,
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

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={styles.filterSelect}
          data-testid="select-status-filter"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard} data-testid="stat-total-departments">
          <div className={styles.statIcon}>
            <Building2Icon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{departments.length}</div>
            <div className={styles.statLabel}>Total Departments</div>
          </div>
        </div>
        <div className={styles.statCard} data-testid="stat-total-staff">
          <div className={styles.statIcon}>
            <Building2Icon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{departments.reduce((sum, d) => sum + d.totalStaff, 0)}</div>
            <div className={styles.statLabel}>Total Staff</div>
          </div>
        </div>
        <div className={styles.statCard} data-testid="stat-total-subjects">
          <div className={styles.statIcon}>
            <Building2Icon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{departments.reduce((sum, d) => sum + d.totalSubjects, 0)}</div>
            <div className={styles.statLabel}>Total Subjects</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.departmentsTable}>
          <thead>
            <tr>
              <th>Dept ID</th>
              <th>Department Name</th>
              <th>HOD</th>
              <th>Staff</th>
              <th>Subjects</th>
              <th>Building</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <tr key={dept.id} data-testid={`row-department-${dept.id}`}>
                <td className={styles.deptId} data-testid={`text-dept-id-${dept.id}`}>
                  {dept.deptId}
                </td>
                <td className={styles.deptName} data-testid={`text-dept-name-${dept.id}`}>
                  {dept.name}
                </td>
                <td data-testid={`text-hod-${dept.id}`}>{dept.hod}</td>
                <td data-testid={`text-staff-${dept.id}`}>{dept.totalStaff}</td>
                <td data-testid={`text-subjects-${dept.id}`}>{dept.totalSubjects}</td>
                <td data-testid={`text-building-${dept.id}`}>{dept.building}</td>
                <td data-testid={`text-status-${dept.id}`}>
                  <span className={`${styles.statusBadge} ${styles[dept.status]}`}>
                    {dept.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewDepartment(dept.id)}
                      data-testid={`button-view-${dept.id}`}
                      title="View Department"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditDepartment(dept.id)}
                      data-testid={`button-edit-${dept.id}`}
                      title="Edit Department"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteDepartment(dept.id)}
                      data-testid={`button-delete-${dept.id}`}
                      title="Delete Department"
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
        title="Add New Department"
        description="Fill in the details to create a new department"
        fields={addDepartmentFields}
        onSubmit={handleFormSubmit}
        submitText="Add Department"
      />
    </div>
  );
}
