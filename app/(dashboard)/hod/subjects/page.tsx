'use client'
import { useState } from 'react';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, BookOpenIcon } from 'lucide-react';
import styles from '@/app/styles/views/ManageSubjects.module.css';

export default function ManageSubjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const subjects = [
    { 
      id: 1, 
      subjectCode: 'MATH101', 
      name: 'Calculus I', 
      department: 'Mathematics',
      semester: 1,
      credits: 4,
      type: 'Theory',
      teacher: 'Dr. Sarah Wilson',
      totalStudents: 45,
      status: 'active'
    },
    { 
      id: 2, 
      subjectCode: 'PHYS201', 
      name: 'Quantum Physics', 
      department: 'Physics',
      semester: 2,
      credits: 3,
      type: 'Theory',
      teacher: 'Prof. John Davis',
      totalStudents: 38,
      status: 'active'
    },
    { 
      id: 3, 
      subjectCode: 'CHEM101', 
      name: 'Organic Chemistry', 
      department: 'Chemistry',
      semester: 1,
      credits: 4,
      type: 'Theory + Lab',
      teacher: 'Dr. Emily Brown',
      totalStudents: 42,
      status: 'active'
    },
    { 
      id: 4, 
      subjectCode: 'BIO301', 
      name: 'Molecular Biology', 
      department: 'Biology',
      semester: 3,
      credits: 3,
      type: 'Theory',
      teacher: 'Prof. Michael Lee',
      totalStudents: 35,
      status: 'active'
    },
    { 
      id: 5, 
      subjectCode: 'CS102', 
      name: 'Data Structures', 
      department: 'Computer Science',
      semester: 1,
      credits: 4,
      type: 'Theory + Lab',
      teacher: 'Dr. Anna Garcia',
      totalStudents: 50,
      status: 'active'
    },
    { 
      id: 6, 
      subjectCode: 'MATH201', 
      name: 'Linear Algebra', 
      department: 'Mathematics',
      semester: 2,
      credits: 3,
      type: 'Theory',
      teacher: 'Dr. Sarah Wilson',
      totalStudents: 40,
      status: 'active'
    },
  ];

  const filteredSubjects = subjects.filter(subject => 
    (selectedDepartment === 'all' || subject.department === selectedDepartment) &&
    (selectedSemester === 'all' || subject.semester.toString() === selectedSemester) &&
    (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
     subject.teacher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSubject = () => {
    console.log('Add new subject action triggered');
  };

  const handleEditSubject = (id: number) => {
    console.log(`Edit subject ${id} action triggered`);
  };

  const handleDeleteSubject = (id: number) => {
    console.log(`Delete subject ${id} action triggered`);
  };

  const handleViewSubject = (id: number) => {
    console.log(`View subject ${id} details triggered`);
  };

  return (
    <div className={styles.manageSubjects}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Subjects</h2>
        <button 
          className={styles.primaryButton}
          onClick={handleAddSubject}
          data-testid="button-add-subject"
        >
          <PlusIcon size={24} />
          Add Subject
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <SearchIcon size={24} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            data-testid="input-search-subjects"
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

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className={styles.filterSelect}
          data-testid="select-semester-filter"
        >
          <option value="all">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
        </select>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard} data-testid="stat-total-subjects">
          <div className={styles.statIcon}>
            <BookOpenIcon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{subjects.length}</div>
            <div className={styles.statLabel}>Total Subjects</div>
          </div>
        </div>
        <div className={styles.statCard} data-testid="stat-total-students">
          <div className={styles.statIcon}>
            <BookOpenIcon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{subjects.reduce((sum, s) => sum + s.totalStudents, 0)}</div>
            <div className={styles.statLabel}>Total Enrollments</div>
          </div>
        </div>
        <div className={styles.statCard} data-testid="stat-total-credits">
          <div className={styles.statIcon}>
            <BookOpenIcon size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{subjects.reduce((sum, s) => sum + s.credits, 0)}</div>
            <div className={styles.statLabel}>Total Credits</div>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.subjectsTable}>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Department</th>
              <th>Semester</th>
              <th>Credits</th>
              <th>Type</th>
              <th>Teacher</th>
              <th>Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((subject) => (
              <tr key={subject.id} data-testid={`row-subject-${subject.id}`}>
                <td className={styles.subjectCode} data-testid={`text-code-${subject.id}`}>
                  {subject.subjectCode}
                </td>
                <td className={styles.subjectName} data-testid={`text-name-${subject.id}`}>
                  {subject.name}
                </td>
                <td data-testid={`text-department-${subject.id}`}>{subject.department}</td>
                <td data-testid={`text-semester-${subject.id}`}>Semester {subject.semester}</td>
                <td data-testid={`text-credits-${subject.id}`}>{subject.credits}</td>
                <td data-testid={`text-type-${subject.id}`}>
                  <span className={styles.typeBadge}>{subject.type}</span>
                </td>
                <td data-testid={`text-teacher-${subject.id}`}>{subject.teacher}</td>
                <td data-testid={`text-students-${subject.id}`}>{subject.totalStudents}</td>
                <td data-testid={`text-status-${subject.id}`}>
                  <span className={`${styles.statusBadge} ${styles[subject.status]}`}>
                    {subject.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewSubject(subject.id)}
                      data-testid={`button-view-${subject.id}`}
                      title="View Subject Details"
                    >
                      <EyeIcon size={16} />
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditSubject(subject.id)}
                      data-testid={`button-edit-${subject.id}`}
                      title="Edit Subject"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteSubject(subject.id)}
                      data-testid={`button-delete-${subject.id}`}
                      title="Delete Subject"
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
