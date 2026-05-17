const CandidateCard = ({ candidate, onRemove, onClick }) => {
  const { githubData } = candidate;

  const topLanguages = githubData?.languages
    ? Object.entries(githubData.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
    : [];

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={onClick}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Left avatar and info */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {githubData?.profile?.avatar_url ? (
            <img
              src={githubData.profile.avatar_url}
              alt={candidate.github_username}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px solid rgba(124, 58, 237, 0.3)',
              }}
            />
          ) : (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white',
              fontWeight: '700',
            }}>
              {candidate.github_username[0].toUpperCase()}
            </div>
          )}

          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '2px',
            }}>
              {githubData?.profile?.name || candidate.github_username}
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              marginBottom: '8px',
            }}>
              @{candidate.github_username}
            </p>

            {githubData?.profile?.bio && (
              <p style={{
                fontSize: '13px',
                color: '#94a3b8',
                marginBottom: '12px',
                maxWidth: '500px',
                lineHeight: '1.5',
              }}>
                {githubData.profile.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '12px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#f8fafc',
                }}>
                  {githubData?.profile?.public_repos || 0}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Repos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#f8fafc',
                }}>
                  {githubData?.profile?.followers || 0}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Followers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#f8fafc',
                }}>
                  {githubData?.profile?.following || 0}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Following</div>
              </div>
            </div>

            {/* Languages */}
            {topLanguages.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {topLanguages.map(([lang, count]) => (
                  <span
                    key={lang}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      fontSize: '12px',
                      color: '#93c5fd',
                      fontWeight: '500',
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(candidate.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px',
            borderRadius: '4px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;