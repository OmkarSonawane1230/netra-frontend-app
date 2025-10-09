// src/services/api.tsx (TypeScript version)

// Type definitions
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: string;
}

export interface Lecture {
  subject: string;
  class: string;
  time_slot: string;
  staff_id: string;
  [key: string]: any;
}

export interface Student {
  roll_no: string;
  name: string;
  class: string;
  department: string;
  [key: string]: any;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  time_slot: string;
  student_class: string;
  [key: string]: any;
}

export interface NotificationData {
  message: string;
  recipients: string[];
  [key: string]: any;
}

export interface TimetableData {
  [key: string]: any;
}

export interface HodData {
  id?: string;
  full_name: string;
  username: string;
  password?: string;
  department: string;
  [key: string]: any;
}

export interface DepartmentData {
  name: string;
  code: string;
  [key: string]: any;
}

export interface SubjectData {
  name: string;
  code: string;
  department: string;
  [key: string]: any;
}

// Payload used when creating a subject from the frontend. Many fields are optional
// because HOD may create a subject without assigning a teacher yet.
export interface CreateSubjectData {
  name: string;
  abbreviation?: string;
  code?: string;
  department?: string;
  semester?: number;
  credits?: number;
  type?: string;
  teacher?: string;
  totalStudents?: number;
  status?: string;
  [key: string]: any;
}

export interface StaffData {
  name: string;
  username: string;
  department: string;
  [key: string]: any;
}

export interface ProfileData {
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// This should be defined in a .env.local file in your frontend's root directory
const API_URL: string = process.env.NEXT_PUBLIC_API_URL || 'https://curly-fortnight-9765qxr65vxp2xx6q-8000.app.github.dev';

// --- Helper Function to get Auth Headers ---
const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Debug: Log headers for every API call
    console.log('getAuthHeaders - token:', token, 'headers:', headers);
    return headers;
};

// --- Authentication Service ---
export const apiLogin = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// --- Attendance & Verification Services ---
export const startVerification = async (currentLecture: Lecture): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/attendance/start_verification`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ current_lecture: currentLecture }),
    });
    if (!response.ok) throw new Error('Failed to start verification');
    return await response.json();
  } catch (error) { throw error; }
};

export const stopVerification = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/attendance/stop_verification`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to stop verification');
    return await response.json();
  } catch (error) { throw error; }
};

// Public versions for automatic scheduler (no auth required)
export const startVerificationPublic = async (currentLecture: Lecture): Promise<any> => {
  try {
    console.log(`API: Starting verification for ${currentLecture.subject} at ${API_URL}/api/attendance/start_verification`);
    const response = await fetch(`${API_URL}/api/attendance/start_verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // No auth headers
      body: JSON.stringify({ current_lecture: currentLecture }),
    });
    console.log(`API: Response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API: Error response: ${errorText}`);
      throw new Error(`Failed to start verification: ${response.status} ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Start verification successful:', result);
    return result;
  } catch (error) { 
    console.error('API: Start verification error:', error);
    throw error; 
  }
};

export const stopVerificationPublic = async (): Promise<any> => {
  try {
    console.log(`API: Stopping verification at ${API_URL}/api/attendance/stop_verification`);
    const response = await fetch(`${API_URL}/api/attendance/stop_verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // No auth headers
    });
    console.log(`API: Response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API: Error response: ${errorText}`);
      throw new Error(`Failed to stop verification: ${response.status} ${errorText}`);
    }
    const result = await response.json();
    console.log('API: Stop verification successful:', result);
    return result;
  } catch (error) { 
    console.error('API: Stop verification error:', error);
    throw error; 
  }
};

export const getStreamUrl = (): string => `${API_URL}/api/attendance/stream`;

// --- Student & Management Services ---
export const getStudents = async (): Promise<Student[]> => {
  try {
    const response = await fetch(`${API_URL}/api/management/students`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) { 
    console.error("API Error getStudents:", error); 
    throw error;
  }
};

export const getMyAttendanceRecords = async (date: string | null = null): Promise<AttendanceRecord[]> => {
    try {
        // *** THIS IS THE CRITICAL FIX ***
        // The path now correctly includes "/attendance_records/"
        const url = date 
            ? `${API_URL}/api/management/attendance_records?date=${date}` 
            : `${API_URL}/api/management/attendance_records`;
            
        const response = await fetch(url, { headers: getAuthHeaders() });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch your records');
        }
        return await response.json();
    } catch (error) {
        console.error("API Error getMyAttendanceRecords:", error);
        throw error;
    }
};

export const getAbsentRecords = async (date: string, subject: string, time_slot: string, student_class: string): Promise<AttendanceRecord[]> => {
    try {
        // 2. Add student_class to the URL query string
        const url = `${API_URL}/api/management/attendance_records/absent?date=${date}&subject=${subject}&time_slot=${time_slot}&student_class=${student_class}`;
        
        const response = await fetch(url, { headers: getAuthHeaders() });
        
        if (!response.ok) {
            // Use our improved error handling
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch absent records');
        }
        
        return await response.json();
    } catch (error) { 
        console.error("API Error getAbsentRecords:", error);
        throw error;
    }
};

export const getTimetable = async (): Promise<TimetableData> => {
  try {
    const response = await fetch(`${API_URL}/api/management/timetable`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getTimetablePublic = async (): Promise<TimetableData> => {
  try {
    const response = await fetch(`${API_URL}/api/management/timetable`, {
      headers: { 'Content-Type': 'application/json' } // No auth headers
    });
    if (!response.ok) throw new Error('Failed to fetch timetable');
    return await response.json();
  } catch (error) {
    throw error;
  }
};



export const getAttendance = async (): Promise<any> => {
   try {
    const response = await fetch(`${API_URL}/api/attendance/get_attendance`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  } catch (error) { return {}; }
};

export const getAttendanceRecords = async (date: string | null = null): Promise<AttendanceRecord[]> => {
    try {
        const url = date ? `${API_URL}/api/management/attendance_records?date=${date}` : `${API_URL}/api/management/attendance_records`;
        const response = await fetch(url, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch records');
        return await response.json();
    } catch (error) { return []; }
};


export const notifyAbsentees = async (notificationData: NotificationData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/notify_absentees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });
    if (!response.ok) throw new Error('Failed to send notifications');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const notifyAbsenteesPublic = async (notificationData: NotificationData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/notify_absentees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // No auth headers
      body: JSON.stringify(notificationData),
    });
    if (!response.ok) throw new Error('Failed to send notifications');
    return await response.json();
  } catch (error) {
    throw error;
  }
};


export const deleteStudent = async (roll_no: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/students/delete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roll_no }),
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const registerStudent = async (studentData: FormData): Promise<any> => {
    try {
        // For FormData, we don't set Content-Type; the browser does it.
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}/api/registration/register_student`, {
            method: 'POST',
            headers: headers,
            body: studentData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to register student');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};


export const saveTimetable = async (timetableData: TimetableData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/timetable`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(timetableData),
    });
    if (!response.ok) throw new Error('Failed to save timetable');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getAvailableClasses = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/api/management/available_classes`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch available classes');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// --- Reporting API: monthly summaries and timeseries ---
export const getMonthlySummary = async (year: number, month: number): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/attendance_summary/monthly?year=${year}&month=${month}`, { headers: getAuthHeaders() });
    const bodyText = await response.text();
    let jsonBody: any = null;
    try { jsonBody = bodyText ? JSON.parse(bodyText) : null; } catch (e) { jsonBody = { detail: bodyText }; }
    if (!response.ok) {
      const err: any = new Error(jsonBody?.detail || `Failed to fetch monthly summary (${response.status})`);
      err.status = response.status;
      throw err;
    }
    return jsonBody;
  } catch (error) { console.error('API Error getMonthlySummary:', error); throw error; }
}

export const getMonthlySummaryForTeacher = async (teacher: string, year: number, month: number): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/attendance_summary/monthly/teacher?teacher=${encodeURIComponent(teacher)}&year=${year}&month=${month}`, { headers: getAuthHeaders() });
    const bodyText = await response.text();
    let jsonBody: any = null;
    try { jsonBody = bodyText ? JSON.parse(bodyText) : null; } catch (e) { jsonBody = { detail: bodyText }; }
    if (!response.ok) {
      const err: any = new Error(jsonBody?.detail || `Failed to fetch monthly summary for teacher (${response.status})`);
      err.status = response.status;
      throw err;
    }
    return jsonBody;
  } catch (error) { console.error('API Error getMonthlySummaryForTeacher:', error); throw error; }
}

export const getSubjectTimeseries = async (year: number, month: number, subject: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/attendance_summary/timeseries?year=${year}&month=${month}&subject=${encodeURIComponent(subject)}`, { headers: getAuthHeaders() });
    const bodyText = await response.text();
    let jsonBody: any = null;
    try { jsonBody = bodyText ? JSON.parse(bodyText) : null; } catch (e) { jsonBody = { detail: bodyText }; }
    if (!response.ok) {
      const err: any = new Error(jsonBody?.detail || `Failed to fetch timeseries (${response.status})`);
      err.status = response.status;
      throw err;
    }
    return jsonBody;
  } catch (error) { console.error('API Error getSubjectTimeseries:', error); throw error; }
}

export const createHod = async (hodData: HodData): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/api/principal/hods`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(hodData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create HOD');
        }
        return await response.json();
    } catch (error) { throw error; }
};

export const getHods = async (): Promise<HodData[]> => {
    try {
        const response = await fetch(`${API_URL}/api/principal/hods`, { headers: getAuthHeaders() });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch HODs');
        }
        return await response.json();
    } catch (error) { throw error; }
};

export const createDepartment = async (deptData: DepartmentData): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/api/principal/departments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(deptData),
        });
        if (!response.ok) throw new Error('Failed to create department');
        return await response.json();
    } catch (error) { throw error; }
};

export const getDepartments = async (): Promise<DepartmentData[]> => {
    try {
        const response = await fetch(`${API_URL}/api/principal/departments`, { headers: getAuthHeaders() });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch departments: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) { 
        throw error;
    }
};

export const createSubject = async (subjectData: CreateSubjectData): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/api/hod/subjects`, {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(subjectData),
        });
        if (!response.ok) throw new Error('Failed to create subject');
        return await response.json();
    } catch (error) { throw error; }
};

export const getSubjects = async (): Promise<SubjectData[]> => {
    try {
        const response = await fetch(`${API_URL}/api/hod/subjects`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch subjects');
        return await response.json();
    } catch (error) { return []; }
};

export const getSubjectsWithStaff = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/api/hod/subjects_with_staff`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch subjects with staff');
        return await response.json();
    } catch (error) {
        console.error("API Error getSubjectsWithStaff:", error);
        return [];
    }
};

export const createStaff = async (staffFormData: FormData): Promise<any> => {
  // For FormData, we must not set 'Content-Type' in headers.
  // The browser will do it for us, including the necessary boundary.
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/hod/staff`, {
    method: 'POST',
    headers: headers, // Send headers without Content-Type
    body: staffFormData, // Send the FormData object directly
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create staff');
  }
  
  return await response.json();
};
// =

export const getStaff = async (): Promise<StaffData[]> => {
    try {
        const response = await fetch(`${API_URL}/api/hod/staff`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch staff');
        return await response.json();
    } catch (error) { return []; }
};

export const deleteHod = async (hodId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/principal/hods/${hodId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete HOD');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const deleteDepartment = async (deptId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/principal/departments/${deptId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete Department');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const deleteStaff = async (staffId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/hod/staff/${staffId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete Staff');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const deleteSubject = async (subjectId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/hod/subjects/${subjectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete Subject');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const updateDepartment = async (deptId: string, deptData: Partial<DepartmentData>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/principal/departments/${deptId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(deptData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update department');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const updateUserProfile = async (profileData: ProfileData): Promise<any> => {
  const response = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update profile');
  }
  return await response.json(); 
};

export const changePassword = async (passwordData: PasswordData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to change password');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const updateSubject = async (subjectId: string, subjectData: Partial<SubjectData>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/hod/subjects/${subjectId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(subjectData),
    });
    if (!response.ok) throw new Error('Failed to update subject');
    return await response.json();
  } catch (error) { throw error; }
};

export const updateStaff = async (staffId: string, staffData: Partial<StaffData>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/hod/staff/${staffId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(staffData),
    });
    if (!response.ok) throw new Error('Failed to update staff');
    return await response.json();
  } catch (error) { throw error; }
};

export const updateHodDepartment = async (hodId: string, departmentCode: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/principal/hods/${hodId}/department`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ department: departmentCode }),
    });
    if (!response.ok) throw new Error('Failed to update HOD department');
    return await response.json();
  } catch (error) { throw error; }
};

export const updateStudent = async (rollNo: string, studentData: Partial<Student>): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/management/students/${rollNo}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update student');
    }
    return await response.json();
  } catch (error) { throw error; }
};

export const getAssignedSubjectsForStaff = async (staffId: string): Promise<number[]> => {
  try {
    const response = await fetch(`${API_URL}/api/hod/staff/${staffId}/subjects`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch assigned subjects');
    }
    return await response.json(); // Should return an array of IDs, e.g., [1, 5]
  } catch (error) { 
    console.error("API Error getAssignedSubjectsForStaff:", error);
    throw error;
  }
};