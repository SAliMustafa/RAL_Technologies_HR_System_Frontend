import React, { useEffect, useState } from "react";
import { getMyProfile } from "../../services/employeeService";
import "../../components/css/Employee/MyProfile.css";
import Navbar from "../../components/Navbar";
const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile();

        // console.log(data);

        setProfile(data.employeeId);
      } catch (err) {
        console.log(err);

        setError(
          err?.response?.data?.message ||
          "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    
    <main className="profile-page">
    {/* <Navbar/> */}

      <section className="profile-header">
        <div className="profile-avatar">
          {profile?.name_en?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          <h1>{profile?.name_en}</h1>
          <p>{profile?.job_title}</p>
        </div>
      </section>

      <section className="profile-card">
        <h2>Personal Information</h2>

        <div className="profile-grid">

          <ProfileItem
            label="Employee Code"
            value={profile?.employee_code}
          />

          <ProfileItem
            label="English Name"
            value={profile?.name_en}
          />

          <ProfileItem
            label="Arabic Name"
            value={profile?.name_ar}
          />

          <ProfileItem
            label="CPR Number"
            value={profile?.cpr_number}
          />

          <ProfileItem
            label="Nationality"
            value={profile?.nationality}
          />

          <ProfileItem
            label="Gender"
            value={profile?.gender}
          />

          <ProfileItem
            label="Mobile"
            value={profile?.mobile}
          />

        </div>
      </section>

      <section className="profile-card">
        <h2>Employment Information</h2>

        <div className="profile-grid">

          <ProfileItem
            label="Department"
            value={profile?.department}
          />

          <ProfileItem
            label="Job Title"
            value={profile?.job_title}
          />

          <ProfileItem
            label="Employment Type"
            value={profile?.employment_type}
          />

          <ProfileItem
            label="Status"
            value={profile?.status}
          />

          <ProfileItem
            label="Date of Joining"
            value={
              profile?.date_of_joining
                ? new Date(profile.date_of_joining)
                    .toLocaleDateString()
                : "—"
            }
          />

        </div>
      </section>

      <section className="profile-card">
        <h2>Contact Information</h2>

        <div className="profile-grid">

          <ProfileItem
            label="Personal Email"
            value={profile?.email_personal}
          />

          <ProfileItem
            label="Work Email"
            value={profile?.email_work}
          />

          <ProfileItem
            label="Mobile"
            value={profile?.mobile}
          />

        </div>
      </section>

    </main>
  );
};

const ProfileItem = ({ label, value }) => {
  return (
    <div className="profile-item">
      <span className="profile-label">{label}</span>

      <span className="profile-value">
        {value || "—"}
      </span>
    </div>
  );
};

export default MyProfile;