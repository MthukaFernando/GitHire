import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidate } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#7c3aed', '#3b82f6', '#a78bfa', '#93c5fd', '#6d28d9', '#1d4ed8', '#c4b5fd', '#bfdbfe'];

const Candidate = () => {
  const { projectId, candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      const response = await getCandidate(projectId, candidateId);
      setCandidate(response.data.candidate);
    } catch (err) {
      console.error('Failed to fetch candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading candidate profile..." />;
  if (!candidate) return <div style={{ color: 'white', padding: '24px' }}>Candidate not found</div>;

  const { githubData } = candidate;
  const profile = githubData?.profile;

  const languageData = githubData?.languages
    ? Object.entries(githubData.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  const activityData = githubData?.activity
    ? Object.entries(githubData.activity)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([month, count]) => ({ month: month.substring(5), count }))
    : [];

  return (
    <div className="page" style={{ paddingTop: '88px' }}>

      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '0',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        Back to project
      </button>

      <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '3px solid rgba(124, 58, 237, 0.4)',
              }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              fontWeight: '700',
            }}>
              {candidate.github_username[0].toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#f8fafc',
                  marginBottom: '4px',
                }}>
                  {profile?.name || candidate.github_username}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                  @{profile?.username}
                </p>
                {profile?.bio && (
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                  }}>
                    {profile.bio}
                  </p>
                )}
                {profile?.location && (
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
                    {profile.location}
                  </p>
                )}
              </div>
              <a
                href={profile?.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ fontSize: '13px', textDecoration: 'none' }}
              >
                View on GitHub
              </a>
            </div>

            <div style={{ display: 'flex', gap: '32px' }}>
              {[
                { label: 'Repositories', value: profile?.public_repos },
                { label: 'Followers', value: profile?.followers },
                { label: 'Following', value: profile?.following },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
                    {stat.value || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        padding: '4px',
        width: 'fit-content',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {['overview', 'repositories', 'activity'].map(tab => (
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

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '20px' }}>
              Language Breakdown
            </h3>
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#13131a',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No language data available</p>
            )}
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '16px' }}>
              Top Repositories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {githubData?.topRepos?.map(repo => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'block',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#a78bfa' }}>
                      {repo.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {repo.stars}
                    </span>
                  </div>
                  {repo.description && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                      {repo.description}
                    </p>
                  )}
                  {repo.language && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontSize: '11px',
                      color: '#93c5fd',
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      {repo.language}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'repositories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {githubData?.allRepos?.map(repo => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card"
              style={{
                padding: '16px 20px',
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', marginBottom: '4px', display: 'block' }}>
                    {repo.name}
                  </span>
                  {repo.description && (
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {repo.description}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  {repo.language && (
                    <span style={{
                      fontSize: '12px',
                      color: '#93c5fd',
                      background: 'rgba(59, 130, 246, 0.1)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                    }}>
                      {repo.language}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {repo.stars}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '20px' }}>
            Repository Activity (Last 12 months)
          </h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#13131a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
                />
                <Bar
                  dataKey="count"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  name="Repos updated"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>No activity data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Candidate;
