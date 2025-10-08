'use client'
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getSubjects, createSubject, deleteSubject, updateSubject, getStaff, CreateSubjectData } from '@/services/api';
import { FormModal, FormField } from '@/app/components/FormModal';

import { SearchIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, BookOpenIcon } from 'lucide-react';
import styles from '@/app/styles/views/ManageSubjects.module.css';

export default function ManageSubjects() {
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Use only one editingSubject declaration
  const [searchTerm, setSearchTerm] = useState<string>('');
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
      } catch { }
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
        // HOD manages only their department, so department is handled server-side or by authenticated user
        department: '',
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
    // Teacher is optional when creating a subject. HODs can add subjects first and assign teachers later.
    { name: 'teacher', label: 'Teacher (optional)', type: 'select', required: false, options: staff.filter(s => s.role === 'staff' || s.role === 'mentor').map(s => ({ value: s.full_name, label: s.full_name })) },
  ];

  const getEditSubjectFields = (): FormField[] => [
    { name: 'name', label: 'Subject Name', type: 'text', required: true, defaultValue: editingSubject?.name || '' },
    { name: 'abbreviation', label: 'Abbreviation', type: 'text', required: true, defaultValue: editingSubject?.abbreviation || '' },
    { name: 'code', label: 'Subject Code', type: 'text', required: true, defaultValue: editingSubject?.subjectCode || '' },
    { name: 'semester', label: 'Semester', type: 'number', required: true, defaultValue: editingSubject?.semester || 1 },
    { name: 'credits', label: 'Credits', type: 'number', required: true, defaultValue: editingSubject?.credits || 0 },
    { name: 'totalStudents', label: 'Total Students', type: 'number', required: true, defaultValue: editingSubject?.totalStudents || 0 },
    // Make teacher optional on edit as well; assignment can happen via Staff creation/assignment flows
    { name: 'teacher', label: 'Teacher (optional)', type: 'select', required: false, options: staff.filter(s => s.role === 'staff' || s.role === 'mentor').map(s => ({ value: s.full_name, label: s.full_name })), defaultValue: editingSubject?.teacher || '' },
  ];
  // Form submit handlers
  const handleAddFormSubmit = async (data: Record<string, any>) => {
    try {
      // Build payload and omit teacher if not provided
      const payload: CreateSubjectData = {
        name: data.name,
        abbreviation: data.abbreviation,
        code: data.code,
        // HOD's department is set automatically from authenticated user
        department: user?.department || '',
        semester: Number(data.semester),
        credits: Number(data.credits),
        type: data.type,
        totalStudents: Number(data.totalStudents),
        status: data.status,
      };
      // Always set teacher field at creation time; if not provided send empty string
      payload.teacher = data.teacher || '';

      await createSubject(payload);
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
      const payload: Partial<CreateSubjectData> = {
        name: data.name,
        abbreviation: data.abbreviation,
        code: data.code,
        department: data.department,
        semester: Number(data.semester),
        credits: Number(data.credits),
        type: data.type,
        totalStudents: Number(data.totalStudents),
        status: data.status,
      };
      if (data.teacher) payload.teacher = data.teacher;

      await updateSubject(String(editingSubject.id), payload);
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

        {/* Department filter removed because HOD manages only their department */}
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
              <th>Subject Name</th>
              <th>Semester</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((subject) => (
              <tr key={subject.id} data-testid={`row-subject-${subject.id}`}>
                <td className={styles.subjectName} data-testid={`text-name-${subject.id}`}>
                  {subject.name}
                </td>
                <td data-testid={`text-semester-${subject.id}`}>Semester {subject.semester}</td>
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
                    {/* Form modals are rendered once below (outside the table rows) */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Single modal instances rendered outside table rows so they exist even when subject list is empty */}
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
  );
}
