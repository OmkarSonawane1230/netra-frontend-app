'use client'
import { useState, useCallback, useEffect } from 'react';

import { useAuth } from '@/app/context/AuthContext';
import { getHods, createHod, deleteHod, getDepartments, updateHodDepartment } from '@/services/api';
import type { HodData, DepartmentData } from '@/services/api';

import { SearchIcon, PlusIcon, EditIcon, TrashIcon, UserCheckIcon } from 'lucide-react';
import { FormModal, FormField } from '@/app/components/FormModal';
import styles from '@/app/styles/views/ManageHODs.module.css';

export default function ManageHODs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { user } = useAuth();
  
  const token = user?.access_token;
  const [hods, setHods] = useState<HodData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHod, setEditingHod] = useState<HodData | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [hodsData, deptsData] = await Promise.all([getHods(), getDepartments()]);
      setHods(hodsData);
      setDepartments(deptsData);
      console.log('Fetched HODs:', hodsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (hod: HodData) => {
    setEditingHod(hod);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingHod(null);
  };

  const handleEditFormSubmit = async (data: Record<string, any>) => {
    try {
      if (!editingHod || !editingHod.id) return;
      await updateHodDepartment(editingHod.id, data.department);
      alert("HOD's department updated successfully.");
      handleCloseEditModal();
      fetchData();
    } catch (error: any) {
      alert(`Update Error: ${error.message}`);
    }
  };

  const handleDelete = async (hodId: string, hodName: string) => {
    if (!confirm(`Are you sure you want to delete HOD: ${hodName}?`)) return;
    try {
      await deleteHod(hodId);
      alert('HOD deleted successfully.');
      fetchData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddHOD = () => {
    setIsAddModalOpen(true);
  };

  const handleAddFormSubmit = async (data: Record<string, any>) => {
    try {
      await createHod({
        username: data.username,
        password: data.password,
        full_name: data.fullName,
        department: data.department,
      });
      alert('HOD created successfully.');
      setIsAddModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const filteredHods = hods
    .filter(hod =>
      selectedDepartment === 'all' || hod.department === selectedDepartment
    )
    .filter(hod =>
      (hod.full_name && hod.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (hod.username && hod.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const addHodFields: FormField[] = [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'e.g., John Doe', required: true },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'e.g., johndoe', required: true },
    { name: 'password', label: 'Password', type: 'text', placeholder: 'Enter a secure password', required: true },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: departments.map(d => ({ value: d.code, label: d.name })),
    },
  ];

  const getEditHodFields = (): FormField[] => [
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: departments.map(d => ({ value: d.code, label: d.name })),
      defaultValue: editingHod?.department || '',
    },
  ];

  const getDepartmentName = (code: string) => {
    return departments.find(d => d.code === code)?.name || code;
  };

  return (
    <div className={styles.manageHODs}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage HODs</h2>
        <button
          className={styles.primaryButton}
          onClick={handleAddHOD}
          data-testid="button-add-hod"
        >
          <PlusIcon size={24} />
          Assign HOD
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon size={24} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search HODs by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            data-testid="input-search-hods"
          />
        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className={styles.filterSelect}
          data-testid="select-department-filter"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.code} value={dept.code}>{dept.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard} data-testid="stat-total-hods">
          <div className={styles.statIcon}>
            <UserCheckIcon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{hods.length}</div>
            <div className={styles.statLabel}>Total HODs</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.hodsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHods.map((hod) => (
              <tr key={hod.id} data-testid={`row-hod-${hod.id}`}>
                <td className={styles.hodName} data-testid={`text-name-${hod.id}`}>
                  {hod.full_name}
                </td>
                <td data-testid={`text-username-${hod.id}`}>{hod.username}</td>
                <td data-testid={`text-department-${hod.id}`}>{getDepartmentName(hod.department)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditClick(hod)}
                      data-testid={`button-edit-${hod.id}`}
                      title="Edit HOD"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => hod.id && handleDelete(hod.id, hod.full_name)}
                      data-testid={`button-delete-${hod.id}`}
                      title="Remove HOD"
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
        title="Assign New HOD"
        description="Fill in the details to assign a new Head of Department."
        fields={addHodFields}
        onSubmit={handleAddFormSubmit}
        submitText="Assign HOD"
      />

      <FormModal
        key={editingHod?.id || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={handleCloseEditModal}
        title="Edit HOD's Department"
        description={`Update the department for ${editingHod?.full_name}`}
        fields={getEditHodFields()}
        onSubmit={handleEditFormSubmit}
        submitText="Update Department"
      />
    </div>
  );
}
