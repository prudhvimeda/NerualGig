export type ClientDashboard = {
  account: {
    name: string;
    avatar?: string;
    teams: number;
    activeProjects: number;
  };
  upcomingMilestones: Array<{
    projectId: string;
    projectName: string;
    dueDate: string;
    amount: number;
  }>;
  recommendations: Array<{
    id: string;
    name: string;
    role: string;
    score: number;
    tags: string[];
  }>;
};

export type ClientTalentRecommendation = {
  id: string;
  name: string;
  role: string;
  location: string;
  rate: number;
  score: number;
  tags: string[];
  summary: string;
};

export type ClientPaymentSchedule = {
  projectId: string;
  projectName: string;
  totalBudget: number;
  milestones: Array<{
    name: string;
    dueDate: string;
    amount: number;
    status: "pending" | "released" | "in-review";
  }>;
};

export type ClientProfile = {
  name: string;
  company: string;
  email: string;
  timezone: string;
  preferences: {
    hiringFocus: string[];
    communication: string;
  };
  billing: {
    currency: string;
    paymentMethod: string;
    invoices: number;
  };
  teams: number;
  activeProjects: number;
};

export type ProjectApplication = {
  id: string;
  projectName: string;
  submittedAt: string;
  status: "new" | "reviewing" | "accepted" | "rejected";
};

export type ClientApplication = ProjectApplication;

export type FreelancerDashboard = {
  profile: {
    name: string;
    role: string;
    focusAreas: string[];
    availableHours: number;
  };
  activeEngagements: Array<{
    projectId: string;
    title: string;
    client: string;
    progress: number;
    nextMilestone: string;
  }>;
  aiLearningPlan: {
    focusRole: string;
    summary: string;
    resources: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  };
};
