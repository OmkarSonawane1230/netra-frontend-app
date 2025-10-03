"use client"
import { useState } from 'react';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import styles from '@/app/styles/views/StudentManagement.module.css';
// import { FormModal, FormField } from '@/app/components/FormModal';


export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // TODO: remove mock data functionality - replace with real API calls
  const students = [
    { 
      id: 1, 
      rollNo: 'A001', 
      name: 'Alice Johnson', 
      email: 'alice.johnson@example.com',
      class: '10A',
      phone: '+1-555-0101',
      status: 'active'
    },
    { 
      id: 2, 
      rollNo: 'A002', 
      name: 'Bob Smith', 
      email: 'bob.smith@example.com',
      class: '10A',
      phone: '+1-555-0102',
      status: 'active'
    },
    { 
      id: 3, 
      rollNo: 'A003', 
      name: 'Carol Brown', 
      email: 'carol.brown@example.com',
      class: '10B',
      phone: '+1-555-0103',
      status: 'inactive'
    },
  ];

  const filteredStudents = students.filter(student => 
    (selectedClass === 'all' || student.class === selectedClass) &&
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
     student.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStudent = () => {
    console.log('Add new student action triggered');
  };

  const handleEditStudent = (id: number) => {
    console.log(`Edit student ${id} action triggered`);
  };

  const handleDeleteStudent = (id: number) => {
    console.log(`Delete student ${id} action triggered`);
  };

  const handleViewStudent = (id: number) => {
    console.log(`View student ${id} details triggered`);
  };

  return (
    <div className={styles.studentManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>Student Management</h2>
        <button 
          className={styles.primaryButton}
          onClick={handleAddStudent}
          data-testid="button-add-student"
        >
          <PlusIcon size={24} />
          Add Student
        </button>
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
          <option value="10A">Class 10A</option>
          <option value="10B">Class 10B</option>
          <option value="11A">Class 11A</option>
          <option value="11B">Class 11B</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.studentsTable} data-testid="table-students">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} data-testid={`row-student-${student.id}`}>
                <td>{student.rollNo}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.class}</td>
                <td>{student.phone}</td>
                <td>
                  <span 
                    className={`${styles.status} ${styles[student.status]}`}
                    data-testid={`status-${student.id}`}
                  >
                    {student.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewStudent(student.id)}
                      data-testid={`button-view-${student.id}`}
                      title="View Details"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditStudent(student.id)}
                      data-testid={`button-edit-${student.id}`}
                      title="Edit Student"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteStudent(student.id)}
                      data-testid={`button-delete-${student.id}`}
                      title="Delete Student"
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