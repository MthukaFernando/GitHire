import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getGithubProfile } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import logo from "../assets/logo.png";

const COLORS = [
  "#7c3aed",
  "#3b82f6",
  "#a78bfa",
  "#93c5fd",
  "#6d28d9",
  "#1d4ed8",
  "#c4b5fd",
  "#bfdbfe",
];

const Landing = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const analyserRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=signup")) {
      navigate("/login?verified=true");
    }
  }, []);

  const handleAnalyse = async () => {
    if (!githubUrl.trim()) return setError("Please enter a GitHub profile URL");
    if (!githubUrl.includes("github.com"))
      return setError("Please enter a valid GitHub URL");

    const username = githubUrl
      .replace("https://github.com/", "")
      .replace("http://github.com/", "")
      .replace(/\/$/, "")
      .trim();

    setLoading(true);
    setError("");
    setProfileData(null);

    try {
      const response = await getGithubProfile(username);
      setProfileData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("GitHub user not found. Please check the URL.");
      } else {
        setError("Failed to fetch profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToAnalyser = () => {
    analyserRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const languageData = profileData?.languages
    ? Object.entries(profileData.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  const activityData = profileData?.activity
    ? Object.entries(profileData.activity)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([month, count]) => ({ month: month.substring(5), count }))
    : [];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={logo}
            alt="GitHire logo"
            style={{ width: "38px", height: "39px", borderRadius: "8px" }}
          />
          <span
            style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}
          >
            Git<span style={{ color: "#a78bfa" }}>Hire</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            to="/login"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              fontSize: "13px",
            }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="btn-primary"
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              fontSize: "13px",
            }}
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero section */}
      <div
        style={{
          paddingTop: "140px",
          paddingBottom: "80px",
          textAlign: "center",
          padding: "140px 24px 80px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "#f8fafc",
            letterSpacing: "-2px",
            lineHeight: "1.1",
            marginBottom: "20px",
          }}
        >
          Hire smarter with <span>GitHub insights</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#94a3b8",
            lineHeight: "1.7",
            marginBottom: "40px",
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}
        >
          Analyse any GitHub profile instantly. Organise candidates into
          projects and use AI to rank them against job requirements.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn-primary"
            onClick={scrollToAnalyser}
            style={{ padding: "14px 28px", fontSize: "15px" }}
          >
            Analyse a Profile
          </button>
          <Link
            to="/register"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              padding: "14px 28px",
              fontSize: "15px",
            }}
          >
            Sign up for AI Matching →
          </Link>
        </div>
      </div>

      {/* Features section */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {[
          {
            icon: "🔍",
            title: "Instant Profile Analysis",
            description:
              "Paste any GitHub URL and instantly see language breakdowns, repository stats, and activity patterns. No sign up required.",
          },
          {
            icon: "🤖",
            title: "AI-Powered Matching",
            description:
              "Create a project, enter technical requirements and let AI rank candidates by match score, highlighting strengths and skill gaps. (Only to be used for technical skills visible on GitHub such as programming languages, frameworks, and tools.)",
          },
          {
            icon: "🎯",
            title: "Optimise Your Own Profile",
            description:
              "Job seekers can analyse their own GitHub profile to see how recruiters view them. Sign up to run your profile against real job descriptions and discover exactly which skills to add to improve your match score.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="glass-card"
            style={{ padding: "28px" }}
          >
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>
              {feature.icon}
            </div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#f8fafc",
                marginBottom: "10px",
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Analyser section */}
      <div
        ref={analyserRef}
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#f8fafc",
              letterSpacing: "-0.5px",
              marginBottom: "12px",
            }}
          >
            Analyse a GitHub Profile
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "15px" }}>
            No sign up required. Paste any public GitHub profile URL below.
          </p>
        </div>

        {/* Input */}
        <div
          className="glass-card"
          style={{ padding: "24px", marginBottom: "24px" }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                color: "#fca5a5",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              className="input"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyse()}
            />
            <button
              className="btn-primary"
              onClick={handleAnalyse}
              disabled={loading}
              style={{ whiteSpace: "nowrap", padding: "10px 24px" }}
            >
              {loading ? "Analysing..." : "Analyse"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner message="Fetching GitHub profile..." />}

        {/* Results */}
        {profileData && !loading && (
          <div>
            {/* Profile header */}
            <div
              className="glass-card"
              style={{ padding: "28px", marginBottom: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                {profileData.profile?.avatar_url ? (
                  <img
                    src={profileData.profile.avatar_url}
                    alt={profileData.profile.username}
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      border: "3px solid rgba(124, 58, 237, 0.4)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      color: "white",
                      fontWeight: "700",
                    }}
                  >
                    {profileData.profile?.username?.[0]?.toUpperCase()}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: "22px",
                          fontWeight: "700",
                          color: "#f8fafc",
                          marginBottom: "4px",
                        }}
                      >
                        {profileData.profile?.name ||
                          profileData.profile?.username}
                      </h2>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "14px",
                          marginBottom: "8px",
                        }}
                      >
                        @{profileData.profile?.username}
                      </p>
                      {profileData.profile?.bio && (
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            marginBottom: "8px",
                          }}
                        >
                          {profileData.profile.bio}
                        </p>
                      )}
                      {profileData.profile?.location && (
                        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                          📍 {profileData.profile.location}
                        </p>
                      )}
                    </div>
                    <a
                      href={profileData.profile?.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                      style={{ fontSize: "13px", textDecoration: "none" }}
                    >
                      View on GitHub ↗
                    </a>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "32px",
                      marginTop: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      {
                        label: "Repositories",
                        value: profileData.profile?.public_repos,
                      },
                      {
                        label: "Followers",
                        value: profileData.profile?.followers,
                      },
                      {
                        label: "Following",
                        value: profileData.profile?.following,
                      },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#f8fafc",
                          }}
                        >
                          {stat.value || 0}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                marginBottom: "20px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "10px",
                padding: "4px",
                width: "fit-content",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {["overview", "repositories", "activity"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? "#7c3aed" : "none",
                    border: "none",
                    color: activeTab === tab ? "white" : "#94a3b8",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    textTransform: "capitalize",
                    transition: "all 0.2s ease",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                <div className="glass-card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#f8fafc",
                      marginBottom: "20px",
                    }}
                  >
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
                            <Cell
                              key={entry.name}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#13131a",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "8px",
                            color: "#f8fafc",
                          }}
                        />
                        <Legend
                          formatter={(value) => (
                            <span
                              style={{ color: "#94a3b8", fontSize: "12px" }}
                            >
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                      No language data available
                    </p>
                  )}
                </div>

                <div className="glass-card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#f8fafc",
                      marginBottom: "16px",
                    }}
                  >
                    Top Repositories
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {profileData.topRepos?.map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.06)",
                          display: "block",
                          transition: "border-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(124, 58, 237, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.06)";
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#a78bfa",
                            }}
                          >
                            {repo.name}
                          </span>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                            ⭐ {repo.stars}
                          </span>
                        </div>
                        {repo.description && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#94a3b8",
                              lineHeight: "1.4",
                            }}
                          >
                            {repo.description}
                          </p>
                        )}
                        {repo.language && (
                          <span
                            style={{
                              display: "inline-block",
                              marginTop: "6px",
                              fontSize: "11px",
                              color: "#93c5fd",
                              background: "rgba(59, 130, 246, 0.1)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {repo.language}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Repositories tab */}
            {activeTab === "repositories" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {profileData.allRepos?.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card"
                    style={{
                      padding: "16px 20px",
                      textDecoration: "none",
                      display: "block",
                      transition: "border-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(124, 58, 237, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#a78bfa",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {repo.name}
                        </span>
                        {repo.description && (
                          <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                            {repo.description}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          flexShrink: 0,
                        }}
                      >
                        {repo.language && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#93c5fd",
                              background: "rgba(59, 130, 246, 0.1)",
                              padding: "3px 10px",
                              borderRadius: "6px",
                            }}
                          >
                            {repo.language}
                          </span>
                        )}
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                          ⭐ {repo.stars}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Activity tab */}
            {activeTab === "activity" && (
              <div className="glass-card" style={{ padding: "24px" }}>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#f8fafc",
                    marginBottom: "20px",
                  }}
                >
                  Repository Activity (Last 12 months)
                </h3>
                {activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#13131a",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                          color: "#f8fafc",
                        }}
                        cursor={{ fill: "rgba(124, 58, 237, 0.1)" }}
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
                  <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                    No activity data available
                  </p>
                )}
              </div>
            )}

            {/* CTA Banner */}
            <div
              style={{
                marginTop: "28px",
                padding: "28px",
                background:
                  "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(59, 130, 246, 0.15))",
                border: "1px solid rgba(124, 58, 237, 0.25)",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#f8fafc",
                    marginBottom: "6px",
                  }}
                >
                  Want to match this profile against job requirements?
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    lineHeight: "1.5",
                  }}
                >
                  Sign up to save candidates, create hiring projects, and use AI
                  to rank them by match score.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => navigate("/register")}
                style={{ whiteSpace: "nowrap", padding: "12px 24px" }}
              >
                Sign up for AI Matching →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px",
          textAlign: "center",
        }}
      ></div>
    </div>
  );
};

export default Landing;
