import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  getCandidates,
  addCandidate,
  removeCandidate,
  saveRequirements,
  getRequirements,
  runAnalysis,
  getLatestAnalysis
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CandidateCard from '../components/CandidateCard';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [requirements, setRequirements] = useState('');
  const [savedRequirements, setSavedRequirements] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('candidates');

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [projectRes, requirementsRes, analysisRes] = await Promise.all([
        getProject(id),
        getRequirements(id).catch(() => null),
        getLatestAnalysis(id).catch(() => null),
      ]);

      setProject(projectRes.data.project);

      if (requirementsRes?.data?.requirements?.length > 0) {
        setSavedRequirements(requirementsRes.data.requirements[0].requirements_text);
        setRequirements(requirementsRes.data.requirements[0].requirements_text);
      }

      if (analysisRes?.data?.analysis) {
        setAnalysis(analysisRes.data.analysis.result);
      }

    } catch (err) {
      console.error('Failed to fetch project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const response = await getCandidates(id);
      setCandidates(response.data.candidates);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) fetchCandidates();
  }, [loading]);

  const handleAddCandidate = async () => {
    if (!githubUrl.trim()) return setError('Please enter a GitHub profile URL');
    if (!githubUrl.includes('github.com')) return setError('Please enter a valid GitHub URL');
    setAddingCandidate(true);
    setError('');
    try {
      await addCandidate(id, githubUrl);
      setGithubUrl('');
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleRemoveCandidate = async (candidateId) => {
    try {
      await removeCandidate(id, candidateId);
      setCandidates(candidates.filter(c => c.id !== candidateId));
    } catch (err) {
      console.error('Failed to remove candidate:', err);
    }
  };

  const handleSaveRequirements = async () => {
    if (!requirements.trim()) return;
    setSavingRequirements(true);
    try {
      await saveRequirements(id, requirements);
      setSavedRequirements(requirements);
    } catch (err) {
      console.error('Failed to save requirements:', err);
    } finally {
      setSavingRequirements(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalysisLoading(true);
    setActiveTab('analysis');
    try {
      const response = await runAnalysis(id);
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error('Failed to run analysis:', err);
      setError(err.response?.data?.message || 'Failed to run analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading project..." />;

  return (
    <div className="page" style={{ paddingTop: '88px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back to projects
        </button>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#f8fafc',
          letterSpacing: '-0.5px',
        }}>
          {project?.name}
        </h1>
        {project?.description && (
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            {project.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '28px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        padding: '4px',
        width: 'fit-content',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {['candidates', 'requirements', 'analysis'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#7c3aed' : 'none',
              border: 'none',
              color: activeTab === tab ? 'white' : '#94a3b8',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Candidates Tab */}
      {activeTab === 'candidates' && (
        <div>
          {/* Add candidate */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '12px',
            }}>
              Add Candidate
            </h3>
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '12px',
                color: '#fca5a5',
                fontSize: '13px',
              }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="input"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCandidate()}
              />
              <button
                className="btn-primary"
                onClick={handleAddCandidate}
                disabled={addingCandidate}
                style={{ whiteSpace: 'nowrap' }}
              >
                {addingCandidate ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Candidates list */}
          {candidatesLoading ? (
            <LoadingSpinner message="Fetching GitHub profiles..." />
          ) : candidates.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                No candidates yet. Add a GitHub profile URL above to get started.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {candidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onRemove={handleRemoveCandidate}
                  onClick={() => navigate(`/projects/${id}/candidates/${candidate.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '8px',
            }}>
              Job Requirements
            </h3>
            <p style={{
              color: '#94a3b8',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              Paste the job description or list specific skills and requirements. The AI will use this to rank candidates.
            </p>
            <textarea
              className="input"
              placeholder="e.g. Looking for a React developer with 1+ years experience, Node.js, MongoDB, REST APIs, Git..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={10}
              style={{ resize: 'vertical', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={handleSaveRequirements}
                disabled={savingRequirements}
              >
                {savingRequirements ? 'Saving...' : 'Save Requirements'}
              </button>
              {savedRequirements && candidates.length > 0 && (
                <button
                  className="btn-primary"
                  onClick={handleRunAnalysis}
                  disabled={analysisLoading}
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                >
                  {analysisLoading ? 'Analysing...' : '⚡ Run AI Analysis'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div>
          {analysisLoading ? (
            <LoadingSpinner message="AI is analysing candidates..." />
          ) : !analysis ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#f8fafc',
                marginBottom: '8px',
              }}>
                No analysis yet
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                Add candidates and job requirements, then run the AI analysis to rank them.
              </p>
              <button
                className="btn-primary"
                onClick={() => setActiveTab('requirements')}
              >
                Set Requirements
              </button>
            </div>
          ) : (
            <div>
              {/* Summary */}
              <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#a78bfa',
                  marginBottom: '12px',
                }}>
                  📊 Analysis Summary
                </h3>
                <p style={{ color: '#f8fafc', fontSize: '14px', lineHeight: '1.6' }}>
                  {analysis.analysis_summary}
                </p>
              </div>

              {/* Ranked candidates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {analysis.ranked_candidates?.map((candidate) => (
                  <div key={candidate.username} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: 'white',
                        }}>
                          #{candidate.rank}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#f8fafc',
                          }}>
                            {candidate.username}
                          </h3>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(124, 58, 237, 0.2)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '20px',
                        padding: '4px 14px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#a78bfa',
                      }}>
                        {candidate.match_score}% match
                      </div>
                    </div>

                    <p style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                    }}>
                      {candidate.summary}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <h4 style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#3b82f6',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          Strengths
                        </h4>
                        {candidate.strengths?.map((s, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '6px',
                          }}>
                            <span style={{ color: '#3b82f6', fontSize: '12px', marginTop: '2px' }}>✓</span>
                            <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{s}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#94a3b8',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          Gaps
                        </h4>
                        {candidate.gaps?.map((g, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            marginBottom: '6px',
                          }}>
                            <span style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>○</span>
                            <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{g}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Re-run button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary"
                  onClick={handleRunAnalysis}
                  disabled={analysisLoading}
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                >
                  ⚡ Re-run Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Project;