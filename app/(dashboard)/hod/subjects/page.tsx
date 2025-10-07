'use client'
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getSubjects, createSubject, deleteSubject, updateSubject, getStaff } from '@/services/api';
import { FormModal, FormField } from '@/app/components/FormModal';

import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, BookOpenIcon } from 'lucide-react';
import styles from '@/app/styles/views/ManageSubjects.module.css';

export default function ManageSubjects() {
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Use only one editingSubject declaration
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const { user } = useAuth();

  interface Subject {
    id: number;
    subjectCode: string;
    name: string;
    department: string;
    semester: number;
    credits: number;
    type: string;
    teacher: string;
    totalStudents: number;
    status: string;
    abbreviation?: string;
  }

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [newAbbr, setNewAbbr] = useState<string>('');
  // State for edit modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editAbbr, setEditAbbr] = useState<string>('');

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await getSubjects();
      // Map API data to Subject shape if needed
      const mapped: Subject[] = Array.isArray(data)
        ? data.map((sub: any) => ({
            id: Number(sub.id),
            subjectCode: sub.subjectCode || sub.code || '',
            name: sub.name || '',
            department: sub.department || '',
            semester: Number(sub.semester) || 1,
            credits: Number(sub.credits) || 0,
            type: sub.type || '',
            teacher: sub.teacher || '',
            totalStudents: Number(sub.totalStudents) || 0,
            status: sub.status || 'active',
            abbreviation: sub.abbreviation || '',
          })
        )
        : [];
      setSubjects(mapped);
    } catch (error: any) {
      alert(`Error fetching subjects: ${error.message}`);
    }
  }, [user]);

  useEffect(() => {
    fetchSubjects();
    // Fetch staff for teacher selector
    (async () => {
      try {
        const staffData = await getStaff();
        setStaff(Array.isArray(staffData) ? staffData : []);
      } catch {}
    })();
  }, [fetchSubjects]);

  const handleEditClick = (sub: Subject) => {
    setEditingSubject(sub);
    setEditName(sub.name);
    setEditAbbr(sub.abbreviation || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      await updateSubject(String(editingSubject.id), { name: editName, abbreviation: editAbbr });
      alert('Subject updated successfully.');
      handleCloseModal();
      fetchSubjects();
    } catch (error: any) {
      alert(`Update Error: ${error.message}`);
    }
  };

  const handleDelete = async (subjectId: number, subjectName: string) => {
    if (!confirm(`Are you sure you want to delete the subject: ${subjectName}?`)) return;
    try {
      await deleteSubject(String(subjectId));
      alert('Subject deleted successfully.');
      fetchSubjects();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Add required fields for SubjectData
      await createSubject({
        name: newName,
        abbreviation: newAbbr,
        code: newAbbr,
        department: selectedDepartment === 'all' ? '' : selectedDepartment,
        semester: selectedSemester === 'all' ? 1 : Number(selectedSemester),
      });
      alert('Subject created successfully.');
      setNewName('');
      setNewAbbr('');
      fetchSubjects();
    } catch (error: any) {
      alert(`Error creating subject: ${error.message}`);
    }
  };

  // Remove hardcoded subjects array, use state subjects

  const filteredSubjects = subjects.filter((subject) =>
    (selectedDepartment === 'all' || subject.department === selectedDepartment) &&
    (selectedSemester === 'all' || subject.semester.toString() === selectedSemester) &&
    (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.teacher.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Example handlers for UI actions (can be replaced with real logic)
  // Modal open handlers
  const handleAddSubject = () => setIsAddModalOpen(true);
  const handleEditSubject = (id: number) => {
    const subject = subjects.find(s => s.id === id) || null;
    setEditingSubject(subject);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSubject(null);
  };
  // Delete handler
  const handleDeleteSubject = async (id: number) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;
    if (!confirm(`Are you sure you want to delete the subject: ${subject.name}?`)) return;
    try {
      await deleteSubject(String(id));
      alert('Subject deleted successfully.');
      fetchSubjects();
    } catch (error: any) {
      alert(`Error deleting subject: ${error.message}`);
    }
  };
  // Form fields for add/edit
  const addSubjectFields: FormField[] = [
  { name: 'name', label: 'Subject Name', type: 'text', placeholder: 'e.g., Calculus I', required: true },
  { name: 'abbreviation', label: 'Abbreviation', type: 'text', placeholder: 'e.g., MATH101', required: true },
  { name: 'code', label: 'Subject Code', type: 'text', placeholder: 'e.g., MATH101', required: true },
  { name: 'semester', label: 'Semester', type: 'number', placeholder: 'e.g., 1', required: true },
  { name: 'credits', label: 'Credits', type: 'number', placeholder: 'e.g., 4', required: true },
  { name: 'totalStudents', label: 'Total Students', type: 'number', placeholder: 'e.g., 45', required: true },
  { name: 'teacher', label: 'Teacher', type: 'select', required: true, options: staff.filter(s => s.role === 'staff' || s.role === 'class-teacher').map(s => ({ value: s.full_name, label: s.full_name })) },
  ];

  const getEditSubjectFields = (): FormField[] => [
  { name: 'name', label: 'Subject Name', type: 'text', required: true, defaultValue: editingSubject?.name || '' },
  { name: 'abbreviation', label: 'Abbreviation', type: 'text', required: true, defaultValue: editingSubject?.abbreviation || '' },
  { name: 'code', label: 'Subject Code', type: 'text', required: true, defaultValue: editingSubject?.subjectCode || '' },
  { name: 'semester', label: 'Semester', type: 'number', required: true, defaultValue: editingSubject?.semester || 1 },
  { name: 'credits', label: 'Credits', type: 'number', required: true, defaultValue: editingSubject?.credits || 0 },
  { name: 'totalStudents', label: 'Total Students', type: 'number', required: true, defaultValue: editingSubject?.totalStudents || 0 },
  { name: 'teacher', label: 'Teacher', type: 'select', required: true, options: staff.filter(s => s.role === 'staff' || s.role === 'class-teacher').map(s => ({ value: s.full_name, label: s.full_name })), defaultValue: editingSubject?.teacher || '' },
  ];
  // Form submit handlers
  const handleAddFormSubmit = async (data: Record<string, any>) => {
    try {
      await createSubject({
        name: data.name,
        abbreviation: data.abbreviation,
        code: data.code,
        department: data.department,
        semester: Number(data.semester),
        credits: Number(data.credits),
        type: data.type,
        teacher: data.teacher,
        totalStudents: Number(data.totalStudents),
        status: data.status,
      });
      alert('Subject created successfully.');
      setIsAddModalOpen(false);
      fetchSubjects();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditFormSubmit = async (data: Record<string, any>) => {
    if (!editingSubject) return;
    try {
      await updateSubject(String(editingSubject.id), {
        name: data.name,
        abbreviation: data.abbreviation,
        code: data.code,
        department: data.department,
        semester: Number(data.semester),
        credits: Number(data.credits),
        type: data.type,
        teacher: data.teacher,
        totalStudents: Number(data.totalStudents),
        status: data.status,
      });
      alert('Subject updated successfully.');
      handleCloseEditModal();
      fetchSubjects();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
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
                    {/* Remove handleViewSubject button since not implemented */}
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
      <FormModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Subject"
        description="Fill in the details to add a new subject."
        fields={addSubjectFields}
        onSubmit={handleAddFormSubmit}
        submitText="Add Subject"
      />

      <FormModal
        key={editingSubject?.id || 'edit-modal'}
        open={isEditModalOpen}
        onOpenChange={handleCloseEditModal}
        title="Edit Subject Details"
        description={`Update details for ${editingSubject?.name}`}
        fields={getEditSubjectFields()}
        onSubmit={handleEditFormSubmit}
        submitText="Update Subject"
      />
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
