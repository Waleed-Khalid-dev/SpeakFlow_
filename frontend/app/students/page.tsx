"use client";

import { Users, Search, Plus, MoreVertical, Edit2, Trash2, Activity, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "@/lib/api";
import { useSpeakFlow } from "@/context/SpeakFlowContext";

interface StudentData {
  id: string;
  name: string;
  grade: number;
  level: string;
  created_at?: string;
  status?: string; // Simulated for now since we don't calculate it dynamically yet
  lastSession?: string; // Simulated for now
}

export default function StudentsPage() {
  const { addNotification } = useSpeakFlow();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form state
  const [currentStudent, setCurrentStudent] = useState<StudentData | null>(null);
  const [formData, setFormData] = useState({ name: "", grade: 3, level: "Level 1" });
  const [saving, setSaving] = useState(false);
  
  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchStudents();
      // Add mock status/lastSession until backend provides it
      const enriched = data.map((s: any) => ({
        ...s,
        status: s.grade > 2 ? "On Track" : "Needs Practice",
        lastSession: "2 days ago"
      }));
      setStudents(enriched);
    } catch (err) {
      addNotification({ title: "Error", message: "Failed to load students", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createStudent(formData);
      addNotification({ title: "Success", message: "Student added successfully", type: "success" });
      setShowAddModal(false);
      setFormData({ name: "", grade: 3, level: "Level 1" });
      loadStudents();
    } catch (err) {
      addNotification({ title: "Error", message: "Failed to add student", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    setSaving(true);
    try {
      await updateStudent(currentStudent.id, formData);
      addNotification({ title: "Success", message: "Student updated successfully", type: "success" });
      setShowEditModal(false);
      loadStudents();
    } catch (err) {
      addNotification({ title: "Error", message: "Failed to update student", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentStudent) return;
    setSaving(true);
    try {
      await deleteStudent(currentStudent.id);
      addNotification({ title: "Success", message: "Student deleted successfully", type: "success" });
      setShowDeleteModal(false);
      loadStudents();
    } catch (err) {
      addNotification({ title: "Error", message: "Failed to delete student", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (student: StudentData) => {
    setCurrentStudent(student);
    setFormData({ name: student.name, grade: student.grade, level: student.level });
    setShowEditModal(true);
    setOpenDropdownId(null);
  };

  const openDelete = (student: StudentData) => {
    setCurrentStudent(student);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text-primary">Student Roster</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and monitor all your students.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: "", grade: 3, level: "Level 1" });
            setShowAddModal(true);
          }}
          className="flex items-center px-4 py-2 bg-text-primary text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      <div className="speakflow-card bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary bg-gray-50"
              placeholder="Search by name or ID..."
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <span className="font-bold">{students.length}</span> students total
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Student Name</th>
                <th className="px-6 py-4 font-bold">Grade / Level</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Last Session</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">No students found. Click 'Add Student' to start.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-primary flex items-center">
                      <div className="w-8 h-8 rounded-full bg-accent-primary-bg text-accent-primary-dark flex items-center justify-center mr-3 font-bold text-xs">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      Grade {s.grade} • {s.level}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        s.status === 'On Track' ? 'bg-green-100 text-green-700' :
                        s.status === 'Excelling' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{s.lastSession}</td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === s.id ? null : s.id)}
                        className="p-1 text-text-muted hover:text-text-primary rounded"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {openDropdownId === s.id && (
                        <div ref={dropdownRef} className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 text-left">
                          <button onClick={() => openEdit(s)} className="w-full px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary flex items-center">
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Student
                          </button>
                          <button onClick={() => { setOpenDropdownId(null); addNotification({title: "Progress", message: "Progress view coming soon", type: "info"}); }} className="w-full px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary flex items-center">
                            <Activity className="w-4 h-4 mr-2" /> View Progress
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button onClick={() => openDelete(s)} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-primary">{showAddModal ? 'Add New Student' : 'Edit Student'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent-primary" 
                  placeholder="e.g. Maya Lin"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1">Grade</label>
                  <select 
                    value={formData.grade}
                    onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent-primary"
                  >
                    {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-1">Reading Level</label>
                  <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-accent-primary"
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="px-4 py-2 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 bg-text-primary text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (showAddModal ? 'Add Student' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Delete Student?</h2>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete {currentStudent?.name}? This action will permanently remove their profile and all associated reading sessions.
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-lg transition-colors w-full"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm w-full disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
