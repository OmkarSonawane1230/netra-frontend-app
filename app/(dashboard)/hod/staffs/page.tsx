"use client"
import { useState } from 'react';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import styles from '@/app/styles/views/StaffManagement.module.css';

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // TODO: remove mock data functionality - replace with real API calls
  const staff = [
    { 
      id: 1, 
      empId: 'EMP001', 
      name: 'Dr. Sarah Wilson', 
      email: 'sarah.wilson@school.edu',
      department: 'Mathematics',
      position: 'Senior Teacher',
      phone: '+1-555-0201',
      status: 'active'
    },
    { 
      id: 2, 
      empId: 'EMP002', 
      name: 'Prof. John Davis', 
      email: 'john.davis@school.edu',
      department: 'Physics',
      position: 'HOD',
      phone: '+1-555-0202',
      status: 'active'
    },
    { 
      id: 3, 
      empId: 'EMP003', 
      name: 'Ms. Emily Brown', 
      email: 'emily.brown@school.edu',
      department: 'Chemistry',
      position: 'Assistant Teacher',
      phone: '+1-555-0203',
      status: 'inactive'
    },
  ];

  const filteredStaff = staff.filter(member => 
    (selectedDept === 'all' || member.department === selectedDept) &&
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     member.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={styles.staffManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Staff Management</h2>
        <button 
          className={styles.primaryButton}
          onClick={() => console.log('Add new staff action triggered')}
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

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className={styles.filterSelect}
          data-testid="select-dept-filter"
        >
          <option value="all">All Departments</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.staffTable} data-testid="table-staff">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member.id} data-testid={`row-staff-${member.id}`}>
                <td>{member.empId}</td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.department}</td>
                <td>{member.position}</td>
                <td>{member.phone}</td>
                <td>
                  <span 
                    className={`${styles.status} ${styles[member.status]}`}
                    data-testid={`status-${member.id}`}
                  >
                    {member.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionButton}
                      onClick={() => console.log(`View staff ${member.id} details triggered`)}
                      data-testid={`button-view-${member.id}`}
                      title="View Details"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => console.log(`Edit staff ${member.id} action triggered`)}
                      data-testid={`button-edit-${member.id}`}
                      title="Edit Staff"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => console.log(`Delete staff ${member.id} action triggered`)}
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
    </div>
  );
}