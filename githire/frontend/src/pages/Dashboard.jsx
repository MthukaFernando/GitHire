import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject, deleteProject } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!name.trim()) return setError('Project name is required');
    setCreating(true);
    setError('');
    try {
      const response = await createProject(name, description);
      setProjects([response.data.project, ...projects]);
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="page" style={{ paddingTop: '88px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#f8fafc',
            letterSpacing: '-0.5px',
          }}>
            Projects
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            marginTop: '4px',
          }}>
            Manage your hiring projects and candidates
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          + New Project
        </button>
      </div>

      {/* Projects grid */}
      {loading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#f8fafc',
            marginBottom: '8px',
          }}>
            No projects yet
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            marginBottom: '24px',
          }}>
            Create your first project to start evaluating candidates
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create project modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '24px',
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '24px',
            }}>
              New Project
            </h2>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: '#fca5a5',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#94a3b8',
                marginBottom: '8px',
              }}>
                Project name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter job title here..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#94a3b8',
                marginBottom: '8px',
              }}>
                Description (optional)
              </label>
              <textarea
                className="input"
                placeholder="Brief description of the role..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-ghost"
                onClick={() => {
                  setShowModal(false);
                  setName('');
                  setDescription('');
                  setError('');
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateProject}
                disabled={creating}
                style={{ flex: 1 }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;