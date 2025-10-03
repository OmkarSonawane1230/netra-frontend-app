'use client'
import { useState } from 'react';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, UserCheckIcon } from 'lucide-react';
import { FormModal, FormField } from '@/app/components/FormModal';
import styles from '@/app/styles/views/ManageHODs.module.css';

export default function ManageHODs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const hods = [
    { 
      id: 1, 
      empId: 'EMP001', 
      name: 'Dr. Sarah Wilson', 
      email: 'sarah.wilson@school.edu',
      department: 'Mathematics',
      phone: '+1-555-0201',
      yearsOfExperience: 15,
      qualification: 'Ph.D. in Mathematics',
      status: 'active'
    },
    { 
      id: 2, 
      empId: 'EMP002', 
      name: 'Prof. John Davis', 
      email: 'john.davis@school.edu',
      department: 'Physics',
      phone: '+1-555-0202',
      yearsOfExperience: 18,
      qualification: 'Ph.D. in Physics',
      status: 'active'
    },
    { 
      id: 3, 
      empId: 'EMP003', 
      name: 'Dr. Emily Brown', 
      email: 'emily.brown@school.edu',
      department: 'Chemistry',
      phone: '+1-555-0203',
      yearsOfExperience: 12,
      qualification: 'Ph.D. in Chemistry',
      status: 'active'
    },
    { 
      id: 4, 
      empId: 'EMP004', 
      name: 'Prof. Michael Lee', 
      email: 'michael.lee@school.edu',
      department: 'Biology',
      phone: '+1-555-0204',
      yearsOfExperience: 20,
      qualification: 'Ph.D. in Biology',
      status: 'active'
    },
    { 
      id: 5, 
      empId: 'EMP005', 
      name: 'Dr. Anna Garcia', 
      email: 'anna.garcia@school.edu',
      department: 'Computer Science',
      phone: '+1-555-0205',
      yearsOfExperience: 10,
      qualification: 'Ph.D. in Computer Science',
      status: 'active'
    },
  ];

  const filteredHODs = hods.filter(hod => 
    (selectedDepartment === 'all' || hod.department === selectedDepartment) &&
    (hod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     hod.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     hod.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     hod.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddHOD = () => {
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('New HOD data:', data);
    setIsAddModalOpen(false);
  };

  const handleEditHOD = (id: number) => {
    console.log(`Edit HOD ${id} action triggered`);
  };

  const handleDeleteHOD = (id: number) => {
    console.log(`Delete HOD ${id} action triggered`);
  };

  const handleViewHOD = (id: number) => {
    console.log(`View HOD ${id} details triggered`);
  };

  const addHODFields: FormField[] = [
    {
      name: 'empId',
      label: 'Employee ID',
      type: 'text',
      placeholder: 'e.g., EMP006',
      required: true,
    },
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'e.g., Dr. John Doe',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'e.g., john.doe@school.edu',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'e.g., +1-555-0206',
      required: true,
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Biology', label: 'Biology' },
        { value: 'Computer Science', label: 'Computer Science' },
      ],
    },
    {
      name: 'qualification',
      label: 'Qualification',
      type: 'text',
      placeholder: 'e.g., Ph.D. in Computer Science',
      required: true,
    },
    {
      name: 'yearsOfExperience',
      label: 'Years of Experience',
      type: 'number',
      placeholder: '0',
      required: true,
    },
  ];

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
            placeholder="Search HODs..."
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
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="Computer Science">Computer Science</option>
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
        <div className={styles.statCard} data-testid="stat-avg-experience">
          <div className={styles.statIcon}>
            <UserCheckIcon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {Math.round(hods.reduce((sum, h) => sum + h.yearsOfExperience, 0) / hods.length)}
            </div>
            <div className={styles.statLabel}>Avg. Experience (Years)</div>
          </div>
        </div>
        <div className={styles.statCard} data-testid="stat-active-hods">
          <div className={styles.statIcon}>
            <UserCheckIcon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{hods.filter(h => h.status === 'active').length}</div>
            <div className={styles.statLabel}>Active HODs</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.hodsTable}>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Experience</th>
              <th>Qualification</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHODs.map((hod) => (
              <tr key={hod.id} data-testid={`row-hod-${hod.id}`}>
                <td className={styles.empId} data-testid={`text-emp-id-${hod.id}`}>
                  {hod.empId}
                </td>
                <td className={styles.hodName} data-testid={`text-name-${hod.id}`}>
                  {hod.name}
                </td>
                <td data-testid={`text-email-${hod.id}`}>{hod.email}</td>
                <td data-testid={`text-department-${hod.id}`}>{hod.department}</td>
                <td data-testid={`text-experience-${hod.id}`}>{hod.yearsOfExperience} years</td>
                <td data-testid={`text-qualification-${hod.id}`}>{hod.qualification}</td>
                <td data-testid={`text-phone-${hod.id}`}>{hod.phone}</td>
                <td data-testid={`text-status-${hod.id}`}>
                  <span className={`${styles.statusBadge} ${styles[hod.status]}`}>
                    {hod.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewHOD(hod.id)}
                      data-testid={`button-view-${hod.id}`}
                      title="View HOD Details"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditHOD(hod.id)}
                      data-testid={`button-edit-${hod.id}`}
                      title="Edit HOD"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteHOD(hod.id)}
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
        title="Assign HOD"
        description="Fill in the details to assign a new Head of Department"
        fields={addHODFields}
        onSubmit={handleFormSubmit}
        submitText="Assign HOD"
      />
    </div>
  );
}
