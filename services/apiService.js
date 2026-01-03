const BASE_URL = import.meta.env.VITE_BASE_URL;

export const api = {
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Unauthorized");
    }

    return res.json();
  },

  async registerUser(name, email, password) {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async getUser(id) {
    const res = await fetch(`${BASE_URL}/users/${id}`);
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async updateProfile(userId, data) {
    const res = await fetch(`${BASE_URL}/users/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify({
        id: userId,
        bio: data.bio,
        name: data.name
      })
    });
    return res.json();
  },

  async updateUserPfp(formData) {
    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // Clubs
  async getClubs() {
    const res = await fetch(`${BASE_URL}/clubs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async getClubById(id) {
    const res = await fetch(`${BASE_URL}/clubs/${id}`);
    return res.json();
  },

  async createClub(formData) {
    const res = await fetch(`${BASE_URL}/clubs`, {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  async updateClub(id, updates) {
    const res = await fetch(`${BASE_URL}/clubs/${id}`, {
      method: "POST",
      body: updates,
    });
    return res.json();
  },

  async transfereManager(id, newManagerId) {
    await fetch(`${BASE_URL}/clubs/${id}/${newManagerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  },

  async deleteClub(id) {
    await fetch(`${BASE_URL}/clubs/${id}`, { method: "DELETE" });
  },

  async getManagedClub(id) {
    const res = await fetch(`${BASE_URL}/clubs/manager/${id}`);
    return res.json();
  },

  async getActivities() {
    const res = await fetch(`${BASE_URL}/activities`);
    if (!res.ok) throw new Error("Failed to fetch activities");
    return res.json();
  },

  async getActivityById(id) {
    const res = await fetch(`${BASE_URL}/activities/${id}`);
    if (!res.ok) throw new Error("Activity not found");
    return res.json();
  },

  async createActivity(activityFormData) {
    const res = await fetch(`${BASE_URL}/activities`, {
      method: "POST",
      body: activityFormData,
    });
    return res.json();
  },

  async updateActivity(id, updates) {
    await fetch(`${BASE_URL}/activities/${id}`, {
      method: "POST",
      body: updates,
    });
  },

  async getRecentActivities() {
    try {
      const res = await fetch(`${BASE_URL}/activities/recent`, {
        method: "GET"
      });

      if (!res.ok) throw new Error('Network res was not ok');

      return await res.json();
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  async deleteActivity(id) {
    await fetch(`${BASE_URL}/activities/${id}`, { method: "DELETE" });
  },

  async getClubRegistrations(clubId) {
    const res = await fetch(`${BASE_URL}/registrations/club/${clubId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async getClubsRegistrations() {
    const res = await fetch(`${BASE_URL}/registrations/club}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async getStudentRegistrations(studentId) {
    const res = await fetch(`${BASE_URL}/registrations/student/${studentId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async registerStudent(studentId, clubId) {
    const res = await fetch(`${BASE_URL}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, clubId }),
    });
    return res.json();
  },

  async updateRegistrationStatus(studentId, clubId, status) {
    const res = await fetch(`${BASE_URL}/registrations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, clubId, status }),
    });
    return res.json();
  },

  async deleteRegistration(studentId, clubId) {
    const res = await fetch(`${BASE_URL}/registrations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, clubId }),
    });
    if (!res.ok) throw new Error("Failed to delete registration");
    return res.json();
  },

  async getNotifications(userId) {
    const res = await fetch(`${BASE_URL}/notifications/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  async addNotifications(type, senderId, receiverId, message) {
    const res = await fetch(`${BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type,
        senderId,
        receiverId,
        message
      })
    });

    return await res.json();
  },

  async deleteNotification(receiverId, notifId) {
    const res = await fetch(`${BASE_URL}/notifications/${receiverId}/${notifId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to delete notification");
    }

    return res.json();
  },

  async getSenderName(senderId) {
    const res = await fetch(`${BASE_URL}/notifications/sender/${senderId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to get sender name");
    }

    return res.json();
  },

  async getArchivedActivities() {
    const res = await fetch(`${BASE_URL}/archive/activities`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    return res.json();
  },

  async awardBadge(studentId, data) {
    const res = await fetch(`${BASE_URL}/badges/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, data })
    });
    return res.json();
  },

  async getBadges(userId) {
    const res = await fetch(`${BASE_URL}/badges/id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return res.json();
  }
};
